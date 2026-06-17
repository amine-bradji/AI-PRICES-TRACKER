"use client";

import { useCallback, useDeferredValue, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { RegionPicker } from "@/components/RegionPicker";
import { ProviderFilter } from "@/components/ProviderFilter";
import { StatCard } from "@/components/StatCard";
import { FreeOfferBanner } from "@/components/FreeOfferBanner";
import { CheapestPaid } from "@/components/CheapestPaid";
import { PriceTable } from "@/components/PriceTable";
import { ProviderCards } from "@/components/ProviderCards";
import { Toolbar, type ViewMode, type BillingMode } from "@/components/Toolbar";
import { SearchBox } from "@/components/SearchBox";
import { PriceChart } from "@/components/PriceChart";
import { RegionCompare } from "@/components/RegionCompare";
import { ExportButton } from "@/components/ExportButton";
import { REGIONS, REGION_BY_CODE } from "@/data/regions";
import { filterOffers, cheapestPaidByRegion } from "@/lib/aggregate";
import { usePrices } from "@/hooks/usePrices";

export default function Page() {
  const [regionCode, setRegionCode] = useState<string>("");
  const [providerId, setProviderId] = useState<string>("");
  const [freeOnly, setFreeOnly] = useState<boolean>(false);
  const [view, setView] = useState<ViewMode>("table");
  const [billing, setBilling] = useState<BillingMode>("monthly");
  const [query, setQuery] = useState<string>("");
  const [compareA, setCompareA] = useState<string>("US");
  const [compareB, setCompareB] = useState<string>("KR");
  const [, startTransition] = useTransition();

  const { data, loading, updating, cooldown, lastMessage, update } = usePrices();

  const allOffers = data?.offers ?? [];

  // region/provider/free filters — instant, in-memory (no network round-trip).
  const filtered = useMemo(
    () =>
      filterOffers(allOffers, {
        regionCode: regionCode || undefined,
        providerId: providerId || undefined,
        freeOnly,
      }),
    [allOffers, regionCode, providerId, freeOnly],
  );

  // Free-text search layered on top. Deferred so the input stays responsive
  // while the (cheap) filter pass lags one frame behind on slower devices.
  const deferredQuery = useDeferredValue(query);
  const searched = useMemo(() => {
    const q = deferredQuery.trim().toLowerCase();
    if (!q) return filtered;
    return filtered.filter((o) => {
      const region = REGION_BY_CODE.get(o.regionCode);
      const hay = [
        o.providerName,
        o.tierName,
        o.regionCode,
        region?.name ?? "",
        region?.currency ?? "",
        o.regionalHeadline ?? "",
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [filtered, deferredQuery]);

  const freeCount = useMemo(
    () => searched.reduce((n, o) => n + (o.isFree ? 1 : 0), 0),
    [searched],
  );

  // Cheapest paid per provider for the selected region — derived client-side.
  const cheapestPaid = useMemo(
    () => (regionCode ? cheapestPaidByRegion(allOffers, regionCode) : []),
    [allOffers, regionCode],
  );

  const regionName = REGION_BY_CODE.get(regionCode)?.name;
  const providers = data?.providers ?? [];
  const freeHighlights = data?.freeHighlights ?? [];

  // Non-urgent UI transitions — keep the control click instant on big lists.
  // useCallback keeps the memoized Toolbar from re-rendering on every page render.
  const handleViewChange = useCallback((v: ViewMode) => startTransition(() => setView(v)), [startTransition]);
  const handleBillingChange = useCallback((b: BillingMode) => startTransition(() => setBilling(b)), [startTransition]);

  return (
    <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
      <Header
        updatedAt={data?.updatedAt ?? 0}
        cooldown={cooldown}
        updating={updating}
        fxSource={data?.fxSource ?? null}
        onUpdate={update}
      />

      {/* Stats */}
      <section className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Providers" value={loading ? <Shimmer w="2rem" /> : (data?.stats.providerCount ?? "—")} />
        <StatCard label="Offers in view" value={loading ? <Shimmer w="2.5rem" /> : searched.length} />
        <StatCard label="Free offers" value={loading ? <Shimmer w="2rem" /> : freeCount} />
        <StatCard label="Regions tracked" value={REGIONS.length} />
      </section>

      {loading ? (
        <OffersSkeleton />
      ) : (
        <>
          <FreeOfferBanner highlights={freeHighlights} onPickRegion={setRegionCode} />

          {regionCode && cheapestPaid.length > 0 && (
            <>
              <CheapestPaid regionName={regionName} offers={cheapestPaid} />
              <PriceChart cheapestPaid={cheapestPaid} billing={billing} />
            </>
          )}

          <RegionCompare
            regions={REGIONS}
            regionA={compareA}
            regionB={compareB}
            offers={allOffers}
            billing={billing}
            onSetRegionA={setCompareA}
            onSetRegionB={setCompareB}
          />

          {/* Filters */}
          <section className="card mb-4 flex flex-col gap-4 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <RegionPicker regions={REGIONS} value={regionCode} onChange={setRegionCode} />
              <SearchBox value={query} onChange={setQuery} />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <ProviderFilter
                providers={providers}
                value={providerId}
                onChange={setProviderId}
                freeOnly={freeOnly}
                onToggleFreeOnly={setFreeOnly}
              />
              <div className="flex items-center gap-3">
                <ExportButton regionCode={regionCode || undefined} providerId={providerId || undefined} freeOnly={freeOnly} />
                <Toolbar
                  view={view}
                  onViewChange={handleViewChange}
                  billing={billing}
                  onBillingChange={handleBillingChange}
                />
              </div>
            </div>
          </section>

          {lastMessage && (
            <div
              className="mb-4 rounded-md border px-4 py-2 text-sm"
              style={{
                borderColor: "var(--warn)",
                color: "var(--warn)",
                backgroundColor: "var(--warn-bg)",
              }}
            >
              {lastMessage}
            </div>
          )}

          {view === "table" ? (
            <PriceTable offers={searched} billing={billing} />
          ) : (
            <ProviderCards offers={searched} billing={billing} />
          )}
        </>
      )}

      <footer className="mt-10 border-t pt-5 text-xs leading-relaxed text-ink-tertiary" style={{ borderColor: "var(--line-default)" }}>
        <p>
          <strong className="text-ink-secondary">Data:</strong> Prices are community-curated
          demo values, converted to local currency using live exchange rates via the Update
          button. AI pricing changes often and varies by promotion — treat figures as
          indicative and verify on each provider&apos;s site.
        </p>
        <p className="mt-1">
          Regional free offers are illustrative entries. The Update button is rate-limited
          (≈60s) to avoid overloading upstream servers.
        </p>
        <p className="mt-2">
          <Link href="/docs" className="underline-offset-2 hover:underline" style={{ color: "var(--accent)" }}>
            API documentation →
          </Link>
        </p>
      </footer>
    </main>
  );
}

/** Inline shimmer block used while the first data payload is loading. */
function Shimmer({ w }: { w: string }) {
  return <span className="skeleton inline-block h-7 align-middle" style={{ width: w }} />;
}

/** Placeholder that reserves the offers area's space to avoid layout shift. */
function OffersSkeleton() {
  return (
    <div className="card overflow-hidden p-5" aria-hidden="true">
      <div className="mb-4 flex items-center gap-4">
        <div className="skeleton h-4 w-28" />
        <div className="skeleton h-4 w-16" />
        <div className="skeleton h-4 w-20" />
        <div className="skeleton ml-auto h-4 w-16" />
      </div>
      <div className="flex flex-col gap-3">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <div className="skeleton h-5 w-40" />
            <div className="skeleton h-5 w-20" />
            <div className="skeleton h-5 w-16" />
            <div className="skeleton ml-auto h-5 w-20" />
          </div>
        ))}
      </div>
    </div>
  );
}
