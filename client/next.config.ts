import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Allow importing code from directories outside the Next.js app (../types)
    externalDir: true,
  },
};

export default nextConfig;
