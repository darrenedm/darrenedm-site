"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { site } from "@/lib/site";

const LINKS = [
  { href: "/ml", label: "ml" },
  { href: "/dj", label: "dj" },
  { href: "/games", label: "games" },
  { href: "/sports", label: "sport" },
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
