"use client";

interface Props {
  value: string;
  onChange: (v: string) => void;
}

/** Free-text search across provider, tier, and region. */
export function SearchBox({ value, onChange }: Props) {
  return (
    <div className="relative w-full sm:w-72">
      <svg
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500"
        viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
      >
        <circle cx="11" cy="11" r="7" />
        <path d="m21 21-4.3-4.3" strokeLinecap="round" />
      </svg>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search provider, tier, region…"
        className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 py-2 pl-9 pr-3 text-sm text-slate-800 dark:text-slate-100 outline-none transition placeholder:text-slate-400 dark:placeholder:text-slate-400 dark:text-slate-500 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30"
      />
      {value && (
        <button
          onClick={() => onChange("")}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 dark:text-slate-500 transition hover:text-slate-700 dark:hover:text-slate-700 dark:text-slate-200"
          title="Clear"
        >
          ✕
        </button>
      )}
    </div>
  );
}
