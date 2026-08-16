import Link from "next/link";
import { formatDate, type Entry } from "@/lib/content/loader";
import type { Collection } from "@/lib/content/schema";

export function EntryList<C extends Collection>({
  entries,
  basePath,
  empty,
}: {
  entries: Entry<C>[];
  basePath: string;
  empty: string;
}) {
  if (entries.length === 0) {
    return <p className="empty">{empty}</p>;
  }

  return (
    <div className="entry-list">
      {entries.map((entry) => (
        <Link
          key={entry.slug}
          href={`${basePath}/${entry.slug}`}
          className="entry"
        >
          <time className="entry-date" dateTime={entry.data.date.toISOString()}>
            {formatDate(entry.data.date)}
          </time>
          <span className="entry-body">
            <span className="entry-title">{entry.data.title}</span>
            <span className="entry-summary">{entry.data.summary}</span>
            {entry.data.tags.length > 0 && (
              <span className="entry-tags">
                {entry.data.tags.map((tag) => (
                  <span className="tag" key={tag}>
                    {tag}
                  </span>
                ))}
              </span>
            )}
            {entry.data.status === "draft" && (
              <span className="draft-flag">Draft</span>
            )}
          </span>
        </Link>
      ))}
    </div>
  );
}
