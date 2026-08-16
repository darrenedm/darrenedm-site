import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // The section was /ml before it became /data. Permanent redirects
      // keep already-shared links (and anything indexed) working, and pass
      // the link equity along instead of dropping it on the floor.
      { source: "/ml", destination: "/data", permanent: true },
      { source: "/ml/:slug", destination: "/data/:slug", permanent: true },
    ];
  },
};

export default nextConfig;
