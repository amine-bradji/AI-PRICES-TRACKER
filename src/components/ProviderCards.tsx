"use client";

import type { ComputedOffer } from "@/lib/types";
import { REGIONS } from "@/data/regions";
import { formatLocalPrice, formatUsd } from "@/lib/format";
import type { BillingMode } from "@/components/Toolbar";

interface Props {
  offers: ComputedOffer[];
  billing: BillingMode;
}

/**
 * Card-grid view: groups offers by provider so each provider gets a card
 * listing its tiers + prices. Honors billing mode.
 */
export function ProviderCards({ offers, billing }: Props) {
  if (offers.length === 0) {
    return (
      <div className="card p-10 text-center text-slate-500 dark:text-slate-400">
        No offers match the current filters.
      </div>
    );
  }

  // Group by provider, preserving first-seen order.
  const groups = new Map<string, { provider: ComputedOffer; rows: ComputedOffer[] }>();
  for (const o of offers) {
    const g = groups.get(o.providerId);
    if (g) g.rows.push(o);
    else groups.set(o.providerId, { provider: o, rows: [o] });
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {[...groups.values()].map(({ provider, rows }) => (
        <div key={provider.providerId} className="card flex flex-col p-5">
          <div className="mb-3 flex items-center gap-2">
            <span
              className="flex h-9 w-9 items-center justify-center rounded-lg text-sm font-bold text-white"
              style={{ backgroundColor: provider.providerColor }}
            >
              {provider.providerName.charAt(0)}
            </span>
            <div>
              <div className="font-semibold text-white">{provider.providerName}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">{rows.length} tiers in view</div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            {rows.slice(0, 6).map((o, i) => {
              const region = REGIONS.find((r) => r.code === o.regionCode);
              const local = effectiveLocal(o, billing);
              const usd = effectiveUsd(o, billing);
              return (
                <div
                  key={`${o.tierId}-${o.regionCode}-${i}`}
                  className="flex items-center justify-between rounded-lg border border-slate-200 dark:border-slate-800 bg-gray-50 dark:bg-white dark:bg-slate-900/40 px-3 py-2"
                >
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium text-slate-700 dark:text-slate-200">
                      {o.tierName}{" "}
                      <span className="text-xs text-slate-400 dark:text-slate-500">
                        {region?.flag} {o.regionCode}
                      </span>
                    </div>
                    {o.regionalHeadline && (
                      <div className="truncate text-[11px] text-emerald-400">
                        {o.regionalHeadline}
                      </div>
                    )}
                  </div>
                  <div className="ml-2 shrink-0 text-right">
                    {o.isFree ? (
                      <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[11px] font-bold text-emerald-300">
                        FREE
                      </span>
                    ) : (
                      <>
                        <div className="text-sm font-semibold text-white">
                          {formatLocalPrice(local, o.currency, o.symbol)}
                        </div>
                        <div className="text-[11px] text-slate-400 dark:text-slate-500">
                          {formatUsd(usd)} {billing === "annual" ? "/yr" : "/mo"}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
            {rows.length > 6 && (
              <div className="pt-1 text-center text-xs text-slate-400 dark:text-slate-500">
                +{rows.length - 6} more
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function effectiveLocal(o: ComputedOffer, billing: BillingMode): number {
  if (billing === "annual") return o.annualLocalPrice ?? o.localPrice * 12;
  return o.localPrice;
}
function effectiveUsd(o: ComputedOffer, billing: BillingMode): number {
  if (billing === "annual") return o.annualUsdEquivalent ?? o.usdEquivalent * 12;
  return o.usdEquivalent;
}
