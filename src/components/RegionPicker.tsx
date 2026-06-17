"use client";

import { memo } from "react";
import type { Region } from "@/lib/types";

interface Props {
  regions: Region[];
  value: string | undefined;
  onChange: (code: string) => void;
}

function RegionPickerBase({ regions, value, onChange }: Props) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="text-xs font-medium uppercase tracking-wide text-ink-tertiary">Region</span>
      <div className="relative">
        <select
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          aria-label="Filter by region"
          className="appearance-none rounded-md border border-hairline bg-canvas py-2 pl-3 pr-8 text-sm font-medium text-ink-primary outline-none transition hover:border-hairline-strong focus:border-hairline-strong"
        >
          <option value="">All regions</option>
          {regions.map((r) => (
            <option key={r.code} value={r.code}>
              {r.flag} {r.name} ({r.currency})
            </option>
          ))}
        </select>
        <svg
          className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-tertiary"
          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true"
        >
          <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </label>
  );
}

export const RegionPicker = memo(RegionPickerBase);
