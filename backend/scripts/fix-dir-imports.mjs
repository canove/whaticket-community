/**
 * Fixes directory imports that were incorrectly converted by add-js-extensions.mjs.
 * When a bare import resolves to a directory with index.ts, the correct ESM path
 * is "/index.js", not ".js".
 *
 * Example:
 *   from "../providers/WhatsApp.js" → from "../providers/WhatsApp/index.js"
 *   from "./types.js"               → from "./types/index.js"
 */

import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join, dirname, extname } from "node:path";
import { fileURLToPath } from "node:url";

const SRC_DIR = new URL("../src", import.meta.url).pathname;

// Directories in src/ that have an index.ts — these are incorrectly resolved as .js
// We auto-detect them by scanning for directories containing index.ts
function findDirIndexes(dir, prefix = "") {
  const result = new Set();
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) {
      const indexFile = join(full, "index.ts");
      if (existsSync(indexFile)) {
        result.add(name); // just the folder name — we do targeted replacements
      }
    }
  }
  return result;
}

// We know the problematic patterns from the build output — fix them surgically
const REPLACEMENTS = [
  // Providers/WhatsApp directory (with index.ts)
  [/from "(\.\.\/providers\/WhatsApp)\.js"/g, 'from "$1/index.js"'],
  [/from "(\.\.\/\.\.\/providers\/WhatsApp)\.js"/g, 'from "$1/index.js"'],
  // types/ directory inside providers/WhatsApp/
  [/from "(\.\.\/types)\.js"/g, 'from "$1/index.js"'],
  [/from "(\.\/)types\.js"/g, 'from "$1types/index.js"'],
  // routes/ directory
  [/from "(\.\/)routes\.js"/g, 'from "$1routes/index.js"'],
  [/from "(\.\.\/routes)\.js"/g, 'from "$1/index.js"'],
  // database/ directory
  [/from "(\.\.\/database)\.js"/g, 'from "$1/index.js"'],
  [/from "(\.\.\/\.\.\/database)\.js"/g, 'from "$1/index.js"'],
  // providers/WhatsApp/types directory (when imported from outside)
  [/from "(\.\.\/providers\/WhatsApp\/types)\.js"/g, 'from "$1/index.js"'],
  [/from "(\.\.\/\.\.\/providers\/WhatsApp\/types)\.js"/g, 'from "$1/index.js"'],
];

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

const files = walk(SRC_DIR);
let modifiedCount = 0;

for (const file of files) {
  let source = readFileSync(file, "utf8");
  let changed = false;

  for (const [pattern, replacement] of REPLACEMENTS) {
    const newSource = source.replace(pattern, replacement);
    if (newSource !== source) {
      source = newSource;
      changed = true;
    }
  }

  if (changed) {
    writeFileSync(file, source, "utf8");
    console.log(`✓ ${file.replace(SRC_DIR + "/", "")}`);
    modifiedCount++;
  }
}

console.log(`\nDone. Fixed ${modifiedCount} files.`);
