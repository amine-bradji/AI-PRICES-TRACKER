"use client";

import { memo } from "react";
import type { ComputedOffer } from "@/lib/types";
import { REGION_BY_CODE } from "@/data/regions";

interface Props {
  highlights: ComputedOffer[];
  onPickRegion: (code: string) => void;
}

/**
 * Horizontal scroller of regional free offers. Calm, document-like: no glow,
 * no rainbow gradient, no emoji-as-icon. A "Free" tag and the headline are
 * the only accents.
 */
function FreeOfferBannerBase({ highlights, onPickRegion }: Props) {
  if (highlights.length === 0) return null;

  return (
    <section className="card mb-6 overflow-hidden">
      <div className="flex items-center gap-2 border-b border-hairline px-5 py-3">
        <h2 className="text-sm font-semibold text-ink-primary">
          Free regional offers
        </h2>
        <span className="rounded-full border border-hairline bg-subtle px-2 py-0.5 text-xs font-medium text-ink-secondary">
          {highlights.length}
        </span>
      </div>
      <div className="flex gap-3 overflow-x-auto p-4">
        {highlights.map((h, i) => {
          const region = REGION_BY_CODE.get(h.regionCode);
          return (
            <button
              key={`${h.providerId}-${h.regionCode}-${i}`}
              onClick={() => onPickRegion(h.regionCode)}
              className="group flex min-w-[15rem] flex-shrink-0 flex-col gap-1 rounded-lg border border-hairline bg-canvas p-4 text-left transition hover:border-hairline-strong hover:bg-subtle"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-ink-secondary" aria-hidden="true">
                  {region?.flag ?? ""} {region?.name ?? h.regionCode}
                </span>
                <span
                  className="rounded-full border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide"
                  style={{
                    borderColor: "var(--ok)",
                    color: "var(--ok)",
                    backgroundColor: "var(--ok-bg)",
                  }}
                >
                  Free
                </span>
              </div>
              <div className="text-sm font-semibold text-ink-primary">
                {h.providerName}
                {h.tierName ? ` · ${h.tierName}` : ""}
              </div>
              <div className="text-sm text-ink-secondary">
                {h.regionalHeadline ?? "Free access offer"}
              </div>
              {h.regionalNote && (
                <div className="text-xs text-ink-tertiary">{h.regionalNote}</div>
              )}
            </button>
          );
        })}
      </div>
      <p className="border-t border-hairline px-5 py-2 text-xs text-ink-tertiary">
        Illustrative entries showing the offers this tracker surfaces. Verify availability on each provider&apos;s site before relying on them.
      </p>
    </section>
  );
}

export const FreeOfferBanner = memo(FreeOfferBannerBase);
