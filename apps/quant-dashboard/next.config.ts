import type { NextConfig } from "next";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const appDir = dirname(fileURLToPath(import.meta.url));
const workspaceRoot = join(appDir, "../..");

const nextConfig: NextConfig = {
  transpilePackages: [
    "@poupi-frontend/ui",
    "@poupi-frontend/api-client",
    "@poupi-frontend/types",
    "@poupi-frontend/utils",
  ],
  turbopack: {
    root: workspaceRoot,
  },
};

export default nextConfig;
