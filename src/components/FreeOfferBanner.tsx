"use client";

import type { ComputedOffer } from "@/lib/types";
import { REGIONS } from "@/data/regions";

interface Props {
  highlights: ComputedOffer[];
  onPickRegion: (code: string) => void;
}

/**
 * The star feature: a horizontal scroller of regional FREE offers, so the
 * "free ChatGPT Pro in Korea"-style deals are impossible to miss.
 */
export function FreeOfferBanner({ highlights, onPickRegion }: Props) {
  if (highlights.length === 0) return null;

  return (
    <section className="card mb-6 overflow-hidden">
      <div className="flex items-center gap-2 border-b border-slate-300/80 dark:border-slate-200 dark:border-slate-800/80 bg-emerald-500/5 px-5 py-3">
        <span className="text-lg">🎁</span>
        <h2 className="text-sm font-semibold text-emerald-300">
          Free regional offers
        </h2>
        <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs font-medium text-emerald-300">
          {highlights.length}
        </span>
      </div>
      <div className="flex gap-3 overflow-x-auto p-4">
        {highlights.map((h, i) => {
          const region = REGIONS.find((r) => r.code === h.regionCode);
          return (
            <button
              key={`${h.providerId}-${h.regionCode}-${i}`}
              onClick={() => onPickRegion(h.regionCode)}
              className="group min-w-[15rem] flex-shrink-0 rounded-xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-transparent p-4 text-left transition hover:border-emerald-400 hover:from-emerald-500/20"
            >
              <div className="flex items-center justify-between">
                <span className="text-2xl">{region?.flag ?? "🌐"}</span>
                <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-emerald-300">
                  Free
                </span>
              </div>
              <div className="mt-2 text-sm font-semibold text-white">
                {h.providerName}
                {h.tierName ? ` · ${h.tierName}` : ""}
              </div>
              <div className="text-sm text-emerald-300">
                {h.regionalHeadline ?? "Free access offer"}
              </div>
              <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {region?.name} · {h.regionalNote ?? "tap to view"}
              </div>
            </button>
          );
        })}
      </div>
      <p className="border-t border-slate-300/80 dark:border-slate-200 dark:border-slate-800/80 px-5 py-2 text-xs text-slate-400 dark:text-slate-500">
        Illustrative entries demonstrating the offers this tracker surfaces. Verify availability on each provider's site before relying on them.
      </p>
    </section>
  );
}
