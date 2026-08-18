import Link from "next/link";
import { Shell } from "@/components/Shell";
import { getLatest } from "@/lib/content/loader";
import { WORLD_META, type World } from "@/lib/content/schema";

/**
 * The descent. Ordered by real ocean depth rather than by importance:
 * reef and coral live in the sunlight, deep water sits in the twilight,
 * and the club is down in the midnight zone where the only light is the
 * light things make themselves.
 *
 * It also happens to run from the most playful to the most private,
 * which is the order that reads best on the way down.
 */
const DESCENT = [
  {
    world: "games",
    zone: "reef",
    depth: "0–40 m",
    layer: "Sunlight",
    blurb:
      "Designing a card game, which turns out to be the most honest version of the hobby — you build a system, hand it to people, and find out exactly where it breaks.",
  },
  {
    world: "sports",
    zone: "coral",
    depth: "40–200 m",
    layer: "Sunlight",
    blurb:
      "Football on the pitch, NFL and March Madness from the sofa. Mostly in it for the shape of the thing rather than the result.",
  },
  {
    world: "data",
    zone: "deep",
    depth: "200–1000 m",
    layer: "Twilight",
    blurb:
      "The day job. Finding the pattern in a mess, then arguing about what it actually means.",
  },
  {
    world: "dj",
    zone: "midnight",
    depth: "1000–4000 m",
    layer: "Midnight",
    blurb:
      "Reading a room in real time. The same problem as everything above it, with more variables and worse lighting.",
  },
] as const;

/**
 * DRAFT COPY. Warm, first person, no posturing. Rewrite in Darren's words.
 */
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
      {DESCENT.map((step, i) => {
        const meta = WORLD_META[step.world as World];
        const latest = getLatest(step.world as World);

        return (
          <div key={step.world}>
            {/* the boundary layer: where the light gives out */}
            {i === 2 && (
              <section className="zone" data-zone="thermocline" aria-hidden>
                <div className="inner">
                  <p className="thermocline-mark">Thermocline</p>
                </div>
              </section>
            )}

            <section className="zone" data-zone={step.zone}>
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
