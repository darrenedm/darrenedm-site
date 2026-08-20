import { CATALOG, lookup } from "./catalog";
import { cost, deriveServings, kitchenKcal, UnknownIngredientError } from "./cost";
import {
  NEW_BUDGET,
  recipeDraftSchema,
  type CostedRecipe,
  type Kitchen,
  type MealRequest,
  type RecipeDraft,
} from "./schema";

const DAY_MS = 86_400_000;

/** Shelf life is stored on the catalog and the purchase date on the item, so
 * urgency is always derived. Storing "expiring: true" would go stale silently. */
export function daysLeft(addedAt: string, shelfLifeDays: number, asOf: Date): number {
  const elapsed = Math.floor((asOf.getTime() - new Date(addedAt).getTime()) / DAY_MS);
  return shelfLifeDays - elapsed;
}

export interface PantryEntry {
  ingredientId: string;
  daysLeft: number;
  /** True when the item is only presumed present (a spice), not explicitly stocked. */
  assumed: boolean;
}

export interface ResolvedPantry {
  /** Everything the model may reach for. */
  available: string[];
  /** Explicitly stocked items, most urgent first. */
  perishing: PantryEntry[];
  /** Presumed-stocked staples the user has never confirmed either way. */
  unconfirmed: string[];
  denied: string[];
}

/**
 * "A bunch of condiments, basically everything" is unmodellable text, and
 * assuming it produced a real failure — recommending yogurt as a new hero
 * ingredient when it was already in the fridge. So assumed staples are
 * available but flagged, and a denial is remembered rather than re-guessed.
 */
export function resolvePantry(kitchen: Kitchen, asOf: Date = new Date()): ResolvedPantry {
  const denied = new Set(kitchen.pantryDenied);
  const stocked = new Set(kitchen.items.map((i) => i.ingredientId));

  const perishing: PantryEntry[] = kitchen.items
    .map((item) => {
      const ing = lookup(item.ingredientId);
      if (!ing) throw new UnknownIngredientError(item.ingredientId);
      return {
        ingredientId: item.ingredientId,
        daysLeft: daysLeft(item.addedAt, ing.shelfLifeDays, asOf),
        assumed: false,
      };
    })
    .filter((e) => !denied.has(e.ingredientId))
    // stable sort: ties keep inventory order, so picks are reproducible
    .sort((a, b) => a.daysLeft - b.daysLeft);

  const assumedIds: string[] = [];
  const unconfirmed: string[] = [];
  for (const ing of CATALOG) {
    if (!ing.assumedStocked || denied.has(ing.id) || stocked.has(ing.id)) continue;
    assumedIds.push(ing.id);
    if (!kitchen.pantryConfirmed.includes(ing.id)) unconfirmed.push(ing.id);
  }

  return {
    available: [...perishing.map((e) => e.ingredientId), ...assumedIds],
    perishing,
    unconfirmed,
    denied: [...denied],
  };
}

export interface Remedy {
  kind: "raise-mode" | "lower-target" | "fewer-eaters" | "shop";
  detail: string;
}

export type Feasibility =
  | { feasible: true; availableKcal: number; requiredKcal: number; headroom: number; warning?: string }
  | {
      feasible: false;
      availableKcal: number;
      requiredKcal: number;
      shortfall: number;
      options: Remedy[];
    };

/**
 * Runs BEFORE the model is called, never after. The test kitchen held ~2,200
 * usable kcal, half of it bread — pantry-raid at 650 works twice and then
 * doesn't. Discovering that after generating a recipe means throwing the
 * recipe away and having nothing to tell the user.
 */
export function checkFeasible(
  kitchen: Kitchen,
  request: MealRequest,
  asOf: Date = new Date(),
): Feasibility {
  // Food past its date is not food. Counting it would let a fridge of spoiled
  // produce pass a feasibility check it should fail.
  const usable = {
    ...kitchen,
    items: kitchen.items.filter((item) => {
      const ing = lookup(item.ingredientId);
      if (!ing) throw new UnknownIngredientError(item.ingredientId);
      return daysLeft(item.addedAt, ing.shelfLifeDays, asOf) > 0;
    }),
  };
  const availableKcal = kitchenKcal(usable);
  const requiredKcal = request.eaters * request.kcalTarget;
  const budget = NEW_BUDGET[request.mode];

  if (budget === 0 && availableKcal < requiredKcal) {
    const shortfall = requiredKcal - availableKcal;
    return {
      feasible: false,
      availableKcal,
      requiredKcal,
      shortfall,
      options: [
        { kind: "raise-mode", detail: `one-hero allows a single new ingredient to cover ${Math.round(shortfall)} kcal` },
        { kind: "lower-target", detail: `${Math.floor(availableKcal / request.eaters)} kcal a head is achievable from what's in` },
        { kind: "fewer-eaters", detail: `enough here for ${Math.max(1, Math.floor(availableKcal / request.kcalTarget))} at the target` },
        { kind: "shop", detail: "the kitchen genuinely does not hold a meal this size" },
      ],
    };
  }

  const headroom = availableKcal - requiredKcal;
  // A bounded budget can still be asked to do implausible lifting.
  const warning =
    Number.isFinite(budget) && budget > 0 && availableKcal < requiredKcal * 0.4
      ? `only ${Math.round(availableKcal)} kcal in the kitchen against ${requiredKcal} needed — ` +
        `${budget} new ingredient${budget > 1 ? "s" : ""} would be carrying most of the meal`
      : undefined;

  return { feasible: true, availableKcal, requiredKcal, headroom, warning };
}

