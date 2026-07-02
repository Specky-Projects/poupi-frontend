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
  // Phase 10.1 nav restructure (23 -> 11 items): every absorbed slug keeps
  // resolving to its new owning screen. See src/lib/nav.ts and
  // docs/PHASE_10_OPERATOR_EXPERIENCE_ARCHITECTURE.md Etapa 2/9.
  async redirects() {
    return [
      { source: "/scientific", destination: "/research", permanent: false },
      { source: "/committee", destination: "/mirror", permanent: false },
      { source: "/portfolio", destination: "/mirror", permanent: false },
      { source: "/explainability", destination: "/timeline", permanent: false },
      { source: "/replay", destination: "/timeline", permanent: false },
      { source: "/opportunity-discovery", destination: "/business-os", permanent: false },
      { source: "/universal-learning", destination: "/business-os", permanent: false },
      { source: "/knowledge-graph", destination: "/business-os", permanent: false },
      { source: "/seo", destination: "/poupi-baby", permanent: false },
      { source: "/affiliate", destination: "/universal-platform", permanent: false },
      { source: "/deployments", destination: "/infrastructure", permanent: false },
      { source: "/alerts", destination: "/cockpit", permanent: false },
      { source: "/audit", destination: "/architecture", permanent: false },
      { source: "/analytics", destination: "/architecture", permanent: false },
    ];
  },
};

export default nextConfig;
