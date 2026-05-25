/**
 * Adds .js extension to all relative imports in TypeScript files.
 * Required for ESM (module: NodeNext).
 *
 * Patterns handled:
 *   from "./foo"        → from "./foo.js"
 *   from "../bar/baz"   → from "../bar/baz.js"
 *   import "../bootstrap" → import "../bootstrap.js"
 *
 * Skipped (no change):
 *   - Bare specifiers (no leading ./ or ../)
 *   - Already has an extension (.js, .json, .css, etc.)
 *   - Dynamic imports: import("./foo") are also handled
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join, extname } from "node:path";

const SRC_DIR = new URL("../src", import.meta.url).pathname;

function walk(dir) {
  const results = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) {
      results.push(...walk(full));
    } else if (name.endsWith(".ts") && !name.endsWith(".d.ts")) {
      results.push(full);
    }
  }
  return results;
}

// Matches: from "...", import "...", import("...")
// Group 1: the quote char (' or ")
// Group 2: the path
const IMPORT_RE =
  /\b(?:from|import)\s*(['"])(\.\.?\/[^'"]+?)(\1)/g;

// Dynamic import: import('./foo') or import("./foo")
const DYN_IMPORT_RE =
  /\bimport\((['"])(\.\.?\/[^'"]+?)(\1)\)/g;

function addJsExt(path) {
  // Skip if already has a file extension
  if (extname(path) !== "") return path;
  return path + ".js";
}

function transform(source) {
  let changed = false;

  const result = source
    .replace(IMPORT_RE, (match, q1, path, q2) => {
      const newPath = addJsExt(path);
      if (newPath === path) return match;
      changed = true;
      // Reconstruct: preserve 'from' or 'import' keyword
      return match.replace(`${q1}${path}${q2}`, `${q1}${newPath}${q2}`);
    })
    .replace(DYN_IMPORT_RE, (match, q1, path, q2) => {
      const newPath = addJsExt(path);
      if (newPath === path) return match;
      changed = true;
      return match.replace(`${q1}${path}${q2}`, `${q1}${newPath}${q2}`);
    });

  return { result, changed };
}

const files = walk(SRC_DIR);
let modifiedCount = 0;

for (const file of files) {
  const source = readFileSync(file, "utf8");
  const { result, changed } = transform(source);
  if (changed) {
    writeFileSync(file, result, "utf8");
    console.log(`✓ ${file.replace(SRC_DIR + "/", "")}`);
    modifiedCount++;
  }
}

console.log(`\nDone. Modified ${modifiedCount} / ${files.length} files.`);
