"use client";

import type { Provider } from "@/lib/types";

interface Props {
  providers: Pick<Provider, "id" | "name" | "color">[];
  value: string | undefined;
  onChange: (id: string) => void;
  freeOnly: boolean;
  onToggleFreeOnly: (v: boolean) => void;
}

export function ProviderFilter({ providers, value, onChange, freeOnly, onToggleFreeOnly }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        onClick={() => onChange("")}
        className={`chip ${!value ? "chip-active" : ""}`}
      >
        All providers
      </button>
      {providers.map((p) => (
        <button
          key={p.id}
          onClick={() => onChange(value === p.id ? "" : p.id)}
          className={`chip ${value === p.id ? "chip-active" : ""}`}
          style={value === p.id ? { borderColor: p.color, color: "#fff" } : undefined}
        >
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: p.color }}
          />
          {p.name}
        </button>
      ))}
      <span className="mx-1 h-5 w-px bg-gray-300 dark:bg-slate-700" />
      <button
        onClick={() => onToggleFreeOnly(!freeOnly)}
        className={`chip ${freeOnly ? "chip-active" : ""}`}
      >
        🎁 Free only
      </button>
    </div>
  );
}
