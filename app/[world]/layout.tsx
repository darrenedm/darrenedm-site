import { notFound } from "next/navigation";
import { Shell } from "@/components/Shell";
import { WORLDS, type World } from "@/lib/content/schema";

/**
 * One layout for all four worlds. The only thing that varies is the
 * `world` prop handed to Shell, which becomes `data-world` in the DOM,
 * which is what the theme files hang off.
 *
 * Static routes (/about, /writing, /now) take precedence over this
 * dynamic segment, so they are unaffected.
 */
export default async function WorldLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ world: string }>;
}) {
  const { world } = await params;

  if (!WORLDS.includes(world as World)) notFound();

  return <Shell world={world as World}>{children}</Shell>;
}
