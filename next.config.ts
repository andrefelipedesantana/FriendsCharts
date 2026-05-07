import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.fastly.net",
      },
      {
        protocol: "https",
        hostname: "api.dicebear.com",
      },
      {
        protocol: "https",
        hostname: "**.last.fm",
      },
      {
        protocol: "http",
        hostname: "**.last.fm",
      },
    ],
  },
};

export default nextConfig;