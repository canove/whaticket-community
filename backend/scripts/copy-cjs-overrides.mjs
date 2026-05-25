/**
 * Copies package.json CJS-override files from src/ to dist/ after tsc build.
 * These overrides tell Node.js to treat specific subdirectories as CommonJS
 * even though the root package is ESM (type: "module").
 */

import { copyFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));

const overrides = [
  ["src/database/migrations/package.json", "dist/database/migrations/package.json"],
  ["src/database/seeds/package.json", "dist/database/seeds/package.json"],
];

for (const [src, dest] of overrides) {
  const destPath = join(ROOT, dest);
  mkdirSync(dirname(destPath), { recursive: true });
  copyFileSync(join(ROOT, src), destPath);
  console.log(`Copied ${src} → ${dest}`);
}
