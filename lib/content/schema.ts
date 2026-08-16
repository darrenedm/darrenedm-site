import { z } from "zod";

/**
 * The four themed worlds. Each has a route, a theme file in
 * styles/worlds/, and a schema extension below.
 */
export const WORLDS = ["data", "dj", "games", "sports"] as const;
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

  writing: base.extend({
    call: call.optional(),
  }),
} as const;

export type Frontmatter<C extends Collection> = z.infer<(typeof schemas)[C]>;

/** Display metadata for each world. Single source of truth for nav and cards. */
export const WORLD_META: Record<
  World,
  { name: string; role: string; kicker: string }
> = {
  data: {
    name: "Data science",
    role: "Modelling the system",
    kicker: "Latest",
  },
  dj: { name: "DJing", role: "Reading the room, live", kicker: "Latest set" },
  games: {
    name: "Games",
    role: "Making things to play",
    kicker: "In progress",
  },
  sports: { name: "Sport", role: "Watching the shape", kicker: "Latest" },
};
