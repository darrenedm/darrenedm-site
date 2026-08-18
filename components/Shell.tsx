import type { ReactNode } from "react";
import Link from "next/link";
import { Nav } from "./Nav";
import { site } from "@/lib/site";
import type { World } from "@/lib/content/schema";

/**
 * The world shell. One `data-world` attribute is the entire theming
 * mechanism: styles/worlds/<world>.css redefines a handful of tokens on
 * that selector and everything inside inherits them.
 *
 * `tone` controls the treatment:
 *   descent — the home page dive: light foam at the surface, darkening
 *             zone by zone until the footer sits in the abyss
 *   tint    — a wash of the world's own hue, for section indexes
 *   (none)  — plain foam, for reading pages
 *
 * `bleed` drops the constrained <main> so zones can run full width and
 * carry their own background; content inside them uses .inner instead.
 */
export function Shell({
  world,
  tone,
  hero,
  bleed,
  className,
  children,
}: {
  world?: World;
  tone?: "descent" | "tint";
  hero?: ReactNode;
  bleed?: boolean;
  className?: string;
  children: ReactNode;
}) {
  const main = [bleed ? "bleed" : "page", className].filter(Boolean).join(" ");

  return (
    <div className="world" data-world={world} data-tone={tone}>
      <div className="masthead">
        <Nav />
        {hero}
      </div>

      <main className={main}>{children}</main>

      <footer className="footer">
        <div className="footer-inner">
          <span>
            © {new Date().getFullYear()} {site.name}
          </span>
          <span>
            <Link href="/about">about</Link> ·{" "}
            <a href={site.github} rel="me noreferrer">
              github
            </a>
          </span>
        </div>
      </footer>
    </div>
  );
}
