"use client";

import { memo } from "react";

export type ViewMode = "table" | "cards";
export type BillingMode = "monthly" | "annual";

interface Props {
  view: ViewMode;
  onViewChange: (v: ViewMode) => void;
  billing: BillingMode;
  onBillingChange: (b: BillingMode) => void;
}

const VIEW_OPTIONS: { value: ViewMode; label: string }[] = [
  { value: "table", label: "Table" },
  { value: "cards", label: "Cards" },
];
const BILLING_OPTIONS: { value: BillingMode; label: string }[] = [
  { value: "monthly", label: "Monthly" },
  { value: "annual", label: "Annual" },
];

/** Segmented control toolbar: view mode (table/cards) + billing (monthly/annual). */
function ToolbarBase({ view, onViewChange, billing, onBillingChange }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Segmented label="View" options={VIEW_OPTIONS} value={view} onChange={(v) => onViewChange(v as ViewMode)} />
      <Segmented label="Billing" options={BILLING_OPTIONS} value={billing} onChange={(v) => onBillingChange(v as BillingMode)} />
    </div>
  );
}

export const Toolbar = memo(ToolbarBase);

function Segmented<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-medium uppercase tracking-wide text-ink-tertiary">
        {label}
      </span>
      <div
        role="group"
        className="flex rounded-md border border-hairline bg-canvas p-0.5"
      >
        {options.map((o) => {
          const active = value === o.value;
          return (
            <button
              key={o.value}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(o.value)}
              className={`rounded-[5px] px-3 py-1 text-sm font-medium transition ${
                active
                  ? "bg-ink-primary text-ink-inverse"
                  : "text-ink-secondary hover:text-ink-primary"
              }`}
            >
              {o.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
