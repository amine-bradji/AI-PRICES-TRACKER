"use client";

import { memo } from "react";
import type { ComputedOffer } from "@/lib/types";
import { formatLocalPrice, formatUsd } from "@/lib/format";

interface Props {
  regionName?: string;
  offers: ComputedOffer[];
}

/** Cheapest paid tier per provider for the selected region. */
function CheapestPaidBase({ regionName, offers }: Props) {
  if (offers.length === 0) return null;
  const cheapest = offers[0];

  return (
    <section className="card mb-6 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-xs font-medium uppercase tracking-wide text-ink-tertiary">
            Cheapest paid option {regionName ? `in ${regionName}` : ""}
          </h2>
          <div className="mt-1 flex items-center gap-2">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: cheapest.providerColor }}
              aria-hidden="true"
            />
            <span className="text-lg font-semibold text-ink-primary">
              {cheapest.providerName} · {cheapest.tierName}
            </span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-semibold text-ink-primary">
            {formatLocalPrice(cheapest.localPrice, cheapest.currency, cheapest.symbol)}
          </div>
          <div className="text-xs text-ink-tertiary">
            ≈ {formatUsd(cheapest.usdEquivalent)} / {cheapest.billingCycle}
          </div>
        </div>
      </div>

      {offers.length > 1 && (
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {offers.slice(0, 8).map((o) => (
            <div
              key={`${o.providerId}-${o.tierId}`}
              className="rounded-md border border-hairline bg-subtle px-3 py-2"
            >
              <div className="flex items-center gap-1.5 text-xs text-ink-tertiary">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: o.providerColor }} aria-hidden="true" />
                {o.providerName}
              </div>
              <div className="mt-0.5 text-sm font-semibold text-ink-primary">
                {formatLocalPrice(o.localPrice, o.currency, o.symbol)}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export const CheapestPaid = memo(CheapestPaidBase);
