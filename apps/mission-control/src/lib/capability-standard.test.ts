import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

import { describe, expect, it } from "vitest";

import { CAPABILITY_CATALOG } from "@/lib/capability-catalog";

const root = process.cwd();
const srcRoot = join(root, "src");
const docsRoot = join(root, "docs");

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    if (name.endsWith(".test.ts") || name.endsWith(".test.tsx")) return [];
    if (statSync(full).isDirectory()) return walk(full);
    return /\.(ts|tsx|md)$/.test(name) ? [full] : [];
  });
}

function rel(file: string) {
  return relative(root, file).replaceAll("\\", "/");
}

function read(file: string) {
  return readFileSync(file, "utf8");
}

function code(file: string) {
  return read(file)
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/^\s*\/\/.*$/gm, "");
}

function apiRoutePath(bffRoute: string) {
  return join(root, "src", "app", "api", ...bffRoute.replace(/^\/api\/?/, "").split("/"), "route.ts");
}

function hookPath(hook: string) {
  return join(root, "src", "lib", `${hook}.ts`);
}

function widgetPath(widget: string) {
  return join(root, "src", "components", "widgets", `${widget}.tsx`);
}

describe("Capability Delivery Standard governance", () => {
  it("keeps backend clients inside BFF route handlers", () => {
    const offenders = walk(srcRoot).filter((file) => {
      const path = rel(file);
      return code(file).includes("backendClient(") && !path.startsWith("src/app/api/") && path !== "src/lib/backends.ts";
    });

    expect(offenders.map(rel)).toEqual([]);
  });

  it("keeps screens as composition-only: no fetch or backend client in pages", () => {
    const offenders = walk(join(srcRoot, "app")).filter((file) => {
      const path = rel(file);
      const text = code(file);
      return path.endsWith("page.tsx") && (text.includes("fetch(") || text.includes("backendClient("));
    });

    expect(offenders.map(rel)).toEqual([]);
  });

  it("keeps widgets presentation-only: no fetch, backend clients, or service URLs", () => {
    const forbidden = /(fetch\(|backendClient\(|DATA_CORE_API_URL|POUPI_CRYPTO_API_URL|POUPI_BABY_API_URL|https?:\/\/)/;
    const offenders = walk(join(srcRoot, "components")).filter((file) => forbidden.test(code(file)));

    expect(offenders.map(rel)).toEqual([]);
  });

  it("keeps hooks limited to local BFF routes under /api/*", () => {
    const hookFiles = walk(join(srcRoot, "lib")).filter((file) => /\/use[A-Z].*\.ts$/.test(rel(file)));
    const offenders = hookFiles.filter((file) => {
      const text = code(file);
      if (text.includes("backendClient(")) return true;

      const fetchCalls = [...text.matchAll(/fetch\(\s*["'`]([^"'`]+)["'`]/g)].map((match) => match[1]);
      return fetchCalls.some((url) => !url.startsWith("/api/"));
    });

    expect(offenders.map(rel)).toEqual([]);
  });

  it("keeps components and hooks from direct backend service access", () => {
    const forbidden = /DATA_CORE_API_URL|POUPI_CRYPTO_API_URL|POUPI_BABY_API_URL|backendClient\(|fetch\(\s*["'`]https?:\/\//;
    const files = [...walk(join(srcRoot, "components")), ...walk(join(srcRoot, "lib")).filter((file) => /\/use[A-Z]/.test(rel(file)))];
    const offenders = files.filter((file) => forbidden.test(code(file)));

    expect(offenders.map(rel)).toEqual([]);
  });

  it("keeps BFF routes thin: GET-only, no engine execution, no mutation methods", () => {
    const routeFiles = walk(join(srcRoot, "app", "api")).filter((file) => rel(file).endsWith("/route.ts"));
    const forbiddenRuntime = [
      "Phase2Platform",
      "DailyBriefBuilder",
      "UnifiedAlertEngine",
      "ProductionCertificationService",
      "JsonlOpportunityEvidenceRegistry",
      "execute(",
      "evaluate(",
      ".build(",
    ];

    const offenders = routeFiles.filter((file) => {
      const text = code(file);
      const hasNonGetMethod = /export\s+async\s+function\s+(POST|PUT|PATCH|DELETE)\b/.test(text);
      const callsEngine = forbiddenRuntime.some((token) => text.includes(token));
      return hasNonGetMethod || callsEngine;
    });

    expect(offenders.map(rel)).toEqual([]);
  });

  it("does not duplicate BFF routes or normalized contract names in the catalog", () => {
    const bffRoutes = CAPABILITY_CATALOG.map((c) => c.bffRoute).filter(Boolean);
    const contracts = CAPABILITY_CATALOG.map((c) => c.contract).filter(Boolean);

    expect(new Set(bffRoutes).size).toBe(bffRoutes.length);
    expect(new Set(contracts).size).toBe(contracts.length);
  });

  it("keeps certified capabilities aligned with ADR-0002 and real files", () => {
    const certified = CAPABILITY_CATALOG.filter((entry) => entry.phase === 7 || entry.status === "live");
    const violations = certified.filter((entry) => {
      return !(
        entry.sourceOfTruth &&
        entry.category &&
        entry.project &&
        entry.endpoint &&
        entry.contract &&
        entry.bffRoute &&
        entry.hook &&
        entry.widget &&
        entry.screen &&
        entry.tests.length > 0 &&
        existsSync(apiRoutePath(entry.bffRoute)) &&
        existsSync(hookPath(entry.hook)) &&
        existsSync(widgetPath(entry.widget)) &&
        entry.tests.every((testFile) => existsSync(join(root, testFile)))
      );
    });

    expect(violations.map((entry) => entry.id)).toEqual([]);
  });

  it("keeps the roadmap synchronized with the catalog and ADR-0002 references", () => {
    const roadmap = read(join(docsRoot, "CAPABILITY_AUDIT_AND_ROADMAP.md"));
    const framework = read(join(docsRoot, "CAPABILITY_DELIVERY_FRAMEWORK.md"));
    const adr = read(join(docsRoot, "ADR-0002-capability-delivery-pattern.md"));

    const missingFromRoadmap = CAPABILITY_CATALOG.filter((entry) => !roadmap.includes(entry.id)).map((entry) => entry.id);
    expect(missingFromRoadmap).toEqual([]);

    expect(roadmap).toContain("ADR-0002");
    expect(roadmap).toContain("capability-catalog.ts");
    expect(roadmap).toContain("CAPABILITY_DELIVERY_FRAMEWORK.md");
    expect(framework).toContain("ADR-0002");
    expect(adr).toContain("Source of Truth");
    expect(adr).toContain("BFF");
    expect(adr).toContain("Hook");
    expect(adr).toContain("Widget");
    expect(adr).toContain("Certification");
  });
});
