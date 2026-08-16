import type { Metadata } from "next";
import { site } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  // metadataBase is why every OG/canonical URL below can be relative.
  // Swap NEXT_PUBLIC_SITE_URL and the whole site follows.
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — data science, card games, records and football`,
    template: `%s · ${site.name}`,
  },
  description: site.description,
  openGraph: {
    type: "website",
    siteName: site.name,
    title: site.name,
    description: site.description,
    url: "/",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
