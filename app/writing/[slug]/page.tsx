import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Shell } from "@/components/Shell";
import { Mdx } from "@/components/Mdx";
import { TheCall } from "@/components/TheCall";
import { formatDate, getEntries, getEntry } from "@/lib/content/loader";

export const dynamicParams = false;

export function generateStaticParams() {
  return getEntries("writing").map((entry) => ({ slug: entry.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const entry = getEntry("writing", slug);
  if (!entry) return {};

  return {
    title: entry.data.title,
    description: entry.data.summary,
    openGraph: {
      title: entry.data.title,
      description: entry.data.summary,
      type: "article",
      url: `/writing/${slug}`,
    },
  };
}

export default async function Essay({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const entry = getEntry("writing", slug);
  if (!entry) notFound();

  const { data } = entry;

  return (
    <Shell
      hero={
        <header className="article-head">
          <p className="label">
            Writing ·{" "}
            <time dateTime={data.date.toISOString()}>
              {formatDate(data.date)}
            </time>
          </p>
          <h1>{data.title}</h1>
          <p className="article-standfirst">{data.summary}</p>
        </header>
      }
    >
      <Mdx source={entry.body} />

      {data.call && (
        <TheCall
          decision={data.call.decision}
          alternative={data.call.alternative}
          whyNot={data.call.whyNot}
          cost={data.call.cost}
        />
      )}
    </Shell>
  );
}
