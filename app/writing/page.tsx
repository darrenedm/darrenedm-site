import type { Metadata } from "next";
import { Shell } from "@/components/Shell";
import { EntryList } from "@/components/EntryList";
import { getEntries } from "@/lib/content/loader";

export const metadata: Metadata = {
  title: "Writing",
  description:
    "Essays on strategy, decisions and the calls that were harder than they looked.",
};

export default function WritingIndex() {
  const entries = getEntries("writing");

  return (
    <Shell>
      <header className="sec-head">
        <p className="eyebrow">The spine</p>
        <h1>Writing</h1>
        <p>
          The four boards show what I do. This is where the reasoning behind it
          gets argued out loud — the decisions, the trade-offs, and the calls
          that were harder than they looked from outside.
        </p>
      </header>
      <EntryList
        entries={entries}
        basePath="/writing"
        empty="First essay in progress."
      />
    </Shell>
  );
}
