/**
 * Single source of truth for anything that needs an absolute URL —
 * OG images, canonical tags, sitemap, RSS.
 *
 * This exists so moving from a vercel.app subdomain to a real domain
 * is one environment variable and a redeploy, rather than hunting
 * hardcoded origins through the codebase. Set NEXT_PUBLIC_SITE_URL in
 * the Vercel dashboard when the domain is ready.
 */
export const site = {
  name: "Darren Edmonds",
  shortName: "darrenedm",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  description:
    "Data scientist. I build tools that teach, design card games, play records, cook too ambitiously, and think about football more than is defensible.",
  github: "https://github.com/darrenedm",
} as const;
