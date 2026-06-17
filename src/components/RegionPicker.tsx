"use client";

import type { Region } from "@/lib/types";

interface Props {
  regions: Region[];
  value: string | undefined;
  onChange: (code: string) => void;
}

export function RegionPicker({ regions, value, onChange }: Props) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="font-medium text-slate-500 dark:text-slate-400">Region</span>
      <div className="relative">
        <select
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          className="appearance-none rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 py-2 pl-3 pr-9 text-sm font-medium text-slate-800 dark:text-slate-100 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30"
        >
          <option value="">🌐 All regions</option>
          {regions.map((r) => (
            <option key={r.code} value={r.code}>
              {r.flag} {r.name} ({r.currency})
            </option>
          ))}
        </select>
        <svg className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500 dark:text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </label>
  );
}
