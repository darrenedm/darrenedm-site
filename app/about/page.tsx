import type { Metadata } from "next";
import { Shell } from "@/components/Shell";

export const metadata: Metadata = {
  title: "About",
  description: "Who I am and what I'm chasing.",
};

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
          emperor. Not out of any lack of appetite &mdash; the seat I want is
          the one where you have to hold the whole board in your head, read the
          people on it, and be right when it counts.
        </p>
        <p className="todo">
          [Your turn. How you got to each of the four boards, what you&rsquo;re
          actually chasing, what you&rsquo;re bad at. Write it like you&rsquo;d
          introduce yourself to someone interesting at a party &mdash; not like
          a LinkedIn summary. Specific beats impressive.]
        </p>
      </div>
    </Shell>
  );
}
