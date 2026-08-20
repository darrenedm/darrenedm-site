import { describe, it, expect } from "vitest";
import {
  checkFeasible,
  daysLeft,
  finalize,
  plan,
  resolvePantry,
  selectMustUse,
  tune,
} from "./solver";
import { cost } from "./cost";
import { mealRequestSchema, kitchenSchema, recipeDraftSchema, NEW_BUDGET } from "./schema";
import { borekDraft, borekKitchen } from "./fixtures/borek";

/** Fixed clock so perishability assertions don't rot. */
const NOW = new Date("2026-08-19T12:00:00Z");
const req = (o: Partial<Parameters<typeof mealRequestSchema.parse>[0]> = {}) =>
  mealRequestSchema.parse({ mode: "pantry-raid", ...(o as object) });

describe("perishability is derived, never stored", () => {
  it("counts down from purchase date and shelf life", () => {
    expect(daysLeft("2026-08-15", 5, NOW)).toBe(1);
    expect(daysLeft("2026-07-20", 180, NOW)).toBe(150);
    expect(daysLeft("2026-08-10", 5, NOW)).toBe(-4); // already gone
  });

  it("sorts the fridge by urgency with reproducible ties", () => {
    const p = resolvePantry(borekKitchen, NOW);
    const top = p.perishing.slice(0, 3);
    expect(top.every((e) => e.daysLeft === 1)).toBe(true);
    // three items tie at 1 day; inventory order breaks the tie the same way every run
    expect(top.map((e) => e.ingredientId)).toEqual([
      "chicken-thigh-bnls-sknls",
      "dill",
      "arugula",
    ]);
  });
});

describe("the assumed-pantry problem", () => {
  it("offers staples the user never listed, but flags them unconfirmed", () => {
    const p = resolvePantry(borekKitchen, NOW);
    expect(p.available).toContain("olive-oil");
    expect(p.available).toContain("cumin-ground");
    expect(p.unconfirmed).toContain("olive-oil");
  });

  it("remembers a denial instead of re-guessing it", () => {
    const k = kitchenSchema.parse({ ...borekKitchen, pantryDenied: ["gochujang"] });
    const p = resolvePantry(k, NOW);
    expect(p.available).not.toContain("gochujang");
    expect(p.unconfirmed).not.toContain("gochujang");
  });

  it("stops flagging what the user has confirmed", () => {
    const k = kitchenSchema.parse({ ...borekKitchen, pantryConfirmed: ["olive-oil"] });
    expect(resolvePantry(k, NOW).unconfirmed).not.toContain("olive-oil");
  });
});

describe("feasibility gates the model call", () => {
  it("passes the real kitchen for two at 650", () => {
    const f = checkFeasible(borekKitchen, req({ eaters: 2 }), NOW);
    expect(f.feasible).toBe(true);
    if (f.feasible) {
      expect(f.availableKcal).toBeGreaterThan(2000);
      expect(f.headroom).toBeGreaterThan(800);
    }
  });

  it("fails pantry-raid when the fridge cannot hold the meal, with usable options", () => {
    const thin = kitchenSchema.parse({
      updatedAt: "2026-08-19",
      items: [
        { ingredientId: "arugula", qty: { grams: 80 }, addedAt: "2026-08-17" },
        { ingredientId: "dill", qty: { grams: 20 }, addedAt: "2026-08-17" },
      ],
    });
    const f = checkFeasible(thin, req({ eaters: 2 }), NOW);
    expect(f.feasible).toBe(false);
    if (!f.feasible) {
      expect(f.shortfall).toBeGreaterThan(1200);
      expect(f.options.map((o) => o.kind)).toEqual([
        "raise-mode",
        "lower-target",
        "fewer-eaters",
        "shop",
      ]);
    }
  });

  it("does not count food that has already gone off", () => {
    const spoiled = kitchenSchema.parse({
      updatedAt: "2026-08-19",
      items: [
        { ingredientId: "chicken-thigh-bnls-sknls", qty: { grams: 900 }, addedAt: "2026-08-01" },
        { ingredientId: "rice-white-raw", qty: { grams: 200 }, addedAt: "2026-08-01" },
      ],
    });
    const f = checkFeasible(spoiled, req({ eaters: 2 }), NOW);
    // the rice is fine (730-day shelf life); the 18-day-old raw chicken is not
    expect(Math.round(f.availableKcal)).toBe(730);
    expect(f.feasible).toBe(false);
  });

  it("never blocks a mode that is allowed to shop", () => {
    const empty = kitchenSchema.parse({ updatedAt: "2026-08-19", items: [] });
    expect(checkFeasible(empty, req({ mode: "clear-out" }), NOW).feasible).toBe(true);
  });

  it("warns when one new ingredient would be carrying the meal", () => {
    const thin = kitchenSchema.parse({
      updatedAt: "2026-08-19",
      items: [{ ingredientId: "arugula", qty: { grams: 80 }, addedAt: "2026-08-17" }],
    });
    const f = checkFeasible(thin, req({ mode: "one-hero", eaters: 2 }), NOW);
    expect(f.feasible).toBe(true);
    if (f.feasible) expect(f.warning).toMatch(/carrying most of the meal/);
  });
});

