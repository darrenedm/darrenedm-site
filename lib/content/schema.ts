import { z } from "zod";

/**
 * The themed worlds. Each has a route, a theme file in styles/worlds/,
 * and a schema extension below.
 *
 * Order is the order of the descent on the home page and of the nav —
 * shallow to deep. `teaching` sits directly under `data` because it is
 * the same expertise pointed outwards.
 */
export const WORLDS = [
  "cooking",
  "games",
  "sports",
  "data",
  "teaching",
  "dj",
] as const;
export type World = (typeof WORLDS)[number];

/**
 * Writing is NOT a world — it is the spine. Unthemed on purpose:
 * it is the thing arguing why the four worlds belong together, so
 * dressing it in a costume would undercut it. But it is still a
 * content collection, so it shares the loader and the base schema.
 */
export const COLLECTIONS = [...WORLDS, "writing"] as const;
export type Collection = (typeof COLLECTIONS)[number];

/**
 * YAML hands us a Date for `2026-08-16` but a string for anything it cannot
 * parse. `z.coerce.date()` turns the latter into an Invalid Date and then
 * reports "expected date, received Date", which tells you nothing. This says
 * what is wrong and how to fix it — the whole point of validating at all.
 */
const dateField = z
  .union([z.date(), z.string(), z.number()])
  .transform((value, ctx) => {
    const parsed = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      ctx.addIssue({
        code: "custom",
        message: `"${String(value)}" is not a valid date — use YYYY-MM-DD`,
      });
      return z.NEVER;
    }
    return parsed;
  });

/** Every entry in every collection has these. */
const base = z.object({
  title: z.string().min(1),
  summary: z.string().min(1),
  date: dateField,
  status: z.enum(["draft", "published"]).default("published"),
  tags: z.array(z.string()).default([]),
  cover: z.string().optional(),
  /**
   * If the thing is running somewhere you can click, this is where.
   * On base rather than on one world, so the detail page can render it
   * for any of them without knowing which world it is in.
   */
  live: z.url().optional(),
});

/**
 * A metric is a label/value pair rather than a number, so a page can
 * honestly render "not measured yet" instead of a fabricated figure.
 */
const metric = z.object({
  label: z.string(),
  value: z.string(),
  /** true = a placeholder awaiting a real number; renders as a visible TODO */
  todo: z.boolean().default(false),
});

/** The signature block: decision, alternative, why not, what it cost. */
const call = z.object({
  decision: z.string(),
  alternative: z.string(),
  whyNot: z.string(),
  cost: z.string(),
});

export const schemas = {
  data: base.extend({
    repo: z.string().optional(),
    paper: z.string().optional(),
    stack: z.array(z.string()).default([]),
    metrics: z.array(metric).default([]),
    call: call.optional(),
  }),

  dj: base.extend({
    setLength: z.string().optional(),
    bpmRange: z.string().optional(),
    genres: z.array(z.string()).default([]),
    audioUrl: z.string().optional(),
    tracklist: z.array(z.string()).default([]),
  }),

  cooking: base.extend({
    /**
     * Covers two things that belong together: the food itself, and the
     * recipe app being designed around it. `kind` decides which fields
     * the page renders.
     */
    kind: z.enum(["recipe", "system", "note"]).default("note"),
    /** recipes */
    serves: z.string().optional(),
    time: z.string().optional(),
    macros: z
      .object({
        calories: z.number().optional(),
        protein: z.number().optional(),
        carbs: z.number().optional(),
        fat: z.number().optional(),
      })
      .optional(),
    /** system design write-ups */
    stack: z.array(z.string()).default([]),
    repo: z.string().optional(),
    metrics: z.array(metric).default([]),
    call: call.optional(),
  }),

  games: base.extend({
    /**
     * Design-led. "playing" entries are still welcome, but the section
     * leads with what you build: a TCG or a board game is a system of
     * strategic interaction under constraints, which is the thesis
     * expressed more directly than anywhere else on the site.
     */
    kind: z.enum(["design", "playing"]).default("design"),
    /** design entries */
    players: z.string().optional(),
    playtime: z.string().optional(),
    mechanics: z.array(z.string()).default([]),
    stage: z
      .enum(["concept", "prototype", "playtesting", "shelved", "released"])
      .optional(),
    call: call.optional(),
    /** playing entries */
    platform: z.string().optional(),
    hoursPlayed: z.number().optional(),
    rating: z.number().min(0).max(10).optional(),
    verdict: z.string().optional(),
  }),

  sports: base.extend({
    sport: z.string().optional(),
    team: z.string().optional(),
    fixtureDate: dateField.optional(),
    result: z.string().optional(),
  }),

  teaching: base.extend({
    /**
     * Two things belong here and they are not the same shape: tools that
     * are live and usable, and write-ups of how to get better at
     * something. `kind` decides which fields the page renders.
     */
    kind: z.enum(["tool", "guide", "note"]).default("tool"),
    /**
     * Who it is for, in plain words. Educational projects almost always
     * skip this and it is the first thing anyone actually needs.
     */
    audience: z.string().optional(),
    repo: z.string().optional(),
    stack: z.array(z.string()).default([]),
    metrics: z.array(metric).default([]),
    call: call.optional(),
  }),

  writing: base.extend({
    call: call.optional(),
  }),
} as const;

export type Frontmatter<C extends Collection> = z.infer<(typeof schemas)[C]>;

/** Display metadata for each world. Single source of truth for nav and cards. */
export const WORLD_META: Record<
  World,
  { name: string; role: string; kicker: string; empty: string }
> = {
  cooking: {
    name: "Cooking",
    role: "Feeding people well",
    kicker: "In progress",
    empty: "The recipe app system design is being written. Recipes to follow.",
  },
  data: {
    name: "Data science",
    role: "Modelling the system",
    kicker: "Latest",
    empty: "Nothing here yet.",
  },
  dj: {
    name: "DJing",
    role: "Reading the room, live",
    kicker: "Latest set",
    empty: "No sets up yet.",
  },
  games: {
    name: "Games",
    role: "Making things to play",
    kicker: "In progress",
    empty: "The card game is still in the box. Notes coming.",
  },
  teaching: {
    name: "Teaching",
    role: "Building the tools I wish I had",
    kicker: "Live now",
    empty: "Nothing written up yet.",
  },
  sports: {
    name: "Sport",
    role: "Watching the shape",
    kicker: "Latest",
    empty: "Nothing written up yet.",
  },
};
