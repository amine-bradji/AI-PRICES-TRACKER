"use client";

import { memo, useMemo } from "react";
import type { ComputedOffer } from "@/lib/types";
import { REGION_BY_CODE } from "@/data/regions";
import { formatLocalPrice, formatUsd } from "@/lib/format";
import type { BillingMode } from "@/components/Toolbar";

interface Props {
  offers: ComputedOffer[];
  billing: BillingMode;
}

/**
 * Card-grid view: groups offers by provider. Each provider gets one card
 * listing its tiers + prices. Honors billing mode.
 */
function ProviderCardsBase({ offers, billing }: Props) {
  const groups = useMemo(() => {
    const m = new Map<string, { provider: ComputedOffer; rows: ComputedOffer[] }>();
    for (const o of offers) {
      const g = m.get(o.providerId);
      if (g) g.rows.push(o);
      else m.set(o.providerId, { provider: o, rows: [o] });
    }
    return [...m.values()];
  }, [offers]);

  if (offers.length === 0) {
    return (
      <div className="card p-10 text-center text-ink-secondary">
        No offers match the current filters.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {groups.map(({ provider, rows }) => (
        <div key={provider.providerId} className="card flex flex-col p-5">
          <div className="mb-3 flex items-center gap-2.5">
            <span
              className="flex h-9 w-9 items-center justify-center rounded-md text-sm font-semibold text-white"
              style={{ backgroundColor: provider.providerColor }}
              aria-hidden="true"
            >
              {provider.providerName.charAt(0)}
            </span>
            <div className="min-w-0">
              <div className="truncate font-semibold text-ink-primary">{provider.providerName}</div>
              <div className="text-xs text-ink-tertiary">{rows.length} tiers in view</div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            {rows.slice(0, 6).map((o) => {
              const region = REGION_BY_CODE.get(o.regionCode);
              const local = effectiveLocal(o, billing);
              const usd = effectiveUsd(o, billing);
              return (
                <div
                  key={`${o.tierId}-${o.regionCode}`}
                  className="flex items-center justify-between rounded-md border border-hairline bg-subtle px-3 py-2"
                >
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium text-ink-primary">
                      {o.tierName}{" "}
                      <span className="text-xs text-ink-tertiary">
                        <span aria-hidden="true">{region?.flag} </span>
                        {o.regionCode}
                      </span>
                    </div>
                    {o.regionalHeadline && (
                      <div className="truncate text-xs" style={{ color: "var(--ok)" }}>
                        {o.regionalHeadline}
                      </div>
                    )}
                  </div>
                  <div className="ml-2 shrink-0 text-right">
                    {o.isFree ? (
                      <span
                        className="rounded-full border px-2 py-0.5 text-[11px] font-semibold"
                        style={{
                          borderColor: "var(--ok)",
                          color: "var(--ok)",
                          backgroundColor: "var(--ok-bg)",
                        }}
                      >
                        Free
                      </span>
                    ) : (
                      <>
                        <div className="text-sm font-semibold text-ink-primary">
                          {formatLocalPrice(local, o.currency, o.symbol)}
                        </div>
                        <div className="text-xs text-ink-tertiary">
                          {formatUsd(usd)} {billing === "annual" ? "/yr" : "/mo"}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
            {rows.length > 6 && (
              <div className="pt-1 text-center text-xs text-ink-tertiary">
                +{rows.length - 6} more
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export const ProviderCards = memo(ProviderCardsBase);

function effectiveLocal(o: ComputedOffer, billing: BillingMode): number {
  if (billing === "annual") return o.annualLocalPrice ?? o.localPrice * 12;
  return o.localPrice;
}
function effectiveUsd(o: ComputedOffer, billing: BillingMode): number {
  if (billing === "annual") return o.annualUsdEquivalent ?? o.usdEquivalent * 12;
  return o.usdEquivalent;
}
