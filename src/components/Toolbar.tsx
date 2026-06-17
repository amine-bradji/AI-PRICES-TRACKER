"use client";

export type ViewMode = "table" | "cards";
export type BillingMode = "monthly" | "annual";

interface Props {
  view: ViewMode;
  onViewChange: (v: ViewMode) => void;
  billing: BillingMode;
  onBillingChange: (b: BillingMode) => void;
}

/** Small segmented control toolbar: view mode (table/cards) + billing (monthly/annual). */
export function Toolbar({ view, onViewChange, billing, onBillingChange }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Segmented
        label="View"
        options={[
          { value: "table", label: "📋 Table" },
          { value: "cards", label: "🃏 Cards" },
        ]}
        value={view}
        onChange={(v) => onViewChange(v as ViewMode)}
      />
      <Segmented
        label="Billing"
        options={[
          { value: "monthly", label: "Monthly" },
          { value: "annual", label: "Annual" },
        ]}
        value={billing}
        onChange={(v) => onBillingChange(v as BillingMode)}
      />
    </div>
  );
}

function Segmented({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {label}
      </span>
      <div className="flex rounded-xl border border-slate-300 dark:border-slate-700 bg-gray-50/80 dark:bg-white dark:bg-slate-900/60 p-0.5">
        {options.map((o) => (
          <button
            key={o.value}
            onClick={() => onChange(o.value)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
              value === o.value
                ? "bg-brand-500 text-white shadow"
                : "text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}
