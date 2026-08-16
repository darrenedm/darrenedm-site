import Link from "next/link";
import { Shell } from "@/components/Shell";
import { getLatest } from "@/lib/content/loader";
import { WORLDS, WORLD_META } from "@/lib/content/schema";

/**
 * DRAFT COPY. Warm, first person, no posturing — the brief was "otter or
 * dolphin", not "strategist's chair". Rewrite in Darren's own words.
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
  </section>
);

export default function Home() {
  return (
    <Shell tone="dive" hero={hero} className="home">
      <section className="boards" aria-label="What I'm into">
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
        <h2>Writing — where I actually think out loud</h2>
        <p>
          Longer pieces on decisions, games, films, and whatever I&rsquo;ve been
          chewing on.
        </p>
      </Link>
    </Shell>
  );
}
