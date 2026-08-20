import { describe, it, expect } from "vitest";
import { cost, deriveServings, kitchenKcal, UnknownIngredientError } from "./cost";
import { CATALOG, lookup } from "./catalog";
import { recipeDraftSchema } from "./schema";
import { borekDraft, borekKitchen, BOREK_PUBLISHED } from "./fixtures/borek";

const coil = (r: ReturnType<typeof cost>) =>
  r.sections.filter((s) => s.name !== "sides").reduce((n, s) => n + s.kcal, 0);

describe("costing the börek", () => {
  const result = cost(borekDraft, { kitchen: borekKitchen, kcalTarget: 650, eaters: 2 });

  it("reproduces the published coil total", () => {
    expect(Math.round(coil(result))).toBeCloseTo(BOREK_PUBLISHED.coilKcal, -1);
    expect(Math.abs(coil(result) - BOREK_PUBLISHED.coilKcal)).toBeLessThanOrEqual(2);
  });

  it("reproduces the published grand total", () => {
    expect(Math.abs(result.totalKcal - BOREK_PUBLISHED.totalKcal)).toBeLessThanOrEqual(2);
  });

  it("derives 3 servings rather than taking a number on faith", () => {
    expect(result.servings).toBe(BOREK_PUBLISHED.servingsAt650);
    expect(Math.round(result.kcalPerServing)).toBe(663);
    expect(result.withinTarget).toBe(true);
  });

  it("splits into the three sections the recipe was written in", () => {
    expect(result.sections.map((s) => s.name)).toEqual(["filling", "assembly", "sides"]);
    const [filling, assembly, sides] = result.sections;
    expect(Math.round(filling.kcal)).toBe(884);
    expect(Math.round(assembly.kcal)).toBe(698);
    expect(Math.round(sides.kcal)).toBe(407);
  });

  it("shows two ingredients deciding the calorie count", () => {
    const c = coil(result);
    const of = (id: string) =>
      result.ledger.filter((l) => l.ingredientId === id).reduce((n, l) => n + l.kcal, 0);

    // bread and chicken land within a percentage point of each other
    expect(of("lavash") / c).toBeCloseTo(0.34, 2);
    expect(of("chicken-thigh-bnls-sknls") / c).toBeCloseTo(0.34, 2);

    // ballast + protein is most of the dish — note protein includes the two
    // eggs, so the role total (43%) is higher than chicken alone (34%)
    expect((result.byRole.ballast + result.byRole.protein) / c).toBeGreaterThan(0.65);

    // aromatics and spices — everything doing the actual flavour work — are
    // the rounding error the solver is free to ignore
    const flavour = result.byRole.aromatic + result.byRole.seasoning;
    expect(flavour / result.totalKcal).toBeLessThan(0.08);
  });
});

describe("pack figures beat generic ones", () => {
  it("uses 180 a sheet, not the catalog's 280 kcal/100g", () => {
    const withPack = cost(borekDraft, { kitchen: borekKitchen });
    const withoutPack = cost(borekDraft); // no kitchen, so no override

    const lavash = (r: ReturnType<typeof cost>) =>
      r.ledger.filter((l) => l.ingredientId === "lavash").reduce((n, l) => n + l.kcal, 0);

    expect(lavash(withPack)).toBe(3 * BOREK_PUBLISHED.lavashPerSheet);
    expect(Math.round(lavash(withoutPack))).toBe(714); // 3 × 85g × 2.80
    expect(withoutPack.totalKcal - withPack.totalKcal).toBeGreaterThan(170);
  });

  it("marks pack-sourced calories separately from reference ones", () => {
    const r = cost(borekDraft, { kitchen: borekKitchen });
    expect(Math.round(r.confidenceMix.pack)).toBe(540);
    expect(r.confidenceMix.estimated).toBe(0); // the override upgraded lavash off "estimated"
    expect(Math.round(r.confidenceMix.pack + r.confidenceMix.usda)).toBe(
      Math.round(r.totalKcal),
    );
  });
});

describe("the engine refuses to guess", () => {
  it("throws on an ingredient it does not know", () => {
    const draft = recipeDraftSchema.parse({
      ...borekDraft,
      uses: [{ ingredientId: "unicorn-steak", grams: 200, section: "main" }],
    });
    expect(() => cost(draft)).toThrow(UnknownIngredientError);
  });

  it("rejects a draft that tries to report its own calories", () => {
    expect(() =>
      recipeDraftSchema.parse({ ...borekDraft, totalKcal: 1583 }),
    ).toThrow();
  });

  it("rejects a use with neither grams nor units", () => {
    expect(() =>
      recipeDraftSchema.parse({
        ...borekDraft,
        uses: [{ ingredientId: "carrot", section: "main" }],
      }),
    ).toThrow();
  });
});

describe("servings derivation", () => {
  it("never returns fewer servings than there are eaters", () => {
    expect(deriveServings(400, 650, 2)).toBe(2);
  });

  it("scales up when the must-finish set exceeds one sitting", () => {
    expect(deriveServings(1989, 650, 2)).toBe(3);
    expect(deriveServings(2600, 650, 2)).toBe(4);
  });
});

describe("kitchen totals feed the feasibility gate", () => {
  it("costs a whole fridge, ignoring unquantified items", () => {
    const total = kitchenKcal(borekKitchen);
    expect(total).toBeGreaterThan(1000);
    expect(total).toBeLessThan(2500);
  });
});

describe("catalog integrity", () => {
  it("has no duplicate ids and every entry is resolvable", () => {
    expect(new Set(CATALOG.map((i) => i.id)).size).toBe(CATALOG.length);
    for (const i of CATALOG) expect(lookup(i.id)).toBeDefined();
  });

  it("marks fats and starches flexible so the solver has something to tune", () => {
    expect(lookup("olive-oil")!.flexible).toBe(true);
    expect(lookup("lavash")!.flexible).toBe(true);
    expect(lookup("dill")!.flexible).toBe(false);
  });
});
