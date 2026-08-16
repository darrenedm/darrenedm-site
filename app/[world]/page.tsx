import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Shell } from "@/components/Shell";
import { EntryList } from "@/components/EntryList";
import { getEntries } from "@/lib/content/loader";
import { WORLDS, WORLD_META, type World } from "@/lib/content/schema";

export const dynamicParams = false;

export function generateStaticParams() {
  return WORLDS.map((world) => ({ world }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ world: string }>;
}): Promise<Metadata> {
  const { world } = await params;
  if (!WORLDS.includes(world as World)) return {};
  const meta = WORLD_META[world as World];
  return { title: meta.name, description: meta.role };
}

export default async function WorldIndex({
  params,
}: {
  params: Promise<{ world: string }>;
}) {
  const { world } = await params;
  if (!WORLDS.includes(world as World)) notFound();

  const meta = WORLD_META[world as World];
  const entries = getEntries(world as World);

  return (
    <Shell
      world={world as World}
      tone="tint"
      hero={
        <header className="sec-head">
          <p className="label label-world">{meta.role}</p>
          <h1>{meta.name}</h1>
        </header>
      }
    >
      <EntryList
        entries={entries}
        basePath={`/${world}`}
        empty="Nothing here yet — this one's still coming."
      />
    </Shell>
  );
}
