import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["better-sqlite3"],
  transpilePackages: ["@cardos/extension"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "**" },
    ],
  },
  async redirects() {
    return [
      {
        source: "/",
        destination: "/chat",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
