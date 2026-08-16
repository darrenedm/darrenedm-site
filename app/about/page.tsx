import type { Metadata } from "next";
import { Shell } from "@/components/Shell";

export const metadata: Metadata = {
  title: "About",
  description: "Who I am and what I'm chasing.",
};

/**
 * DRAFT. Assembled from things Darren actually said, but the phrasing is
 * mine, not his. Rewrite it in his own voice — an About page is the one
 * page where writing-by-someone-else shows.
 */
export default function About() {
  return (
    <Shell
      hero={
        <header className="sec-head">
          <p className="label">About</p>
          <h1>The longer version</h1>
        </header>
      }
    >
      <div className="prose">
        <p>
          I&rsquo;m a data scientist, which is a formal way of saying I like
          finding the pattern in a mess and then arguing about what it means.
        </p>

        <p>
          Everything else is the same itch pointed somewhere less serious.
          I&rsquo;m building a card game, which turns out to be the most honest
          version of the hobby &mdash; you design a system, hand it to people,
          and find out exactly where it breaks. I DJ, which is the same problem
          in real time with a room full of variables. I play football, and
          I&rsquo;ll happily watch the NFL or a March Madness bracket fall apart
          for the shape of the thing rather than the result.
        </p>

        <h2>The other half</h2>

        <p>
          I cook, increasingly with one eye on the macros, and I care about food
          well past the point of reason. I read far less than I used to and
          I&rsquo;m not proud of that &mdash; most of the attention went to films
          and TV instead, though I&rsquo;ve at least kept the habit of taking
          them apart afterwards to work out <em>why</em> the good ones are good.
        </p>

        <p>
          And I have two cats, which matters here because animals are the one
          thing I have never been even slightly cynical about. They all have an
          entire personality in there and I find that endlessly good. It started
          with dinosaurs and marine animals, at a volume my family would still
          describe as a lot. That part hasn&rsquo;t really gone anywhere.
        </p>

        <h2>What I&rsquo;m after</h2>

        <p>
          Honestly: to be genuinely useful to people doing something worth
          doing. I&rsquo;d rather be the person a good team relies on than the
          one out front, and I care a great deal about doing that the right way.
          Also to have a good time doing it &mdash; that part isn&rsquo;t
          negotiable.
        </p>

        <p className="todo">
          [Darren &mdash; rewrite this in your own words, and make the last
          paragraph specific. The values you named (the ethical code, the
          loyalty) land far harder shown through one real story than stated. A
          photo goes at the top.]
        </p>
      </div>
    </Shell>
  );
}
