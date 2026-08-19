import Link from "next/link";
import { Shell } from "@/components/Shell";
import { Creature, type CreatureName } from "@/components/Creature";
import { DepthGauge } from "@/components/DepthGauge";
import { getLatest } from "@/lib/content/loader";
import { WORLD_META, type World } from "@/lib/content/schema";

/**
 * The descent. Ordered by real ocean depth, which also happens to run
 * from the most playful to the most private — the order that reads best
 * on the way down. Each layer gets the creature that actually lives
 * there, drifting behind the content.
 */
const DESCENT = [
  {
    world: "cooking",
    zone: "tide",
    depth: "0 m",
    layer: "Tide line",
    creature: "otter",
    blurb:
      "Cooking for people, increasingly with one eye on the macros — and currently designing the recipe app I keep wishing already existed.",
  },
  {
    world: "games",
    zone: "reef",
    depth: "0–50 m",
    layer: "Sunlight",
    creature: "turtle",
    blurb:
      "Designing a card game, which turns out to be the most honest version of the hobby — you build a system, hand it to people, and find out exactly where it breaks.",
  },
  {
    world: "sports",
    zone: "coral",
    depth: "50–200 m",
    layer: "Sunlight",
    creature: "dolphin",
    blurb:
      "Football on the pitch, NFL and March Madness from the sofa. Mostly in it for the shape of the thing rather than the result.",
  },
  {
    world: "data",
    zone: "deep",
    depth: "200–1000 m",
    layer: "Twilight",
    creature: "squid",
    blurb:
      "The day job. Finding the pattern in a mess, then arguing about what it actually means.",
  },
  {
    world: "dj",
    zone: "midnight",
    depth: "1000–4000 m",
    layer: "Midnight",
    creature: "anglerfish",
    blurb:
      "Reading a room in real time. The same problem as everything above it, with more variables and worse lighting.",
  },
] as const;

/** index in DESCENT where the light gives out */
const CROSSOVER = 3;

/** DRAFT COPY — warm, first person. Rewrite in Darren's words. */
const hero = (
  <section className="hero">
    <p className="label">Darren Edmonds</p>
    <h1>
      Hi — I like figuring out how <span className="accent">things work</span>.
    </h1>
    <p className="hero-sub">
      Data scientist by trade. I build card games, play records, cook too
      ambitiously on weeknights, and think about football more than is
      defensible.
    </p>
    <p className="hero-warmth">
      Mostly I&rsquo;m just curious — about systems, about animals, about why
      the good films are good. Best part is figuring it out with people I like.
    </p>
    <p className="scroll-cue">Keep going down</p>
  </section>
);

export default function Home() {
  return (
    <Shell tone="descent" hero={hero} bleed>
      <DepthGauge />

      {DESCENT.map((step, i) => {
        const meta = WORLD_META[step.world as World];
        const latest = getLatest(step.world as World);
        const dark = i >= CROSSOVER;

        return (
          <div key={step.world}>
            {i === CROSSOVER && (
              <section className="zone" data-zone="thermocline" aria-hidden>
                <div className="inner">
                  <p className="thermocline-mark">Thermocline</p>
                </div>
              </section>
            )}

            <section className="zone" data-zone={step.zone}>
              {dark && <span className="snow" aria-hidden />}
              <Creature name={step.creature as CreatureName} />

              <div className="inner zone-grid">
                <p className="depth-mark">
                  <span>{step.depth}</span>
                  <b>{step.layer}</b>
                </p>

                <Link href={`/${step.world}`} className="zone-card">
                  <span className="zone-role">{meta.role}</span>
                  <h2 className="zone-name">{meta.name}</h2>
                  <span className="zone-blurb">{step.blurb}</span>
                  <span className="zone-latest">
                    <span className="zone-kicker">{meta.kicker}</span>
                    <span className="zone-title">
                      {latest ? (
                        latest.data.title
                      ) : (
                        <span className="todo">nothing published yet</span>
                      )}
                    </span>
                  </span>
                </Link>
              </div>
            </section>
          </div>
        );
      })}

      {/* the floor */}
      <section className="zone" data-zone="abyss">
        <span className="snow" aria-hidden />
        <Creature name="dumbo" />
        <div className="inner zone-grid">
          <p className="depth-mark">
            <span>4000 m+</span>
            <b>Abyss</b>
          </p>
          <Link href="/writing" className="spine">
            <h2>Writing — where I actually think out loud</h2>
            <p>
              Longer pieces on decisions, games, films, and whatever I&rsquo;ve
              been chewing on.
            </p>
          </Link>
        </div>
      </section>
    </Shell>
  );
}
