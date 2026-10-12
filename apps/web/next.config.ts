import path from "node:path";
import type { NextConfig } from "next";

const isPlaywrightTest = process.env.PLAYWRIGHT_TEST === "1";
const apiUrl = process.env.API_INTERNAL_URL ?? "http://localhost:3001";

const nextConfig: NextConfig = {
  output: isPlaywrightTest ? undefined : "standalone",
  outputFileTracingRoot: path.join(process.cwd(), "../.."),
  transpilePackages: ["@repo/contracts"],
  async rewrites() {
    return [
      {
        source: "/api/backend/:path*",
        destination: `${apiUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
