"use client";

import { useEffect, useMemo, useState } from "react";
import type { ComputedOffer, Region } from "@/lib/types";
import { formatLocalPrice, formatUsd } from "@/lib/format";
import type { BillingMode } from "@/components/Toolbar";

interface Props {
  regions: Region[];
  regionA: string;
  regionB: string;
  /** Optional pre-filtered offers; ignored in favor of an internal unfiltered fetch. */
  offers?: ComputedOffer[];
  billing: BillingMode;
  onSetRegionA: (c: string) => void;
  onSetRegionB: (c: string) => void;
}

/**
 * Side-by-side comparison of two regions: cheapest paid tier per provider,
 * showing local price and USD equivalent for each.
 *
 * Fetches its OWN unfiltered offer set so it works regardless of the main
 * region filter applied elsewhere on the page.
 */
export function RegionCompare({
  regions,
  regionA,
  regionB,
  billing,
  onSetRegionA,
  onSetRegionB,
}: Props) {
  const [allOffers, setAllOffers] = useState<ComputedOffer[]>([]);

  // Fetch every offer (no region/provider filter) once on mount.
  useEffect(() => {
    let active = true;
    fetch("/api/offers", { cache: "no-store" })
      .then((r) => r.json())
      .then((j: { offers: ComputedOffer[] }) => {
        if (active) setAllOffers(j.offers ?? []);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const offersA = useMemo(
    () => allOffers.filter((o) => o.regionCode === regionA && !o.isFree),
    [allOffers, regionA],
  );
  const offersB = useMemo(
    () => allOffers.filter((o) => o.regionCode === regionB && !o.isFree),
    [allOffers, regionB],
  );

  // Cheapest per provider per region.
  const mapA = useMemo(() => cheapestByProvider(offersA, billing), [offersA, billing]);
  const mapB = useMemo(() => cheapestByProvider(offersB, billing), [offersB, billing]);

  // Merge provider ids from both.
  const allIds = useMemo(
    () => [...new Set([...mapA.keys(), ...mapB.keys()])],
    [mapA, mapB],
  );

  if (!regionA && !regionB) return null;

  return (
    <section className="card mb-6 p-5">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        Region comparison
      </h2>

      {/* Region selectors */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <RegionSelect label="A" regions={regions} value={regionA} onChange={onSetRegionA} />
        <span className="text-slate-500 dark:text-slate-600">vs</span>
        <RegionSelect label="B" regions={regions} value={regionB} onChange={onSetRegionB} />
      </div>

      {allIds.length === 0 ? (
        <p className="text-sm text-slate-400 dark:text-slate-500">Select two regions to compare.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-left text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                <th className="px-3 py-2 font-medium">Provider</th>
                <th className="px-3 py-2 text-right font-medium">{regionA || "Region A"}</th>
                <th className="px-3 py-2 text-right font-medium">USD</th>
                <th className="px-3 py-2 text-right font-medium">{regionB || "Region B"}</th>
                <th className="px-3 py-2 text-right font-medium">USD</th>
                <th className="px-3 py-2 text-right font-medium">Diff</th>
              </tr>
            </thead>
            <tbody>
              {allIds.map((pid) => {
                const a = mapA.get(pid);
                const b = mapB.get(pid);
                if (!a && !b) return null;
                const usdA = a ? effUsd(a, billing) : 0;
                const usdB = b ? effUsd(b, billing) : 0;
                const diff = usdB - usdA;
                return (
                  <tr key={pid} className="border-b border-slate-200/60 dark:border-slate-200 dark:border-slate-800/60">
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-1.5">
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: a?.providerColor ?? b?.providerColor }}
                        />
                        <span className="font-medium text-slate-700 dark:text-slate-200">
                          {a?.providerName ?? b?.providerName}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-2 text-right text-slate-600 dark:text-slate-300">
                      {a
                        ? formatLocalPrice(effLocal(a, billing), a.currency, a.symbol)
                        : "—"}
                    </td>
                    <td className="px-3 py-2 text-right text-slate-400 dark:text-slate-500">
                      {a ? formatUsd(usdA) : "—"}
                    </td>
                    <td className="px-3 py-2 text-right text-slate-600 dark:text-slate-300">
                      {b
                        ? formatLocalPrice(effLocal(b, billing), b.currency, b.symbol)
                        : "—"}
                    </td>
                    <td className="px-3 py-2 text-right text-slate-400 dark:text-slate-500">
                      {b ? formatUsd(usdB) : "—"}
                    </td>
                    <td className="px-3 py-2 text-right">
                      {a && b && diff !== 0 ? (
                        <span
                          className={`text-xs font-semibold ${
                            diff < 0 ? "text-emerald-400" : "text-red-400"
                          }`}
                        >
                          {diff < 0 ? "↓" : "↑"} ${Math.abs(diff).toFixed(2)}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-500 dark:text-slate-600">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function RegionSelect({
  label,
  regions,
  value,
  onChange,
}: {
  label: string;
  regions: Region[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="rounded-full bg-brand-500/20 px-2 py-0.5 text-xs font-bold text-brand-300">
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 py-1.5 pl-2 pr-8 text-sm font-medium text-slate-800 dark:text-slate-100 outline-none transition focus:border-brand-500"
      >
        <option value="">Select region…</option>
        {regions.map((r) => (
          <option key={r.code} value={r.code}>
            {r.flag} {r.name}
          </option>
        ))}
      </select>
    </label>
  );
}

function cheapestByProvider(offers: ComputedOffer[], billing: BillingMode) {
  const m = new Map<string, ComputedOffer>();
  for (const o of offers) {
    const cur = m.get(o.providerId);
    const usd = effUsd(o, billing);
    if (!cur || usd < effUsd(cur, billing)) m.set(o.providerId, o);
  }
  return m;
}

function effLocal(o: ComputedOffer, b: BillingMode): number {
  if (b === "annual") return o.annualLocalPrice ?? o.localPrice * 12;
  return o.localPrice;
}
function effUsd(o: ComputedOffer, b: BillingMode): number {
  if (b === "annual") return o.annualUsdEquivalent ?? o.usdEquivalent * 12;
  return o.usdEquivalent;
}
