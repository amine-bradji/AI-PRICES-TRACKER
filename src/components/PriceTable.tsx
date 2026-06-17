"use client";

import { useMemo, useState } from "react";
import type { ComputedOffer } from "@/lib/types";
import { REGIONS } from "@/data/regions";
import { formatLocalPrice, formatUsd } from "@/lib/format";
import type { BillingMode } from "@/components/Toolbar";

type SortKey = "provider" | "tier" | "region" | "local" | "usd";
type SortDir = "asc" | "desc";

interface Props {
  offers: ComputedOffer[];
  billing: BillingMode;
}

/** Sortable price comparison table. Honors billing mode (monthly vs annual). */
export function PriceTable({ offers, billing }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>("usd");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const sorted = useMemo(() => {
    const copy = [...offers];
    copy.sort((a, b) => {
      let av: number | string;
      let bv: number | string;
      switch (sortKey) {
        case "provider": av = a.providerName; bv = b.providerName; break;
        case "tier": av = a.tierName; bv = b.tierName; break;
        case "region": av = a.regionCode; bv = b.regionCode; break;
        case "local": av = effectiveLocal(a, billing); bv = effectiveLocal(b, billing); break;
        case "usd":
        default: av = effectiveUsd(a, billing); bv = effectiveUsd(b, billing); break;
      }
      const cmp = typeof av === "number" && typeof bv === "number"
        ? av - bv
        : String(av).localeCompare(String(bv));
      return sortDir === "asc" ? cmp : -cmp;
    });
    return copy;
  }, [offers, sortKey, sortDir, billing]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  if (offers.length === 0) {
    return (
      <div className="card p-10 text-center text-slate-500 dark:text-slate-400">
        No offers match the current filters.
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[46rem] border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 text-left text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
              <Th label="Provider" active={sortKey === "provider"} dir={sortDir} onClick={() => toggleSort("provider")} />
              <Th label="Tier" active={sortKey === "tier"} dir={sortDir} onClick={() => toggleSort("tier")} />
              <Th label="Region" active={sortKey === "region"} dir={sortDir} onClick={() => toggleSort("region")} />
              <Th label={billing === "annual" ? "Annual" : "Local price"} align="right" active={sortKey === "local"} dir={sortDir} onClick={() => toggleSort("local")} />
              <Th label="USD eq." align="right" active={sortKey === "usd"} dir={sortDir} onClick={() => toggleSort("usd")} />
              <th className="px-4 py-3 font-medium">Note</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((o, i) => {
              const region = REGIONS.find((r) => r.code === o.regionCode);
              const local = effectiveLocal(o, billing);
              const usd = effectiveUsd(o, billing);
              const hasAnnualDiscount = o.annualUsdEquivalent != null && billing === "annual";
              const monthlyEff = hasAnnualDiscount && o.annualUsdEquivalent != null
                ? o.annualUsdEquivalent / 12
                : null;
              return (
                <tr
                  key={`${o.providerId}-${o.tierId}-${o.regionCode}-${i}`}
                  className="border-b border-slate-200/60 dark:border-slate-200 dark:border-slate-800/60 transition hover:bg-gray-100 dark:hover:bg-gray-100/60 dark:bg-gray-200 dark:bg-slate-800/30"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 font-medium">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: o.providerColor }} />
                      {o.providerName}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{o.tierName}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                    {region?.flag} {o.regionCode}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {o.isFree ? (
                      <span className="rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-bold text-emerald-300">
                        FREE
                      </span>
                    ) : (
                      <div>
                        <span className="font-semibold text-white">
                          {formatLocalPrice(local, o.currency, o.symbol)}
                        </span>
                        {hasAnnualDiscount && monthlyEff != null && (
                          <div className="text-[11px] text-slate-400 dark:text-slate-500">
                            ≈ {formatUsd(monthlyEff)}/mo
                          </div>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right text-slate-500 dark:text-slate-400">
                    {formatUsd(usd)}
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400">
                    {o.regionalHeadline
                      ? `${o.regionalHeadline}${o.regionalNote ? ` — ${o.regionalNote}` : ""}`
                      : o.billingCycle}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Th({
  label,
  align = "left",
  active,
  dir,
  onClick,
}: {
  label: string;
  align?: "left" | "right";
  active: boolean;
  dir: SortDir;
  onClick: () => void;
}) {
  return (
    <th
      onClick={onClick}
      className={`cursor-pointer select-none px-4 py-3 font-medium transition hover:text-slate-700 dark:hover:text-slate-700 dark:text-slate-200 ${align === "right" ? "text-right" : ""}`}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        <span className={`text-[10px] ${active ? "text-brand-400" : "text-slate-500 dark:text-slate-600"}`}>
          {active ? (dir === "asc" ? "▲" : "▼") : "↕"}
        </span>
      </span>
    </th>
  );
}

/** Pick the price to show depending on billing mode, falling back gracefully. */
function effectiveLocal(o: ComputedOffer, billing: BillingMode): number {
  if (billing === "annual") return o.annualLocalPrice ?? o.localPrice * 12;
  return o.localPrice;
}
function effectiveUsd(o: ComputedOffer, billing: BillingMode): number {
  if (billing === "annual") return o.annualUsdEquivalent ?? o.usdEquivalent * 12;
  return o.usdEquivalent;
}
