import { recipeDraftSchema, kitchenSchema, type Kitchen, type RecipeDraft } from "../schema";

/**
 * The lavash börek coil, as actually written and costed in August 2026.
 *
 * This is the engine's acceptance fixture, not a demo. It exists because the
 * dish was costed three times by hand and came out at 630, then 790, then
 * 1,583 — the drift was always fats and binders arriving with the written
 * recipe that the dish *idea* never accounted for. If the engine reproduces
 * the final line-by-line figure, the hardest correctness problem in the
 * project is solved.
 */
export const borekDraft: RecipeDraft = recipeDraftSchema.parse({
  title: "Lavash Börek Coil",
  blurb:
    "Spiced chicken and cabbage rolled into lavash, coiled like a snail, " +
    "lacquered with egg and yogurt, baked until it shatters.",
  uses: [
    // --- filling ---
    { ingredientId: "chicken-thigh-bnls-sknls", grams: 454, section: "filling", prep: "diced 1cm" },
    { ingredientId: "napa-cabbage", grams: 200, section: "filling", prep: "shredded, salted, wrung out" },
    { ingredientId: "carrot", grams: 70, section: "filling", prep: "coarsely grated" },
    { ingredientId: "red-onion", grams: 82, section: "filling", prep: "finely diced" },
    { ingredientId: "garlic", grams: 9, section: "filling", prep: "grated" },
    { ingredientId: "cumin-ground", grams: 4, section: "filling" },
    { ingredientId: "paprika", grams: 4.6, section: "filling" },
    { ingredientId: "cinnamon-ground", grams: 1.3, section: "filling" },
    { ingredientId: "black-pepper", grams: 2, section: "filling" },
    { ingredientId: "olive-oil", grams: 9, section: "filling" },
    { ingredientId: "white-wine", grams: 18, section: "filling", prep: "cooked down" },
    { ingredientId: "dill", grams: 15, section: "filling", prep: "chopped" },
    { ingredientId: "green-onion", grams: 25, section: "filling", prep: "sliced" },
    { ingredientId: "egg", grams: 50, section: "filling" },
    { ingredientId: "greek-yogurt-0", grams: 35, section: "filling" },
    // --- assembly & wash ---
    { ingredientId: "lavash", units: 3, section: "assembly" },
    { ingredientId: "egg", grams: 50, section: "assembly" },
    { ingredientId: "greek-yogurt-0", grams: 50, section: "assembly" },
    { ingredientId: "olive-oil", grams: 4.5, section: "assembly" },
    { ingredientId: "sesame-seeds", grams: 3, section: "assembly" },
    // --- sides ---
    { ingredientId: "greek-yogurt-0", grams: 250, section: "sides" },
    { ingredientId: "garlic", grams: 3, section: "sides" },
    { ingredientId: "lemon", grams: 20, section: "sides" },
    { ingredientId: "arugula", grams: 60, section: "sides" },
    { ingredientId: "tomato", grams: 150, section: "sides" },
    { ingredientId: "carrot", grams: 50, section: "sides" },
    { ingredientId: "napa-cabbage", grams: 100, section: "sides" },
    { ingredientId: "red-onion", grams: 28, section: "sides" },
    { ingredientId: "olive-oil", grams: 18, section: "sides" },
  ],
  steps: [
    { title: "Salt the cabbage first", minutes: 2, body: "Shred fine, toss with a teaspoon of salt, leave in a colander.", why: "It needs fifteen minutes to give up its water, and that fifteen minutes is free." },
    { title: "Dice and salt the chicken", minutes: 5, body: "One-centimetre dice. Anything bigger punctures the lavash when you roll it." },
    { title: "Brown it hard, in two batches", minutes: 10, body: "A pound will not fit in one layer, and crowding it means grey chicken.", why: "This is the only browning the dish gets; the oven does nothing for what's inside." },
    { title: "Build the base", minutes: 6, body: "Onion and carrot, then garlic and spices, then wine — scrape and cook dry." },
    { title: "Wring out the cabbage, wilt it in", minutes: 3, body: "Twist it in a tea towel until it stops dripping, then two minutes in the pan.", why: "Unsqueezed, it is a slow-release water bomb inside a pastry." },
    { title: "Cool completely", minutes: 15, body: "Spread thin to drop temperature fast, then fold through dill, green onion, egg and yogurt.", why: "Warm filling steams the lavash from the inside and it tears as you roll." },
    { title: "Damp the lavash, heat the oven", minutes: 2, body: "Flick water across all three sheets, cover with a damp towel. Oven to 200°C." },
    { title: "Roll three cigars", minutes: 7, body: "Filling in a line along the long edge, 2cm border, roll tight and even." },
    { title: "Coil it", minutes: 3, body: "Start in the dead centre of a 26cm pan and wind outward, coils touching." },
    { title: "Wash and seed", minutes: 2, body: "Egg, yogurt and a teaspoon of oil, pushed down into every seam. Sesame on top.", why: "The yogurt is what gives börek a lacquered top instead of a flat egg shine." },
    { title: "Bake", minutes: 32, body: "Until deep golden and the surface looks varnished rather than pale." },
    { title: "Rest, then cut into six", minutes: 10, body: "Ten minutes, no less. Cut it like a cake." },
  ],
  risks: [
    { title: "Cold filling, always", body: "Warm filling steams the lavash from the inside and it tears the moment you roll it." },
    { title: "Damp the bread first", body: "Dry lavash cracks along the fold. Flick water over it and cover for two minutes." },
    { title: "Squeeze the cabbage", body: "Salted napa throws an astonishing amount of water. Wring it out until it stops dripping." },
    { title: "Rest before cutting", body: "Cut it hot and the spiral unwinds into a pile of separate cigars." },
  ],
});

