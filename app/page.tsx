import Link from "next/link";
import { Shell } from "@/components/Shell";
import { getLatest } from "@/lib/content/loader";
import { WORLDS, WORLD_META } from "@/lib/content/schema";

export default function Home() {
  return (
    <Shell className="home">
      <section className="hero">
        <p className="eyebrow">Hi — I&rsquo;m Darren</p>
        <h1>
          I want the <span className="accent">strategist&rsquo;s</span> chair.
        </h1>
        <p className="hero-sub">
          Machine learning, DJ sets, games and football are four boards where
          the same thing happens:{" "}
          <strong>
            read the system, model the people in it, make the call.
          </strong>
        </p>
        <p className="hero-warmth">
          I&rsquo;ve spent a long time getting good at understanding people
          &mdash; and trying to be good company while doing it.
        </p>
      </section>

      <section className="boards" aria-label="The four boards">
        {WORLDS.map((world) => {
          const meta = WORLD_META[world];
          const latest = getLatest(world);

          return (
            <Link
              key={world}
              href={`/${world}`}
              className="board"
              data-board={world}
            >
              <span className="board-role">{meta.role}</span>
              <span className="board-name">{meta.name}</span>
              <span className="board-latest">
                <span className="board-kicker">{meta.kicker}</span>
                <span className="board-title">
                  {latest ? (
                    latest.data.title
                  ) : (
                    <span className="todo">nothing published yet</span>
                  )}
                </span>
              </span>
            </Link>
          );
        })}
      </section>

      <Link href="/writing" className="spine">
        <h2>Writing &mdash; where the argument actually gets made</h2>
        <p>
          Unthemed on purpose. This is the spine holding the four boards
          together, not a fifth board.
        </p>
      </Link>
    </Shell>
  );
}
