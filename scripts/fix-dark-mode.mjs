// Three-pass dark mode conversion.
// Pass 1: Replace each original class with a UNIQUE placeholder (no overlap possible).
// Pass 2: Resolve each placeholder to "light-class dark:dark-class" in one shot.
// This guarantees zero cross-contamination between mappings.

import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const base = join("C:", "Users", "amine", "ZCodeProject", "ai-price-tracker", "src");

// [originalClass, lightClass, darkClass]
// Ordered longest-first to prevent partial prefix matches in Pass 1.
const MAPPINGS = [
  ["placeholder:text-slate-500", "placeholder:text-slate-400", "placeholder:text-slate-500"],
  ["hover:bg-slate-800/30", "hover:bg-gray-100/80", "hover:bg-slate-800/30"],
  ["hover:bg-slate-700/60", "hover:bg-gray-200", "hover:bg-slate-700/60"],
  ["hover:border-slate-500", "hover:border-slate-400", "hover:border-slate-500"],
  ["hover:text-slate-200", "hover:text-slate-700", "hover:text-slate-200"],
  ["hover:text-white", "hover:text-slate-800", "hover:text-white"],
  ["bg-slate-900/60", "bg-white/70", "bg-slate-900/60"],
  ["bg-slate-900/40", "bg-gray-50", "bg-slate-900/40"],
  ["bg-slate-800/80", "bg-gray-100/80", "bg-slate-800/80"],
  ["bg-slate-800/60", "bg-gray-100/70", "bg-slate-800/60"],
  ["bg-slate-800/30", "bg-gray-50/70", "bg-slate-800/30"],
  ["bg-slate-500/15", "bg-emerald-100", "bg-slate-500/15"],
  ["bg-slate-500/10", "bg-slate-100", "bg-slate-500/10"],
  ["bg-slate-400/10", "bg-slate-100", "bg-slate-400/10"],
  ["border-slate-800/60", "border-slate-200/50", "border-slate-800/60"],
  ["border-slate-800/80", "border-slate-200/70", "border-slate-800/80"],
  ["border-slate-500/30", "border-slate-300", "border-slate-500/30"],
  ["text-slate-100", "text-slate-800", "text-slate-100"],
  ["text-slate-200", "text-slate-700", "text-slate-200"],
  ["text-slate-300", "text-slate-600", "text-slate-300"],
  ["text-slate-400", "text-slate-500", "text-slate-400"],
  ["text-slate-500", "text-slate-400", "text-slate-500"],
  ["text-slate-600", "text-slate-500", "text-slate-600"],
  ["bg-slate-950", "bg-white", "bg-slate-950"],
  ["bg-slate-900", "bg-white", "bg-slate-900"],
  ["bg-slate-800", "bg-gray-200", "bg-slate-800"],
  ["bg-slate-700", "bg-gray-300", "bg-slate-700"],
  ["border-slate-800", "border-slate-200", "border-slate-800"],
  ["border-slate-700", "border-slate-300", "border-slate-700"],
  ["border-slate-600", "border-slate-400", "border-slate-600"],
];

// Pass 1: original → unique numeric placeholder
// Pass 2: placeholder → "light dark:dark" string

function processFile(filepath) {
  let content = readFileSync(filepath, "utf8");
  const original = content;

  // Pass 1: tokenize
  for (let i = 0; i < MAPPINGS.length; i++) {
    const [dark] = MAPPINGS[i];
    const escaped = dark.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const re = new RegExp(`(?<![\\w-])${escaped}(?![\\w/])`, "g");
    content = content.replace(re, `§${i}§`);
  }

  // Pass 2: resolve
  for (let i = 0; i < MAPPINGS.length; i++) {
    const [, light, dark] = MAPPINGS[i];
    content = content.replaceAll(`§${i}§`, `${light} dark:${dark}`);
  }

  if (content !== original) {
    writeFileSync(filepath, content, "utf8");
    return true;
  }
  return false;
}

function walkDir(dir, ext, results = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) walkDir(full, ext, results);
    else if (entry.name.endsWith(ext)) results.push(full);
  }
  return results;
}

const files = [
  ...walkDir(join(base, "components"), ".tsx"),
  join(base, "app", "page.tsx"),
  join(base, "app", "docs", "page.tsx"),
];

let updated = 0;
for (const f of files) {
  if (processFile(f)) {
    console.log(`  Updated: ${f.split("src\\").pop()}`);
    updated++;
  }
}
console.log(`\nDone. ${updated} files updated.`);
