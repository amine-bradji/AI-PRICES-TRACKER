"use client";

import { memo, useMemo } from "react";
import type { ComputedOffer, Region } from "@/lib/types";
import { formatLocalPrice, formatUsd } from "@/lib/format";
import type { BillingMode } from "@/components/Toolbar";

interface Props {
  regions: Region[];
  regionA: string;
  regionB: string;
  /** The full, unfiltered offer set (owned by the page, fetched once). */
  offers: ComputedOffer[];
  billing: BillingMode;
  onSetRegionA: (c: string) => void;
  onSetRegionB: (c: string) => void;
}

/**
 * Side-by-side comparison of two regions. Operates entirely on the offer set
 * passed in via props — no extra requests.
 */
function RegionCompareBase({
  regions,
  regionA,
  regionB,
  offers,
  billing,
  onSetRegionA,
  onSetRegionB,
}: Props) {
  const offersA = useMemo(
    () => offers.filter((o) => o.regionCode === regionA && !o.isFree),
    [offers, regionA],
  );
  const offersB = useMemo(
    () => offers.filter((o) => o.regionCode === regionB && !o.isFree),
    [offers, regionB],
  );

  const mapA = useMemo(() => cheapestByProvider(offersA, billing), [offersA, billing]);
  const mapB = useMemo(() => cheapestByProvider(offersB, billing), [offersB, billing]);

  const allIds = useMemo(
    () => [...new Set([...mapA.keys(), ...mapB.keys()])],
    [mapA, mapB],
  );

  if (!regionA && !regionB) return null;

  return (
    <section className="card mb-6 p-5">
      <h2 className="mb-4 text-xs font-medium uppercase tracking-wide text-ink-tertiary">
        Region comparison
      </h2>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <RegionSelect label="A" regions={regions} value={regionA} onChange={onSetRegionA} />
        <span className="text-sm text-ink-tertiary">vs</span>
        <RegionSelect label="B" regions={regions} value={regionB} onChange={onSetRegionB} />
      </div>

      {allIds.length === 0 ? (
        <p className="text-sm text-ink-tertiary">Select two regions to compare.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-hairline text-left text-xs uppercase tracking-wide text-ink-tertiary">
                <th scope="col" className="px-3 py-2 font-medium">Provider</th>
                <th scope="col" className="px-3 py-2 text-right font-medium">{regionA || "Region A"}</th>
                <th scope="col" className="px-3 py-2 text-right font-medium">USD</th>
                <th scope="col" className="px-3 py-2 text-right font-medium">{regionB || "Region B"}</th>
                <th scope="col" className="px-3 py-2 text-right font-medium">USD</th>
                <th scope="col" className="px-3 py-2 text-right font-medium" title="B priced relative to A — green means B is cheaper">Diff (B−A)</th>
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
                  <tr key={pid} className="border-b border-hairline">
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-1.5">
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: a?.providerColor ?? b?.providerColor }}
                          aria-hidden="true"
                        />
                        <span className="font-medium text-ink-primary">
                          {a?.providerName ?? b?.providerName}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-2 text-right text-ink-secondary">
                      {a ? formatLocalPrice(effLocal(a, billing), a.currency, a.symbol) : "—"}
                    </td>
                    <td className="px-3 py-2 text-right text-ink-tertiary">
                      {a ? formatUsd(usdA) : "—"}
                    </td>
                    <td className="px-3 py-2 text-right text-ink-secondary">
                      {b ? formatLocalPrice(effLocal(b, billing), b.currency, b.symbol) : "—"}
                    </td>
                    <td className="px-3 py-2 text-right text-ink-tertiary">
                      {b ? formatUsd(usdB) : "—"}
                    </td>
                    <td className="px-3 py-2 text-right">
                      {a && b && diff !== 0 ? (
                        <span
                          className="text-xs font-semibold"
                          style={{ color: diff < 0 ? "var(--ok)" : "var(--danger)" }}
                        >
                          {diff < 0 ? "↓" : "↑"} ${Math.abs(diff).toFixed(2)}
                        </span>
                      ) : (
                        <span className="text-xs text-ink-tertiary">—</span>
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

export const RegionCompare = memo(RegionCompareBase);

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
      <span className="text-xs font-medium uppercase tracking-wide text-ink-tertiary">
        Region {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={`Comparison region ${label}`}
        className="rounded-md border border-hairline bg-canvas py-1.5 pl-2 pr-8 text-sm font-medium text-ink-primary outline-none transition hover:border-hairline-strong focus:border-hairline-strong"
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
