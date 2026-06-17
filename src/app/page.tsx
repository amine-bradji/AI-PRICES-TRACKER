"use client";

import { useMemo, useState } from "react";
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
import { REGIONS } from "@/data/regions";
import { usePrices } from "@/hooks/usePrices";

export default function Page() {
  const [regionCode, setRegionCode] = useState<string>("");
  const [providerId, setProviderId] = useState<string>("");
  const [freeOnly, setFreeOnly] = useState<boolean>(false);
  const [view, setView] = useState<ViewMode>("table");
  const [billing, setBilling] = useState<BillingMode>("monthly");
  const [query, setQuery] = useState<string>("");
  const [compareA, setCompareA] = useState<string>("");
  const [compareB, setCompareB] = useState<string>("KR");

  const {
    regions,
    data,
    loading,
    updating,
    cooldown,
    lastMessage,
    update,
  } = usePrices({ regionCode: regionCode || undefined, providerId: providerId || undefined, freeOnly });

  const regionName = useMemo(
    () => regions.find((r) => r.code === regionCode)?.name,
    [regions, regionCode],
  );

  // Client-side text search layered on top of the server-filtered offers.
  const searched = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q || !data) return data?.offers ?? [];
    const byRegion = new Map(REGIONS.map((r) => [r.code, r]));
    return data.offers.filter((o) => {
      const region = byRegion.get(o.regionCode);
      const hay = [
        o.providerName,
        o.tierName,
        o.regionCode,
        region?.name ?? "",
        region?.currency ?? "",
        o.regionalHeadline ?? "",
      ].join(" ").toLowerCase();
      return hay.includes(q);
    });
  }, [data, query]);

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
        <StatCard label="Providers" value={data?.stats.providerCount ?? "—"} icon="🧩" accent="#329dff" />
        <StatCard label="Offers in view" value={searched.length} icon="📊" accent="#8ed5ff" />
        <StatCard label="Free offers" value={searched.filter((o) => o.isFree).length} icon="🎁" accent="#34d399" />
        <StatCard label="Regions tracked" value={regions.length} icon="🌍" accent="#a78bfa" />
      </section>

      {/* Free regional offers banner */}
      <FreeOfferBanner
        highlights={data?.freeHighlights ?? []}
        onPickRegion={(code) => setRegionCode(code)}
      />

      {/* Cheapest paid per provider for the selected region */}
      {regionCode && data && data.cheapestPaid.length > 0 && (
        <>
          <CheapestPaid regionName={regionName} offers={data.cheapestPaid} />
          <PriceChart cheapestPaid={data.cheapestPaid} billing={billing} />
        </>
      )}

      {/* Region side-by-side comparison */}
      <RegionCompare
        regions={regions}
        regionA={compareA}
        regionB={compareB}
        offers={data?.offers ?? []}
        billing={billing}
        onSetRegionA={setCompareA}
        onSetRegionB={setCompareB}
      />

      {/* Filters */}
      <section className="card mb-4 flex flex-col gap-4 p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <RegionPicker regions={regions} value={regionCode} onChange={setRegionCode} />
          <SearchBox value={query} onChange={setQuery} />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <ProviderFilter
            providers={data?.providers ?? []}
            value={providerId}
            onChange={setProviderId}
            freeOnly={freeOnly}
            onToggleFreeOnly={setFreeOnly}
          />
          <div className="flex items-center gap-3">
            <ExportButton regionCode={regionCode || undefined} providerId={providerId || undefined} freeOnly={freeOnly} />
            <Toolbar
              view={view}
              onViewChange={setView}
              billing={billing}
              onBillingChange={setBilling}
            />
          </div>
        </div>
      </section>

      {lastMessage && (
        <div className="mb-4 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-sm text-amber-300">
          {lastMessage}
        </div>
      )}

      {/* Offers view (table or cards) */}
      {loading ? (
        <div className="card p-10 text-center text-slate-500 dark:text-slate-400">Loading prices…</div>
      ) : view === "table" ? (
        <PriceTable offers={searched} billing={billing} />
      ) : (
        <ProviderCards offers={searched} billing={billing} />
      )}

      <footer className="mt-10 border-t border-slate-200 dark:border-slate-800 pt-5 text-xs leading-relaxed text-slate-400 dark:text-slate-500">
        <p>
          <strong className="text-slate-500 dark:text-slate-400">Data:</strong> Prices are community-curated
          demo values, converted to local currency using live exchange rates via the Update
          button. AI pricing changes often and varies by promotion — treat figures as
          indicative and verify on each provider's site.
        </p>
        <p className="mt-1">
          Regional free offers are illustrative entries. The Update button is rate-limited
          (≈60s) to avoid overloading upstream servers.
        </p>
        <p className="mt-2">
          <a href="/docs" className="text-brand-400 underline-offset-2 hover:underline">
            API documentation →
          </a>
        </p>
      </footer>
    </main>
  );
}
