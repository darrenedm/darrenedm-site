import { ingredientSchema, type Ingredient, type Role, type Confidence } from "./schema";

type Opts = Partial<Pick<Ingredient, "flexible" | "assumedStocked" | "confidence" | "gramsPer">>;

/**
 * Terse constructor so the catalog reads as a table rather than 400 lines of
 * object literals. Every entry still goes through the schema at module load,
 * so a typo here is a startup error, not a wrong dinner.
 */
function ing(
  id: string,
  name: string,
  kcalPer100g: number,
  role: Role,
  shelfLifeDays: number,
  opts: Opts = {},
): Ingredient {
  return ingredientSchema.parse({ id, name, kcalPer100g, role, shelfLifeDays, ...opts });
}

const STAPLE: Opts = { assumedStocked: true };
const SPICE: Opts = { assumedStocked: true, confidence: "usda" as Confidence };

/**
 * Hand-seeded rather than generated. A small catalog you trust beats a large
 * one you don't — every figure here is either a USDA per-100g value or an
 * honest estimate, and `confidence` says which. The engine refuses to cost an
 * ingredient it doesn't know, so this file grows deliberately.
 */
export const CATALOG: Ingredient[] = [
  // ---- ballast: the only lever that meaningfully moves a calorie total ----
  ing("lavash", "Lavash", 280, "ballast", 10, {
    flexible: true,
    confidence: "estimated",
    gramsPer: { unit: 85 },
  }), // varies 50-110g a sheet; always prefer a pack figure
  ing("bread", "Bread", 265, "ballast", 7, { flexible: true }),
  ing("tortilla-flour", "Flour tortilla", 306, "ballast", 14, { flexible: true, gramsPer: { unit: 45 } }),
  ing("rice-white-raw", "White rice, raw", 365, "ballast", 730, { flexible: true, ...STAPLE }),
  ing("rice-white-cooked", "White rice, cooked", 130, "ballast", 4, { flexible: true }),
  ing("pasta-dry", "Pasta, dry", 371, "ballast", 730, { flexible: true, ...STAPLE }),
  ing("potato", "Potato", 77, "ballast", 30, { flexible: true }),
  ing("flour-plain", "Plain flour", 364, "ballast", 365, { flexible: true, ...STAPLE }),
  ing("chickpeas-canned", "Chickpeas, canned & drained", 121, "ballast", 730, { flexible: true }),
  ing("black-beans-canned", "Black beans, canned", 91, "ballast", 730, { flexible: true }),
  ing("lentils-cooked", "Lentils, cooked", 116, "ballast", 5, { flexible: true }),

  // ---- protein ----
  ing("chicken-thigh-bnls-sknls", "Chicken thighs, boneless skinless", 119, "protein", 3),
  ing("chicken-breast", "Chicken breast", 120, "protein", 3),
  ing("ground-beef-85", "Ground beef, 85% lean", 215, "protein", 3),
  ing("pork-belly", "Pork belly", 518, "protein", 4),
  ing("bacon", "Bacon", 541, "protein", 14),
  ing("salmon", "Salmon fillet", 208, "protein", 2),
  ing("egg", "Egg", 143, "protein", 28, { gramsPer: { unit: 50 } }),
  ing("tofu-firm", "Firm tofu", 144, "protein", 10),

  // ---- dairy ----
  ing("greek-yogurt-0", "Greek yogurt, 0%", 59, "dairy", 14),
  ing("greek-yogurt-5", "Greek yogurt, 5%", 97, "dairy", 14),
  ing("milk-whole", "Whole milk", 61, "dairy", 10),
  ing("butter", "Butter", 717, "fat", 60, { flexible: true, ...STAPLE }),
  ing("feta", "Feta", 264, "dairy", 21),
  ing("mozzarella", "Mozzarella", 300, "dairy", 14),
  ing("cheddar", "Cheddar", 403, "dairy", 30),
  ing("parmesan", "Parmesan", 431, "dairy", 90),

  // ---- fats: small weights, large numbers ----
  ing("olive-oil", "Olive oil", 884, "fat", 365, { flexible: true, ...STAPLE, gramsPer: { tsp: 4.5, tbsp: 13.5 } }),
  ing("sesame-oil", "Sesame oil", 884, "fat", 365, { flexible: true, ...STAPLE, gramsPer: { tsp: 4.5, tbsp: 13.5 } }),
  ing("mayonnaise", "Mayonnaise", 680, "fat", 60, { ...STAPLE }),
  ing("peanut-butter", "Peanut butter", 588, "fat", 180, { ...STAPLE }),

  // ---- produce ----
  ing("napa-cabbage", "Napa cabbage", 16, "produce", 21),
  ing("carrot", "Carrot", 41, "produce", 30, { gramsPer: { unit: 70 } }),
  ing("tomato", "Tomato", 18, "produce", 7, { gramsPer: { unit: 120 } }),
  ing("arugula", "Arugula", 25, "produce", 5),
  ing("spinach", "Spinach", 23, "produce", 6),
  ing("cucumber", "Cucumber", 15, "produce", 10),
  ing("bell-pepper", "Bell pepper", 31, "produce", 12),
  ing("broccoli", "Broccoli", 34, "produce", 8),
  ing("mushroom-cremini", "Cremini mushrooms", 22, "produce", 7),
  ing("avocado", "Avocado", 160, "produce", 5),
  ing("lemon", "Lemon", 29, "produce", 21, { gramsPer: { unit: 80 } }),
  ing("kimchi", "Kimchi", 23, "produce", 180),

  // ---- aromatics & herbs ----
  ing("red-onion", "Red onion", 40, "aromatic", 45, { gramsPer: { unit: 110 } }),
  ing("yellow-onion", "Yellow onion", 40, "aromatic", 60, { gramsPer: { unit: 110 } }),
  ing("green-onion", "Green onion", 32, "aromatic", 8),
  ing("garlic", "Garlic", 149, "aromatic", 90, { gramsPer: { unit: 3 } }),
  ing("ginger", "Ginger", 80, "aromatic", 21),
  ing("dill", "Dill", 43, "produce", 5),

  // ---- seasoning: assumed stocked, and collectively rounding error ----
  ing("salt", "Salt", 0, "seasoning", 3650, SPICE),
  ing("black-pepper", "Black pepper", 251, "seasoning", 730, { ...SPICE, gramsPer: { tsp: 2 } }),
  ing("cumin-ground", "Ground cumin", 375, "seasoning", 730, { ...SPICE, gramsPer: { tsp: 2 } }),
  ing("paprika", "Paprika", 282, "seasoning", 730, { ...SPICE, gramsPer: { tsp: 2.3 } }),
  ing("cinnamon-ground", "Ground cinnamon", 247, "seasoning", 730, { ...SPICE, gramsPer: { tsp: 2.6 } }),
  ing("coriander-ground", "Ground coriander", 298, "seasoning", 730, { ...SPICE, gramsPer: { tsp: 2 } }),
  ing("turmeric", "Turmeric", 312, "seasoning", 730, { ...SPICE, gramsPer: { tsp: 3 } }),
  ing("allspice", "Allspice", 263, "seasoning", 730, { ...SPICE, gramsPer: { tsp: 2 } }),
  ing("oregano-dried", "Dried oregano", 265, "seasoning", 730, { ...SPICE, gramsPer: { tsp: 1 } }),
  ing("chili-flakes", "Chili flakes", 282, "seasoning", 730, { ...SPICE, gramsPer: { tsp: 1.8 } }),
  ing("sesame-seeds", "Sesame seeds", 573, "seasoning", 365, { ...SPICE, gramsPer: { tsp: 3 } }),
  ing("soy-sauce", "Soy sauce", 53, "seasoning", 365, SPICE),
  ing("gochujang", "Gochujang", 214, "seasoning", 365, SPICE),
  ing("vinegar", "Vinegar", 20, "seasoning", 730, SPICE),
  ing("mustard", "Mustard", 66, "seasoning", 365, SPICE),
  ing("honey", "Honey", 304, "seasoning", 730, SPICE),
  ing("white-wine", "White wine", 82, "seasoning", 5),
  ing("red-wine", "Red wine", 85, "seasoning", 5),

  // ---- nuts ----
  ing("almonds", "Almonds", 579, "seasoning", 180),
  ing("walnuts", "Walnuts", 654, "seasoning", 180),
  ing("pine-nuts", "Pine nuts", 673, "seasoning", 120),
];

const byId = new Map(CATALOG.map((i) => [i.id, i]));

/** Duplicate ids would silently shadow each other. Fail at import instead. */
if (byId.size !== CATALOG.length) {
  const seen = new Set<string>();
  const dupes = CATALOG.map((i) => i.id).filter((id) => (seen.has(id) ? true : (seen.add(id), false)));
  throw new Error(`catalog has duplicate ids: ${[...new Set(dupes)].join(", ")}`);
}

export function lookup(id: string): Ingredient | undefined {
  return byId.get(id);
}

export const CATALOG_SIZE = CATALOG.length;
