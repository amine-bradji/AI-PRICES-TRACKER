"use client";

import { memo } from "react";

interface Props {
  value: string;
  onChange: (v: string) => void;
}

/** Free-text search across provider, tier, and region. */
function SearchBoxBase({ value, onChange }: Props) {
  return (
    <div className="relative w-full sm:w-72">
      <svg
        className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-tertiary"
        viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true"
      >
        <circle cx="11" cy="11" r="7" />
        <path d="m21 21-4.3-4.3" strokeLinecap="round" />
      </svg>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search provider, tier, or region"
        aria-label="Search offers by provider, tier, or region"
        className="w-full rounded-md border border-hairline bg-canvas py-2 pl-8 pr-8 text-sm text-ink-primary outline-none transition placeholder:text-ink-tertiary hover:border-hairline-strong focus:border-hairline-strong"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Clear search"
          className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded p-1 text-ink-tertiary transition hover:text-ink-primary"
        >
          <span aria-hidden="true">×</span>
        </button>
      )}
    </div>
  );
}

export const SearchBox = memo(SearchBoxBase);
