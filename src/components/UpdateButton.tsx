"use client";

import { formatTime } from "@/lib/format";

interface Props {
  onClick: () => void;
  updating: boolean;
  cooldown: number;
  updatedAt: number;
  fxSource: "live" | "fallback" | null;
}

export function UpdateButton({ onClick, updating, cooldown, updatedAt, fxSource }: Props) {
  const disabled = updating || cooldown > 0;
  const sourceLabel = fxSource === "fallback" ? " · offline rates" : fxSource === "live" ? " · live FX" : "";

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={onClick}
        disabled={disabled}
        className={`group inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition
          ${disabled
            ? "cursor-not-allowed bg-gray-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500"
            : "bg-brand-500 text-white hover:bg-brand-400 active:scale-[0.98] shadow-lg shadow-brand-500/25"}`}
        title={cooldown > 0 ? `Cooldown — wait ${cooldown}s` : "Refresh live exchange rates"}
      >
        {updating ? (
          <SpinnerIcon />
        ) : cooldown > 0 ? (
          <ClockIcon />
        ) : (
          <RefreshIcon />
        )}
        {updating ? "Updating…" : cooldown > 0 ? `Update (${cooldown}s)` : "Update prices"}
      </button>
      {updatedAt > 0 && (
        <span className="text-xs text-slate-400 dark:text-slate-500">
          Updated {formatTime(updatedAt)}
          {sourceLabel}
        </span>
      )}
    </div>
  );
}

function RefreshIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12a9 9 0 1 1-2.64-6.36" />
      <path d="M21 3v6h-6" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

function SpinnerIcon() {
  return (
    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" className="opacity-25" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
