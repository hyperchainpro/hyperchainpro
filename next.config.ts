import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  allowedDevOrigins: [
    ".space-z.ai",
  ],
  // Prevent bundling Prisma client — Turbopack rewrites @prisma/client to a
  // content-hashed module name which does not exist, breaking all API routes.
  serverExternalPackages: ["@prisma/client", ".prisma/client"],
};

export default nextConfig;