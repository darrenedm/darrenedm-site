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
 * `tone` controls the masthead treatment, which is why nav and hero live
 * in the same block — they share one background:
 *   dive  — the deep-ocean gradient, home only
 *   tint  — a wash of the world's own hue, section indexes
 *   (none) — plain foam, for reading pages
 */
export function Shell({
  world,
  tone,
  hero,
  className,
  children,
}: {
  world?: World;
  tone?: "dive" | "tint";
  hero?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className="world" data-world={world} data-tone={tone}>
      <div className="masthead">
        <Nav />
        {hero}
      </div>

      <main className={className ? `page ${className}` : "page"}>
        {children}
      </main>

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
