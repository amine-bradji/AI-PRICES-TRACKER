// Undo: strip all dark: variants and restore light-class values back to dark originals.
// This reverses any dark-mode conversion to give clean "dark-only" slate classes.

import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const base = join("C:", "Users", "amine", "ZCodeProject", "ai-price-tracker", "src");

// Reverse map: [mixed-class (with light values), clean-dark-original]
const REVERT = [
  ["bg-white/70", "bg-slate-900/60"],
  ["bg-gray-50", "bg-slate-900/40"],
  ["bg-gray-100/80", "bg-slate-800/80"],
  ["bg-gray-100/70", "bg-slate-800/60"],
  ["bg-gray-50/70", "bg-slate-800/30"],
  ["bg-emerald-100", "bg-slate-500/15"],
  ["bg-slate-100", "bg-slate-500/10"],
  ["border-slate-200/50", "border-slate-800/60"],
  ["border-slate-200/70", "border-slate-800/80"],
  ["border-slate-300", "border-slate-500/30"],
  ["text-slate-800", "text-slate-100"],
  ["text-slate-700", "text-slate-200"],
  ["text-slate-600", "text-slate-300"],
  ["text-slate-500", "text-slate-500"], // ambiguous — keep as-is
  ["text-slate-400", "text-slate-400"], // ambiguous — keep as-is
  ["bg-white", "bg-slate-950"],
  ["bg-gray-200", "bg-slate-800"],
  ["bg-gray-300", "bg-slate-700"],
  ["border-slate-200", "border-slate-800"],
  ["hover:bg-gray-100/80", "hover:bg-slate-800/30"],
  ["hover:bg-gray-200", "hover:bg-slate-700/60"],
  ["hover:bg-gray-100", "hover:bg-slate-800/30"], // fallback
  ["hover:border-slate-400", "hover:border-slate-500"],
  ["hover:text-slate-700", "hover:text-slate-200"],
  ["hover:text-slate-800", "hover:text-white"],
];

function processFile(filepath) {
  let content = readFileSync(filepath, "utf8");
  const original = content;

  // First: strip all "dark:" prefixed classes entirely
  content = content.replace(/\bdark:\S+/g, "");

  // Then: collapse double spaces
  content = content.replace(/  +/g, " ");

  // Then: revert light values back to dark originals (longest first)
  // Sort by length descending
  const sorted = [...REVERT].sort((a, b) => b[0].length - a[0].length);
  for (const [light, dark] of sorted) {
    content = content.replace(new RegExp(`(?<![\\w-])${light.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?![\\w/])`, "g"), dark);
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
    console.log(`  Reverted: ${f.split("src\\").pop()}`);
    updated++;
  }
}
console.log(`\nDone. ${updated} files reverted.`);
