"use client";

import type { ComputedOffer } from "@/lib/types";
import { formatUsd } from "@/lib/format";

interface Props {
  /** Cheapest paid offers per provider for a given region. */
  cheapestPaid: ComputedOffer[];
  billing: "monthly" | "annual";
}

/**
 * Pure-CSS horizontal bar chart comparing cheapest paid tiers across providers.
 * No chart library needed — just proportional widths with provider-colored bars.
 */
export function PriceChart({ cheapestPaid, billing }: Props) {
  if (cheapestPaid.length === 0) return null;

  const maxUsd = Math.max(...cheapestPaid.map((o) => effectiveUsd(o, billing)));

  return (
    <section className="card mb-6 p-5">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        Price comparison — cheapest paid tier{" "}
        {billing === "annual" ? "(annual)" : "(monthly)"}
      </h2>

      <div className="flex flex-col gap-3">
        {cheapestPaid.map((o, i) => {
          const usd = effectiveUsd(o, billing);
          const pct = maxUsd > 0 ? Math.round((usd / maxUsd) * 100) : 0;
          return (
            <div key={`${o.providerId}-${i}`} className="group">
              <div className="mb-1 flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: o.providerColor }}
                  />
                  <span className="font-medium text-slate-700 dark:text-slate-200">
                    {o.providerName}
                  </span>
                  <span className="text-xs text-slate-400 dark:text-slate-500">{o.tierName}</span>
                </div>
                <span className="font-semibold text-white">
                  {formatUsd(usd)}
                  <span className="ml-1 text-xs text-slate-400 dark:text-slate-500">
                    {billing === "annual" ? "/yr" : "/mo"}
                  </span>
                </span>
              </div>
              <div className="h-7 w-full overflow-hidden rounded-lg bg-gray-100/80 dark:bg-gray-200 dark:bg-slate-800/60">
                <div
                  className="flex h-full items-center rounded-lg px-3 text-xs font-medium text-white/90 transition-all duration-500"
                  style={{
                    width: `${Math.max(pct, 4)}%`,
                    backgroundColor: o.providerColor,
                    opacity: 0.85,
                  }}
                >
                  {pct > 15 ? formatUsd(usd) : ""}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <p className="mt-3 text-[11px] text-slate-400 dark:text-slate-500">
        Bar width is proportional to the most expensive provider. Select a region above to see comparisons.
      </p>
    </section>
  );
}

function effectiveUsd(o: ComputedOffer, billing: "monthly" | "annual"): number {
  if (billing === "annual") return o.annualUsdEquivalent ?? o.usdEquivalent * 12;
  return o.usdEquivalent;
}
