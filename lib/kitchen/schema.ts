import { z } from "zod";

/**
 * Roles exist for one reason: the solver only ever tunes a handful of
 * ingredients to hit a calorie target, and it needs to know which ones.
 * Costing the börek showed why — bread and chicken were 34% of the dish
 * each, while 600g of vegetables, every spice and all the yogurt made up
 * the remaining third. Flavour is close to free; ballast is the whole dial.
 */
export const ROLES = [
  "ballast",
  "protein",
  "produce",
  "dairy",
  "fat",
  "aromatic",
  "seasoning",
] as const;
export type Role = (typeof ROLES)[number];

/**
 * Where a number came from, surfaced to the reader rather than hidden.
 * "pack" beats everything: generic lavash is ~280 kcal/100g but the actual
 * packet said 180 a sheet — 237/100g — and applying the generic figure
 * overstated the dish by 98 kcal.
 */
export const CONFIDENCE = ["pack", "weighed", "usda", "estimated"] as const;
export type Confidence = (typeof CONFIDENCE)[number];

export const ingredientSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  kcalPer100g: z.number().nonnegative(),
  role: z.enum(ROLES),
  /** May the solver adjust this quantity to reach a target? Oil and rice yes, dill no. */
  flexible: z.boolean().default(false),
  /** Days from purchase before it needs using. Drives clear-out mode. */
  shelfLifeDays: z.number().int().positive(),
  /** Spices, condiments, oil — presumed present until the user says otherwise. */
  assumedStocked: z.boolean().default(false),
  confidence: z.enum(CONFIDENCE).default("usda"),
  /** Grams per common measure, so a draft can say "2 tsp" and still be costed. */
  gramsPer: z
    .object({
      tsp: z.number().positive().optional(),
      tbsp: z.number().positive().optional(),
      unit: z.number().positive().optional(),
    })
    .optional(),
});
export type Ingredient = z.infer<typeof ingredientSchema>;

/**
 * A pack figure the user typed in or scanned. Overrides the catalog rate
 * for this kitchen only — the catalog stays generic, this gets specific.
 */
export const kcalOverrideSchema = z.object({
  per: z.enum(["unit", "100g"]),
  value: z.number().positive(),
  source: z.literal("pack"),
  /** Real weight of one unit, when the pack states it. Keeps the grams column honest. */
  gramsPerUnit: z.number().positive().optional(),
});

export const inventoryItemSchema = z.object({
  ingredientId: z.string().min(1),
  qty: z.object({
    grams: z.number().positive().optional(),
    count: z.number().positive().optional(),
    note: z.string().optional(),
  }),
  /** ISO date. Perishability is derived from this, never stored as a flag. */
  addedAt: z.string(),
  mustUse: z.boolean().default(false),
  kcalOverride: kcalOverrideSchema.optional(),
});
export type InventoryItem = z.infer<typeof inventoryItemSchema>;

/**
 * pantryConfirmed / pantryDenied are the fix for a real failure: yogurt was
 * recommended as a "new hero" ingredient when it was already in the fridge,
 * because "a bunch of condiments, basically everything" is unmodellable text.
 * Assumptions get corrected once and then remembered.
 */
export const kitchenSchema = z.object({
  items: z.array(inventoryItemSchema),
  pantryConfirmed: z.array(z.string()).default([]),
  pantryDenied: z.array(z.string()).default([]),
  updatedAt: z.string(),
});
export type Kitchen = z.infer<typeof kitchenSchema>;

export const MODES = ["pantry-raid", "one-hero", "round-out", "clear-out"] as const;
export type Mode = (typeof MODES)[number];

/** New-ingredient budget per mode. Four products, one code path. */
export const NEW_BUDGET: Record<Mode, number> = {
  "pantry-raid": 0,
  "one-hero": 1,
  "round-out": 3,
  "clear-out": Infinity,
};

export const mealRequestSchema = z.object({
  mode: z.enum(MODES),
  kcalTarget: z.number().positive().default(650),
  /** People at the table. NOT servings — servings are derived from the food. */
  eaters: z.number().int().positive().default(2),
  mustUse: z.array(z.string()).default([]),
  exclude: z.array(z.string()).default([]),
});
export type MealRequest = z.infer<typeof mealRequestSchema>;

const useSchema = z
  .object({
    ingredientId: z.string().min(1),
    grams: z.number().positive().optional(),
    units: z.number().positive().optional(),
    prep: z.string().optional(),
    section: z.string().default("main"),
    hero: z.boolean().default(false),
  })
  .refine((v) => (v.grams != null) !== (v.units != null), {
    message: "specify exactly one of grams or units",
  });

/**
 * What the model returns — and note what is absent. There is no calorie
 * field anywhere in this type. Not discouraged, not validated against:
 * no slot exists, so the model cannot report a number it was never given
 * a place to put. .strict() makes an attempt to add one fail loudly rather
 * than get silently stripped.
 */
export const recipeDraftSchema = z
  .object({
    title: z.string().min(1),
    blurb: z.string().min(1),
    uses: z.array(useSchema).min(1),
    steps: z
      .array(
        z.object({
          title: z.string().min(1),
          body: z.string().min(1),
          minutes: z.number().nonnegative(),
          why: z.string().optional(),
        }),
      )
      .min(1),
    risks: z
      .array(z.object({ title: z.string().min(1), body: z.string().min(1) }))
      .default([]),
  })
  .strict();
export type RecipeDraft = z.infer<typeof recipeDraftSchema>;

export interface LedgerLine {
  ingredientId: string;
  name: string;
  role: Role;
  section: string;
  grams: number;
  kcal: number;
  confidence: Confidence;
}

export interface CostedRecipe {
  draft: RecipeDraft;
  ledger: LedgerLine[];
  totalKcal: number;
  /** Subtotals in draft order, so "the coil" and "the sides" stay separable. */
  sections: { name: string; kcal: number }[];
  byRole: Record<Role, number>;
  servings: number;
  kcalPerServing: number;
  withinTarget: boolean;
  /**
   * Calories grouped by where their RATE came from — not by how precisely the
   * quantity was measured. Those are different axes and conflating them
   * produces a confident-looking number that means nothing.
   */
  confidenceMix: Record<Confidence, number>;
}
