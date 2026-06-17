"use client";

import { memo } from "react";
import type { Provider } from "@/lib/types";

interface Props {
  providers: Pick<Provider, "id" | "name" | "color">[];
  value: string | undefined;
  onChange: (id: string) => void;
  freeOnly: boolean;
  onToggleFreeOnly: (v: boolean) => void;
}

function ProviderFilterBase({ providers, value, onChange, freeOnly, onToggleFreeOnly }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        aria-pressed={!value}
        onClick={() => onChange("")}
        className={`chip ${!value ? "chip-active" : ""}`}
      >
        All providers
      </button>
      {providers.map((p) => (
        <button
          key={p.id}
          type="button"
          aria-pressed={value === p.id}
          onClick={() => onChange(value === p.id ? "" : p.id)}
          className={`chip ${value === p.id ? "chip-active" : ""}`}
        >
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: p.color }}
            aria-hidden="true"
          />
          {p.name}
        </button>
      ))}
      <span className="mx-1 h-5 w-px bg-hairline-strong" style={{ backgroundColor: "var(--line-default)" }} aria-hidden="true" />
      <button
        type="button"
        aria-pressed={freeOnly}
        onClick={() => onToggleFreeOnly(!freeOnly)}
        className={`chip ${freeOnly ? "chip-active" : ""}`}
      >
        Free only
      </button>
    </div>
  );
}

export const ProviderFilter = memo(ProviderFilterBase);
