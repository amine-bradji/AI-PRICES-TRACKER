interface Props {
  label: string;
  value: string | number;
  hint?: string;
  accent?: string;
  icon?: string;
}

export function StatCard({ label, value, hint, accent = "#329dff", icon }: Props) {
  return (
    <div className="card p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
          {label}
        </span>
        {icon && <span className="text-lg">{icon}</span>}
      </div>
      <div className="mt-1 text-2xl font-bold" style={{ color: accent }}>
        {value}
      </div>
      {hint && <div className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">{hint}</div>}
    </div>
  );
}
