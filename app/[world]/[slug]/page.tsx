import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Shell } from "@/components/Shell";
import { Mdx } from "@/components/Mdx";
import { TheCall } from "@/components/TheCall";
import { formatDate, getEntries, getEntry } from "@/lib/content/loader";
import { WORLDS, WORLD_META, type World } from "@/lib/content/schema";

export const dynamicParams = false;

export function generateStaticParams() {
  return WORLDS.flatMap((world) =>
    getEntries(world).map((entry) => ({ world, slug: entry.slug })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ world: string; slug: string }>;
}): Promise<Metadata> {
  const { world, slug } = await params;
  if (!WORLDS.includes(world as World)) return {};
  const entry = getEntry(world as World, slug);
  if (!entry) return {};

  return {
    title: entry.data.title,
    description: entry.data.summary,
    openGraph: {
      title: entry.data.title,
      description: entry.data.summary,
      type: "article",
      url: `/${world}/${slug}`,
    },
  };
}

export default async function EntryPage({
  params,
}: {
  params: Promise<{ world: string; slug: string }>;
}) {
  const { world, slug } = await params;
  if (!WORLDS.includes(world as World)) notFound();

  const entry = getEntry(world as World, slug);
  if (!entry) notFound();

  const meta = WORLD_META[world as World];
  const data = entry.data;
  const metrics = "metrics" in data ? data.metrics : [];
  const call = "call" in data ? data.call : undefined;

  return (
    <Shell
      world={world as World}
      tone="tint"
      hero={
        <header className="article-head">
          <p className="label">
            <span className="label-world">{meta.name}</span> ·{" "}
            <time dateTime={data.date.toISOString()}>
              {formatDate(data.date)}
            </time>
          </p>
          <h1>{data.title}</h1>
          <p className="article-standfirst">{data.summary}</p>
        </header>
      }
    >
      {metrics.length > 0 && (
        <dl className="metrics">
          {metrics.map((m) => (
            <div className="metric" key={m.label}>
              <dt>{m.label}</dt>
              <dd className={m.todo ? "todo" : undefined}>{m.value}</dd>
            </div>
          ))}
        </dl>
      )}

      <Mdx source={entry.body} />

      {call && (
        <TheCall
          decision={call.decision}
          alternative={call.alternative}
          whyNot={call.whyNot}
          cost={call.cost}
        />
      )}
    </Shell>
  );
}
