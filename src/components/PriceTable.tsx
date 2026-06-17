"use client";

import { memo, useMemo, useState, useTransition } from "react";
import type { ComputedOffer } from "@/lib/types";
import { REGION_BY_CODE } from "@/data/regions";
import { formatLocalPrice, formatUsd } from "@/lib/format";
import type { BillingMode } from "@/components/Toolbar";

type SortKey = "provider" | "tier" | "region" | "local" | "usd";
type SortDir = "asc" | "desc";

interface Props {
  offers: ComputedOffer[];
  billing: BillingMode;
}

/** Sortable price comparison table. Honors billing mode (monthly vs annual). */
function PriceTableBase({ offers, billing }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>("usd");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [, startTransition] = useTransition();

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
    // Non-urgent: keep the header click instant, let the re-sort settle a frame later.
    startTransition(() => {
      if (sortKey === key) {
        setSortDir((d) => (d === "asc" ? "desc" : "asc"));
      } else {
        setSortKey(key);
        setSortDir("asc");
      }
    });
  }

  if (offers.length === 0) {
    return (
      <div className="card p-10 text-center text-ink-secondary">
        No offers match the current filters.
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[46rem] border-collapse text-sm">
          <thead>
            <tr className="border-b border-hairline text-left text-xs uppercase tracking-wide text-ink-tertiary">
              <Th label="Provider" sortKey="provider" active={sortKey === "provider"} dir={sortDir} onSort={toggleSort} />
              <Th label="Tier" sortKey="tier" active={sortKey === "tier"} dir={sortDir} onSort={toggleSort} />
              <Th label="Region" sortKey="region" active={sortKey === "region"} dir={sortDir} onSort={toggleSort} />
              <Th label={billing === "annual" ? "Annual" : "Local price"} sortKey="local" align="right" active={sortKey === "local"} dir={sortDir} onSort={toggleSort} />
              <Th label="USD eq." sortKey="usd" align="right" active={sortKey === "usd"} dir={sortDir} onSort={toggleSort} />
              <th className="px-4 py-3 font-medium">Note</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((o) => {
              const region = REGION_BY_CODE.get(o.regionCode);
              const local = effectiveLocal(o, billing);
              const usd = effectiveUsd(o, billing);
              const hasAnnualDiscount = o.annualUsdEquivalent != null && billing === "annual";
              const monthlyEff = hasAnnualDiscount && o.annualUsdEquivalent != null
                ? o.annualUsdEquivalent / 12
                : null;
              return (
                <tr
                  key={`${o.providerId}-${o.tierId}-${o.regionCode}`}
                  className="border-b border-hairline transition-colors hover:bg-subtle"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 font-medium text-ink-primary">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: o.providerColor }} aria-hidden="true" />
                      {o.providerName}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-ink-secondary">{o.tierName}</td>
                  <td className="px-4 py-3 text-ink-secondary">
                    <span aria-hidden="true">{region?.flag} </span>
                    {o.regionCode}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {o.isFree ? (
                      <span
                        className="rounded-full border px-2.5 py-0.5 text-xs font-semibold"
                        style={{
                          borderColor: "var(--ok)",
                          color: "var(--ok)",
                          backgroundColor: "var(--ok-bg)",
                        }}
                      >
                        Free
                      </span>
                    ) : (
                      <div>
                        <span className="font-semibold text-ink-primary">
                          {formatLocalPrice(local, o.currency, o.symbol)}
                        </span>
                        {hasAnnualDiscount && monthlyEff != null && (
                          <div className="text-xs text-ink-tertiary">
                            ≈ {formatUsd(monthlyEff)}/mo
                          </div>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right text-ink-tertiary">
                    {formatUsd(usd)}
                  </td>
                  <td className="px-4 py-3 text-xs text-ink-tertiary">
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

export const PriceTable = memo(PriceTableBase);

function Th({
  label,
  sortKey,
  align = "left",
  active,
  dir,
  onSort,
}: {
  label: string;
  sortKey: SortKey;
  align?: "left" | "right";
  active: boolean;
  dir: SortDir;
  onSort: (key: SortKey) => void;
}) {
  return (
    <th
      scope="col"
      aria-sort={active ? (dir === "asc" ? "ascending" : "descending") : "none"}
      className="p-0 font-medium"
    >
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        className={`flex w-full select-none items-center gap-1 px-4 py-3 transition-colors text-ink-tertiary hover:text-ink-primary ${
          align === "right" ? "justify-end" : ""
        }`}
      >
        {label}
        <span
          aria-hidden="true"
          className={`text-[10px] ${active ? "text-ink-primary" : "text-ink-tertiary"}`}
        >
          {active ? (dir === "asc" ? "▲" : "▼") : "↕"}
        </span>
        <span className="sr-only">
          {active ? `, sorted ${dir === "asc" ? "ascending" : "descending"}` : ", click to sort"}
        </span>
      </button>
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
