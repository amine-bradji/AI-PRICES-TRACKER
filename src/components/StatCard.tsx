import { memo, type ReactNode } from "react";

interface Props {
  label: string;
  value: ReactNode;
  hint?: string;
}

function StatCardBase({ label, value, hint }: Props) {
  return (
    <div className="card p-4">
      <div className="text-xs font-medium uppercase tracking-wide text-ink-tertiary">
        {label}
      </div>
      <div className="mt-1 text-2xl font-semibold text-ink-primary">{value}</div>
      {hint && <div className="mt-0.5 text-xs text-ink-tertiary">{hint}</div>}
    </div>
  );
}

export const StatCard = memo(StatCardBase);
