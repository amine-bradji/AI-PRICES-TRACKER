"use client";

import type { ComputedOffer } from "@/lib/types";
import { formatLocalPrice, formatUsd } from "@/lib/format";

interface Props {
  regionName?: string;
  offers: ComputedOffer[];
}

/** Shows the cheapest paid tier per provider for the selected region. */
export function CheapestPaid({ regionName, offers }: Props) {
  if (offers.length === 0) return null;
  const cheapest = offers[0];

  return (
    <section className="card mb-6 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Cheapest paid option {regionName ? `in ${regionName}` : ""}
          </h2>
          <div className="mt-1 flex items-center gap-2">
            <span
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: cheapest.providerColor }}
            />
            <span className="text-lg font-bold text-white">
              {cheapest.providerName} · {cheapest.tierName}
            </span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-brand-400">
            {formatLocalPrice(cheapest.localPrice, cheapest.currency, cheapest.symbol)}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            ≈ {formatUsd(cheapest.usdEquivalent)} / {cheapest.billingCycle}
          </div>
        </div>
      </div>

      {offers.length > 1 && (
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {offers.slice(0, 8).map((o, i) => (
            <div key={`${o.providerId}-${i}`} className="rounded-lg border border-slate-200 dark:border-slate-800 bg-gray-50 dark:bg-white dark:bg-slate-900/40 px-3 py-2">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: o.providerColor }} />
                {o.providerName}
              </div>
              <div className="mt-0.5 text-sm font-semibold text-white">
                {formatLocalPrice(o.localPrice, o.currency, o.symbol)}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
