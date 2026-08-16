import { MDXRemote } from "next-mdx-remote/rsc";

/**
 * MDX rather than plain markdown, because posts will eventually want
 * to embed real components — a waveform player in a DJ set, a chart in
 * an ML writeup. Rendered on the server at build time, so none of the
 * MDX machinery reaches the browser.
 */
export function Mdx({ source }: { source: string }) {
  return (
    <div className="prose">
      <MDXRemote source={source} />
    </div>
  );
}
