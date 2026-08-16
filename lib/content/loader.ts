import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import {
  COLLECTIONS,
  schemas,
  type Collection,
  type Frontmatter,
} from "./schema";

const CONTENT_DIR = path.join(process.cwd(), "content");

/**
 * Drafts are visible while developing and hidden in production, so a
 * half-written post can live in the repo without being published.
 */
const SHOW_DRAFTS = process.env.NODE_ENV === "development";

export type Entry<C extends Collection> = {
  slug: string;
  collection: C;
  /** raw MDX body, rendered by the page */
  body: string;
  data: Frontmatter<C>;
};

const cache = new Map<Collection, Entry<Collection>[]>();

function readCollection<C extends Collection>(collection: C): Entry<C>[] {
  const dir = path.join(CONTENT_DIR, collection);
  if (!fs.existsSync(dir)) return [];

  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".mdx"));

  return files.map((file) => {
    const slug = file.replace(/\.mdx$/, "");
    const raw = fs.readFileSync(path.join(dir, file), "utf8");
    const { data, content } = matter(raw);

    const parsed = schemas[collection].safeParse(data);

    // A bad file fails the build instead of shipping a broken page.
    // The error names the file, because a schema error with no path
    // is a scavenger hunt.
    if (!parsed.success) {
      throw new Error(
        `Invalid frontmatter in content/${collection}/${file}:\n` +
          parsed.error.issues
            .map((i) => `  · ${i.path.join(".") || "(root)"}: ${i.message}`)
            .join("\n"),
      );
    }

    return {
      slug,
      collection,
      body: content,
      data: parsed.data as Frontmatter<C>,
    };
  });
}

/** All entries in a collection, newest first, drafts filtered for production. */
export function getEntries<C extends Collection>(collection: C): Entry<C>[] {
  if (!cache.has(collection)) {
    cache.set(collection, readCollection(collection) as Entry<Collection>[]);
  }

  return (cache.get(collection) as Entry<C>[])
    .filter((e) => SHOW_DRAFTS || e.data.status === "published")
    .sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

export function getEntry<C extends Collection>(
  collection: C,
  slug: string,
): Entry<C> | null {
  return getEntries(collection).find((e) => e.slug === slug) ?? null;
}

export function getLatest<C extends Collection>(
  collection: C,
): Entry<C> | null {
  return getEntries(collection)[0] ?? null;
}

/** Everything, across every collection — for the home page and the feed. */
export function getAllEntries(): Entry<Collection>[] {
  return COLLECTIONS.flatMap((c) => getEntries(c)).sort(
    (a, b) => b.data.date.getTime() - a.data.date.getTime(),
  );
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
