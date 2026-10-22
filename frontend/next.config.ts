import type { NextConfig } from "next";

const BACKEND_INTERNAL_URL =
  process.env.BACKEND_INTERNAL_URL || "http://127.0.0.1:8000";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${BACKEND_INTERNAL_URL}/api/:path*`,
      },
      {
        source: "/docs",
        destination: `${BACKEND_INTERNAL_URL}/docs`,
      },
      {
        source: "/openapi.json",
        destination: `${BACKEND_INTERNAL_URL}/openapi.json`,
      },
    ];
  },
};

export default nextConfig;