/**
 * The kitchen it was cooked from. The lavash override is the whole reason
 * this field exists: the packet said 180 kcal a sheet at 76g, where the
 * catalog's generic figure would have said 213.
 */
export const borekKitchen: Kitchen = kitchenSchema.parse({
  updatedAt: "2026-08-19",
  items: [
    {
      ingredientId: "lavash",
      qty: { count: 3 },
      addedAt: "2026-08-17",
      mustUse: true,
      kcalOverride: { per: "unit", value: 180, source: "pack", gramsPerUnit: 76 },
    },
    { ingredientId: "chicken-thigh-bnls-sknls", qty: { grams: 454 }, addedAt: "2026-08-17", mustUse: true },
    { ingredientId: "lemon", qty: { grams: 40 }, addedAt: "2026-08-14", mustUse: true },
    { ingredientId: "napa-cabbage", qty: { grams: 600 }, addedAt: "2026-08-14" },
    { ingredientId: "kimchi", qty: { grams: 300 }, addedAt: "2026-07-20" },
    { ingredientId: "carrot", qty: { count: 3 }, addedAt: "2026-08-14" },
    { ingredientId: "red-onion", qty: { count: 1 }, addedAt: "2026-08-14" },
    { ingredientId: "dill", qty: { grams: 25 }, addedAt: "2026-08-15" },
    { ingredientId: "arugula", qty: { grams: 80 }, addedAt: "2026-08-15" },
    { ingredientId: "tomato", qty: { count: 2 }, addedAt: "2026-08-15" },
    { ingredientId: "green-onion", qty: { grams: 30 }, addedAt: "2026-08-14" },
    { ingredientId: "egg", qty: { count: 6 }, addedAt: "2026-08-10" },
    { ingredientId: "greek-yogurt-0", qty: { grams: 500 }, addedAt: "2026-08-12" },
  ],
});

/** The published figures this fixture must reproduce. */
export const BOREK_PUBLISHED = {
  coilKcal: 1583,
  totalKcal: 1989,
  servingsAt650: 3,
  lavashPerSheet: 180,
} as const;