describe("must-use selection", () => {
  it("takes the user's pins as given outside clear-out", () => {
    const r = req({ mustUse: ["lavash", "chicken-thigh-bnls-sknls"] });
    expect(selectMustUse(borekKitchen, r, NOW).ids).toEqual([
      "lavash",
      "chicken-thigh-bnls-sknls",
    ]);
  });

  it("refuses to pin something that is not in the kitchen", () => {
    expect(() => selectMustUse(borekKitchen, req({ mustUse: ["salmon"] }), NOW)).toThrow(
      /not in the kitchen/,
    );
  });

  it("chooses the dying items itself in clear-out mode", () => {
    const picked = selectMustUse(borekKitchen, req({ mode: "clear-out" }), NOW);
    expect(picked.ids).toHaveLength(2);
    expect(picked.urgent).toBe(true);
    expect(picked.ids).toContain("chicken-thigh-bnls-sknls");
  });
});

describe("four modes, one code path", () => {
  it("differs only by new-ingredient budget", () => {
    expect(NEW_BUDGET["pantry-raid"]).toBe(0);
    expect(NEW_BUDGET["one-hero"]).toBe(1);
    expect(NEW_BUDGET["round-out"]).toBe(3);
    expect(NEW_BUDGET["clear-out"]).toBe(Infinity);
  });

  it("produces a plan the prompt can be built from", () => {
    const p = plan(borekKitchen, req({ mustUse: ["lavash"], exclude: ["kimchi"] }), NOW);
    expect(p.newIngredientBudget).toBe(0);
    expect(p.mustUse).toEqual(["lavash"]);
    expect(p.mustUseIsAutomatic).toBe(false);
    expect(p.available).not.toContain("kimchi");
    expect(p.expiring.map((e) => e.ingredientId)).toContain("dill");
  });
});

describe("tuning toward the target", () => {
  it("leaves the börek alone — it already lands within tolerance", () => {
    const t = tune(borekDraft, { kitchen: borekKitchen, kcalTarget: 650, eaters: 2 });
    expect(t.costed.servings).toBe(3);
    expect(Math.abs(t.residualKcal)).toBeLessThan(70);
    expect(Math.round(t.costed.kcalPerServing)).toBe(650);
  });

  it("pulls a fat-heavy draft down by trimming only flexible items", () => {
    const greasy = recipeDraftSchema.parse({
      ...borekDraft,
      uses: borekDraft.uses.map((u) =>
        u.ingredientId === "olive-oil" && u.grams ? { ...u, grams: u.grams * 4 } : u,
      ),
    });
    const before = cost(greasy, { kitchen: borekKitchen, kcalTarget: 650, eaters: 2 });
    const t = tune(greasy, { kitchen: borekKitchen, kcalTarget: 650, eaters: 2 });

    expect(t.costed.totalKcal).toBeLessThan(before.totalKcal);
    expect(t.adjustments.every((a) => a.toGrams < a.fromGrams)).toBe(true);
    // only fats and starches moved; nothing that carries flavour was touched
    const moved = new Set(t.adjustments.map((a) => a.ingredientId));
    expect(moved).toContain("olive-oil");
    expect(moved).not.toContain("dill");
    expect(moved).not.toContain("chicken-thigh-bnls-sknls");
  });

  it("will not shrink a must-finish ingredient", () => {
    const greasy = recipeDraftSchema.parse({
      ...borekDraft,
      uses: borekDraft.uses.map((u) =>
        u.ingredientId === "olive-oil" && u.grams ? { ...u, grams: u.grams * 4 } : u,
      ),
    });
    const t = tune(greasy, {
      kitchen: borekKitchen,
      kcalTarget: 650,
      eaters: 2,
      mustUse: ["olive-oil"],
    });
    expect(t.adjustments.map((a) => a.ingredientId)).not.toContain("olive-oil");
  });

  it("reports what the clamp could not absorb rather than distorting the recipe", () => {
    const absurd = recipeDraftSchema.parse({
      ...borekDraft,
      uses: [
        { ingredientId: "olive-oil", grams: 20, section: "main" },
        { ingredientId: "chicken-thigh-bnls-sknls", grams: 2000, section: "main" },
      ],
    });
    const t = tune(absurd, { kcalTarget: 650, eaters: 2 });
    expect(Math.abs(t.residualKcal)).toBeGreaterThan(0);
    expect(t.adjustments.every((a) => a.toGrams >= a.fromGrams * 0.65)).toBe(true);
  });

  it("finalize threads the plan's constraints into the tune", () => {
    const p = plan(borekKitchen, req({ mustUse: ["lavash"] }), NOW);
    const t = finalize(borekDraft, p, borekKitchen);
    expect(t.costed.servings).toBe(3);
    expect(t.adjustments.map((a) => a.ingredientId)).not.toContain("lavash");
  });
});
