"use client";

import { memo, useMemo } from "react";
import type { ComputedOffer } from "@/lib/types";
import { formatUsd } from "@/lib/format";

interface Props {
  /** Cheapest paid offers per provider for a given region. */
  cheapestPaid: ComputedOffer[];
  billing: "monthly" | "annual";
}

/**
 * Pure-CSS horizontal bar chart comparing cheapest paid tiers. No glow, no
 * brand color washes — bars use a neutral ink color with one accent on the
 * leader.
 */
function PriceChartBase({ cheapestPaid, billing }: Props) {
  const maxUsd = useMemo(
    () => (cheapestPaid.length ? Math.max(...cheapestPaid.map((o) => effectiveUsd(o, billing))) : 0),
    [cheapestPaid, billing],
  );

  if (cheapestPaid.length === 0) return null;

  return (
    <section className="card mb-6 p-5">
      <h2 className="mb-4 text-xs font-medium uppercase tracking-wide text-ink-tertiary">
        Cheapest paid tier per provider — {billing === "annual" ? "annual" : "monthly"}
      </h2>

      <div className="flex flex-col gap-3">
        {cheapestPaid.map((o, idx) => {
          const usd = effectiveUsd(o, billing);
          const pct = maxUsd > 0 ? Math.round((usd / maxUsd) * 100) : 0;
          // Highlight the leader (lowest) so the eye lands on it first.
          const isLeader = idx === 0;
          return (
            <div key={`${o.providerId}-${o.tierId}`} className="group">
              <div className="mb-1 flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="truncate font-medium text-ink-primary">
                    {o.providerName}
                  </span>
                  <span className="text-xs text-ink-tertiary">{o.tierName}</span>
                </div>
                <span className="shrink-0 font-semibold text-ink-primary">
                  {formatUsd(usd)}
                  <span className="ml-1 text-xs font-normal text-ink-tertiary">
                    {billing === "annual" ? "/yr" : "/mo"}
                  </span>
                </span>
              </div>
              <div className="h-6 w-full overflow-hidden rounded-md border border-hairline bg-subtle">
                <div
                  className="flex h-full items-center px-2.5 text-[11px] font-medium text-ink-inverse transition-[width] duration-500 ease-out"
                  style={{
                    width: `${Math.max(pct, 4)}%`,
                    backgroundColor: isLeader ? "var(--ink-primary)" : "var(--ink-tertiary)",
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <p className="mt-3 text-xs text-ink-tertiary">
        Bars are proportional to the most expensive provider. The darkest bar is the cheapest.
      </p>
    </section>
  );
}

export const PriceChart = memo(PriceChartBase);

function effectiveUsd(o: ComputedOffer, billing: "monthly" | "annual"): number {
  if (billing === "annual") return o.annualUsdEquivalent ?? o.usdEquivalent * 12;
  return o.usdEquivalent;
}
