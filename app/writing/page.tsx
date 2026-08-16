import type { Metadata } from "next";
import { Shell } from "@/components/Shell";
import { EntryList } from "@/components/EntryList";
import { getEntries } from "@/lib/content/loader";

export const metadata: Metadata = {
  title: "Writing",
  description: "Thinking out loud about decisions, games, films and food.",
};

export default function WritingIndex() {
  const entries = getEntries("writing");

  return (
    <Shell
      hero={
        <header className="sec-head">
          <p className="label">Writing</p>
          <h1>Thinking out loud</h1>
          <p>
            The sections show what I make. This is where I work out why — the
            decisions, the trade-offs, and the calls that were harder than they
            looked from outside.
          </p>
        </header>
      }
    >
      <EntryList
        entries={entries}
        basePath="/writing"
        empty="First piece in progress."
      />
    </Shell>
  );
}
