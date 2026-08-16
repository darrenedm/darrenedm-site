import type { ReactNode } from "react";
import Link from "next/link";
import { Nav } from "./Nav";
import { site } from "@/lib/site";
import type { World } from "@/lib/content/schema";

/**
 * The world shell. This one `data-world` attribute is the entire
 * theming mechanism: styles/worlds/<world>.css redefines a handful of
 * tokens on this selector, and every component inside inherits them.
 *
 * Omit `world` and it renders in the skeleton — monochrome, no accent.
 * That is what /writing, /about and /now use, on purpose.
 */
export function Shell({
  world,
  className,
  children,
}: {
  world?: World;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className="world" data-world={world}>
      <Nav />
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
