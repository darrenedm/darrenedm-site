import type { Metadata } from "next";
import { Shell } from "@/components/Shell";

export const metadata: Metadata = {
  title: "About",
  description: "Who I am and what I'm chasing.",
};

/**
 * DRAFT. Every sentence below is assembled from things Darren said, but
 * the phrasing is not his yet. Rewrite it in his own voice before this
 * counts as finished — an About page written by someone else is the one
 * page on a personal site where that shows.
 */
export default function About() {
  return (
    <Shell>
      <header className="sec-head">
        <p className="eyebrow">About</p>
        <h1>The long version</h1>
      </header>

      <div className="prose">
        <p>
          I&rsquo;ve always been more interested in the strategist than the
          emperor. Zhuge Liang over the throne he served &mdash; the person who
          holds the whole board in their head, reads everyone on it, and is
          right when it counts. Not for lack of appetite. That seat is just
          harder, and it&rsquo;s the one I want.
        </p>

        <p>
          By day that means <strong>data science</strong>: building models that
          have to survive contact with messy reality rather than a clean test
          set. The rest of it is the same instinct pointed somewhere less
          formal. I&rsquo;m building games &mdash; a TCG, some board game ideas
          &mdash; which is really just designing systems of strategic
          interaction and then finding out where they break. I DJ, which is the
          same problem in real time and with a room full of people as the
          variable. I play football, and I follow the NFL and March Madness
          mostly for the shape of the thing: the tactics, the brackets, the
          arguments about what should have happened.
        </p>

        <h2>The other half</h2>

        <p>
          None of that is much use without people you&rsquo;d actually want in
          the room, so: I cook, increasingly with an eye on the macros. I care
          more about food than is strictly reasonable. I read far less than I
          used to and I&rsquo;m not proud of it &mdash; most of that attention
          went to films and TV, though I&rsquo;ve at least kept the habit of
          picking them apart afterwards and working out <em>why</em> the good
          ones are good.
        </p>

        <p>
          And I have two cats, which is relevant because animals are the thing I
          have never once been cynical about. Every one of them has a whole
          personality in there and I find that endlessly good. It started with
          dinosaurs and marine animals as a kid, at a volume my family would
          probably still describe as excessive. That part hasn&rsquo;t really
          gone anywhere.
        </p>

        <p className="todo">
          [Darren &mdash; rewrite the above in your own words, and add what
          you&rsquo;re actually chasing. The values you named &mdash; the
          ethical code, the loyalty, wanting to do something that matters
          &mdash; belong here, but shown through something specific rather than
          claimed. A photo goes at the top.]
        </p>
      </div>
    </Shell>
  );
}
