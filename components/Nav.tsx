"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { site } from "@/lib/site";
import { WORLDS, WORLD_META } from "@/lib/content/schema";

/**
 * Derived from WORLDS rather than hand-listed, so adding a section can
 * never leave the nav out of date.
 */
const LINKS = [
  ...WORLDS.map((world) => ({
    href: `/${world}`,
    label: WORLD_META[world].name.toLowerCase().split(" ")[0],
  })),
  { href: "/writing", label: "writing" },
  { href: "/about", label: "about" },
  { href: "/now", label: "now" },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <nav className="nav">
      <Link href="/" className="wordmark">
        {site.name}
      </Link>
      <span className="navlinks">
        {LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            data-active={pathname.startsWith(link.href)}
          >
            {link.label}
          </Link>
        ))}
      </span>
    </nav>
  );
}
