import { CATALOG, lookup } from "./catalog";
import type {
  Confidence,
  CostedRecipe,
  Ingredient,
  Kitchen,
  LedgerLine,
  RecipeDraft,
  Role,
} from "./schema";
import { CONFIDENCE, ROLES } from "./schema";

/**
 * Refusing to cost an unknown ingredient is the point, not an inconvenience.
 * A guessed rate is indistinguishable from a real one once it's in the ledger,
 * so the catalog is forced to stay complete instead of quietly degrading.
 */
export class UnknownIngredientError extends Error {
  constructor(readonly ingredientId: string) {
    super(
      `"${ingredientId}" is not in the catalog. Add it to lib/kitchen/catalog.ts ` +
        `with a real kcal/100g figure — the engine will not estimate one.`,
    );
    this.name = "UnknownIngredientError";
  }
}

export class UncostableQuantityError extends Error {
  constructor(id: string, detail: string) {
    super(`cannot resolve a weight for "${id}": ${detail}`);
    this.name = "UncostableQuantityError";
  }
}

interface Rate {
  kcalPer100g: number;
  kcalPerUnit?: number;
  gramsPerUnit?: number;
  confidence: Confidence;
}

/**
 * A pack figure always wins. Generic lavash is ~280 kcal/100g; the packet in
 * the actual test kitchen said 180 a sheet, which is 237/100g. Using the
 * generic number overstated that dish by 98 kcal, and no amount of care
 * elsewhere in the pipeline recovers that.
 */
function rateFor(ingredient: Ingredient, kitchen?: Kitchen): Rate {
  const override = kitchen?.items.find(
    (i) => i.ingredientId === ingredient.id && i.kcalOverride,
  )?.kcalOverride;

  if (override?.per === "unit") {
    return {
      kcalPer100g: ingredient.kcalPer100g,
      kcalPerUnit: override.value,
      gramsPerUnit: override.gramsPerUnit ?? ingredient.gramsPer?.unit,
      confidence: "pack",
    };
  }
  if (override?.per === "100g") {
    return {
      kcalPer100g: override.value,
      gramsPerUnit: ingredient.gramsPer?.unit,
      confidence: "pack",
    };
  }
  return {
    kcalPer100g: ingredient.kcalPer100g,
    gramsPerUnit: ingredient.gramsPer?.unit,
    confidence: ingredient.confidence,
  };
}

/**
 * Servings fall out of the food, they are not asked for. Nobody knows how many
 * portions a pack of chicken makes — they know who is eating. Fixing servings
 * as an input turns every "finish what's open" request into a false infeasible.
 */
export function deriveServings(totalKcal: number, kcalTarget: number, eaters: number): number {
  return Math.max(eaters, Math.max(1, Math.round(totalKcal / kcalTarget)));
}

export interface CostOptions {
  kitchen?: Kitchen;
  kcalTarget?: number;
  eaters?: number;
  /** How far off target a serving may land and still count as a hit. */
  tolerance?: number;
}

export function cost(draft: RecipeDraft, opts: CostOptions = {}): CostedRecipe {
  const { kitchen, kcalTarget = 650, eaters = 2, tolerance = 0.15 } = opts;

  const ledger: LedgerLine[] = draft.uses.map((use) => {
    const ingredient = lookup(use.ingredientId);
    if (!ingredient) throw new UnknownIngredientError(use.ingredientId);
    const rate = rateFor(ingredient, kitchen);

    let grams: number;
    let kcal: number;

    if (use.grams != null) {
      grams = use.grams;
      kcal = (grams * rate.kcalPer100g) / 100;
    } else {
      const units = use.units as number;
      if (rate.kcalPerUnit != null) {
        kcal = units * rate.kcalPerUnit;
        grams = rate.gramsPerUnit != null ? units * rate.gramsPerUnit : NaN;
      } else if (rate.gramsPerUnit != null) {
        grams = units * rate.gramsPerUnit;
        kcal = (grams * rate.kcalPer100g) / 100;
      } else {
        throw new UncostableQuantityError(
          use.ingredientId,
          "given in units, but neither the catalog nor a pack figure defines a unit weight",
        );
      }
    }

    return {
      ingredientId: ingredient.id,
      name: ingredient.name,
      role: ingredient.role,
      section: use.section,
      grams,
      kcal,
      confidence: rate.confidence,
    };
  });

  const totalKcal = ledger.reduce((n, l) => n + l.kcal, 0);

  const sectionOrder: string[] = [];
  const sectionTotals = new Map<string, number>();
  for (const l of ledger) {
    if (!sectionTotals.has(l.section)) sectionOrder.push(l.section);
    sectionTotals.set(l.section, (sectionTotals.get(l.section) ?? 0) + l.kcal);
  }

  const byRole = Object.fromEntries(ROLES.map((r) => [r, 0])) as Record<Role, number>;
  for (const l of ledger) byRole[l.role] += l.kcal;

  const confidenceMix = Object.fromEntries(CONFIDENCE.map((c) => [c, 0])) as Record<
    Confidence,
    number
  >;
  for (const l of ledger) confidenceMix[l.confidence] += l.kcal;

  const servings = deriveServings(totalKcal, kcalTarget, eaters);
  const kcalPerServing = totalKcal / servings;

  return {
    draft,
    ledger,
    totalKcal,
    sections: sectionOrder.map((name) => ({ name, kcal: sectionTotals.get(name) as number })),
    byRole,
    servings,
    kcalPerServing,
    withinTarget: Math.abs(kcalPerServing - kcalTarget) / kcalTarget <= tolerance,
    confidenceMix,
  };
}

/** Total calories available in a kitchen — the input to a feasibility check. */
export function kitchenKcal(kitchen: Kitchen): number {
  return kitchen.items.reduce((n, item) => {
    const ingredient = lookup(item.ingredientId);
    if (!ingredient) throw new UnknownIngredientError(item.ingredientId);
    const rate = rateFor(ingredient, kitchen);
    if (item.qty.grams != null) return n + (item.qty.grams * rate.kcalPer100g) / 100;
    if (item.qty.count != null) {
      if (rate.kcalPerUnit != null) return n + item.qty.count * rate.kcalPerUnit;
      if (rate.gramsPerUnit != null)
        return n + (item.qty.count * rate.gramsPerUnit * rate.kcalPer100g) / 100;
    }
    return n; // a "bit of" something contributes nothing until it's quantified
  }, 0);
}

export { CATALOG };