/**
 * Clear-out mode's must-use set is chosen, not asked for — that is the whole
 * point of the mode. Everything else takes the user's pins as given.
 */
export function selectMustUse(
  kitchen: Kitchen,
  request: MealRequest,
  asOf: Date = new Date(),
): { ids: string[]; urgent: boolean } {
  if (request.mode !== "clear-out") {
    const stocked = new Set(kitchen.items.map((i) => i.ingredientId));
    const missing = request.mustUse.filter((id) => !stocked.has(id));
    if (missing.length) {
      throw new Error(`cannot must-use ${missing.join(", ")} — not in the kitchen`);
    }
    return { ids: request.mustUse, urgent: false };
  }

  const pinned = kitchen.items.filter((i) => i.mustUse).map((i) => i.ingredientId);
  const byUrgency = resolvePantry(kitchen, asOf).perishing;
  const picks = [...new Set([...pinned, ...byUrgency.slice(0, 2).map((e) => e.ingredientId)])].slice(0, 2);
  const urgent = byUrgency.slice(0, 2).every((e) => e.daysLeft <= 3);
  return { ids: picks, urgent };
}

export interface SolvePlan {
  request: MealRequest;
  feasibility: Feasibility;
  newIngredientBudget: number;
  mustUse: string[];
  mustUseIsAutomatic: boolean;
  available: string[];
  excluded: string[];
  /** Handed to the prompt so the model knows what is about to go off. */
  expiring: PantryEntry[];
}

/** Everything that happens before the model is called. */
export function plan(kitchen: Kitchen, request: MealRequest, asOf: Date = new Date()): SolvePlan {
  const pantry = resolvePantry(kitchen, asOf);
  const feasibility = checkFeasible(kitchen, request, asOf);
  const must = selectMustUse(kitchen, request, asOf);
  const excluded = new Set(request.exclude);

  return {
    request,
    feasibility,
    newIngredientBudget: NEW_BUDGET[request.mode],
    mustUse: must.ids,
    mustUseIsAutomatic: request.mode === "clear-out",
    available: pantry.available.filter((id) => !excluded.has(id)),
    excluded: [...excluded],
    expiring: pantry.perishing.filter((e) => e.daysLeft <= 3),
  };
}

export interface Adjustment {
  ingredientId: string;
  section: string;
  fromGrams: number;
  toGrams: number;
  deltaKcal: number;
}

export interface TuneResult {
  draft: RecipeDraft;
  costed: CostedRecipe;
  adjustments: Adjustment[];
  /** Calories the clamps could not absorb. Zero means the target was hit exactly. */
  residualKcal: number;
}

/** No single quantity moves more than this — a recipe tuned past it stops
 * being the recipe the model wrote. */
const CLAMP = 0.35;

/**
 * Servings are fixed from the UNTUNED total first: the food you have decides
 * how many meals it is, and only then does tuning make each meal hit the
 * number. Deriving servings after tuning would let the two chase each other.
 */
export function tune(
  draft: RecipeDraft,
  opts: { kitchen?: Kitchen; kcalTarget?: number; eaters?: number; mustUse?: string[] } = {},
): TuneResult {
  const { kitchen, kcalTarget = 650, eaters = 2, mustUse = [] } = opts;
  const raw = cost(draft, { kitchen, kcalTarget, eaters });
  const servings = deriveServings(raw.totalKcal, kcalTarget, eaters);
  const goal = servings * kcalTarget;
  const gap = goal - raw.totalKcal;

  const fixed = new Set(mustUse);
  const adjustableIdx = draft.uses
    .map((use, i) => ({ use, i }))
    .filter(({ use }) => {
      if (use.grams == null) return false; // unit-priced items aren't divisible
      if (fixed.has(use.ingredientId)) return false; // must-finish means finish it
      return lookup(use.ingredientId)?.flexible === true;
    });

  const kcalOf = (i: number) => raw.ledger[i].kcal;
  const pool = adjustableIdx.reduce((n, { i }) => n + kcalOf(i), 0);

  if (pool === 0 || Math.abs(gap) < 1) {
    return { draft, costed: raw, adjustments: [], residualKcal: gap };
  }

  const scale = Math.min(1 + CLAMP, Math.max(1 - CLAMP, (pool + gap) / pool));
  const uses = draft.uses.map((u) => ({ ...u }));
  const adjustments: Adjustment[] = [];

  for (const { use, i } of adjustableIdx) {
    const from = use.grams as number;
    const to = Math.round(from * scale * 10) / 10;
    if (to === from) continue;
    uses[i] = { ...uses[i], grams: to };
    adjustments.push({
      ingredientId: use.ingredientId,
      section: use.section,
      fromGrams: from,
      toGrams: to,
      deltaKcal: kcalOf(i) * (scale - 1),
    });
  }

  const tuned = recipeDraftSchema.parse({ ...draft, uses });
  const costed = cost(tuned, { kitchen, kcalTarget, eaters });
  return { draft: tuned, costed, adjustments, residualKcal: goal - costed.totalKcal };
}

/** Everything that happens after the model returns. */
export function finalize(
  draft: RecipeDraft,
  plan: SolvePlan,
  kitchen?: Kitchen,
): TuneResult {
  return tune(draft, {
    kitchen,
    kcalTarget: plan.request.kcalTarget,
    eaters: plan.request.eaters,
    mustUse: plan.mustUse,
  });
}
