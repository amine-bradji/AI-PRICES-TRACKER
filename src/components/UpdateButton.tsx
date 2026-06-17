"use client";

import { memo } from "react";
import { formatTime } from "@/lib/format";

interface Props {
  onClick: () => void;
  updating: boolean;
  cooldown: number;
  updatedAt: number;
  fxSource: "live" | "fallback" | null;
}

function UpdateButtonBase({ onClick, updating, cooldown, updatedAt, fxSource }: Props) {
  const disabled = updating || cooldown > 0;
  const sourceLabel =
    fxSource === "fallback"
      ? " · offline rates"
      : fxSource === "live"
        ? " · live FX"
        : "";

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className="btn btn-primary"
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
        <span className="text-xs text-ink-tertiary">
          Updated {formatTime(updatedAt)}
          {sourceLabel}
        </span>
      )}
    </div>
  );
}

export const UpdateButton = memo(UpdateButtonBase);

function RefreshIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 12a9 9 0 1 1-2.64-6.36" />
      <path d="M21 3v6h-6" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

function SpinnerIcon() {
  return (
    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" className="opacity-25" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
