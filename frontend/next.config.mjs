const BACKEND_INTERNAL_URL =
  process.env.BACKEND_INTERNAL_URL || "http://127.0.0.1:8000";

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    cpus: 1,
    workerThreads: false,
  },
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
