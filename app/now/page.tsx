import type { Metadata } from "next";
import { Shell } from "@/components/Shell";

export const metadata: Metadata = {
  title: "Now",
  description: "What I'm currently into.",
};

/** Bump this whenever you edit the page — a stale /now is worse than none. */
const UPDATED = "16 August 2026";

export default function Now() {
  return (
    <Shell>
      <header className="sec-head">
        <p className="eyebrow">Updated {UPDATED}</p>
        <h1>Now</h1>
        <p>What I&rsquo;m currently into. Short, dated, and honest.</p>
      </header>

      <div className="prose">
        <p className="todo">
          [Four or five lines. What you&rsquo;re building, listening to,
          playing, watching. Ten minutes a month keeps this the page returning
          visitors check first.]
        </p>
      </div>
    </Shell>
  );
}
