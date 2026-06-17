import { PROVIDERS, REGIONAL_OFFERS, providerById } from "@/data/catalog";
import { REGIONS, regionByCode } from "@/data/regions";
import type { ComputedOffer as PublicOffer, RegionalOffer } from "@/lib/types";

/**
 * Pre-index regional overrides by `${providerId}:${regionCode}` so the hot
 * triple loop below does an O(1) Map lookup instead of a linear scan of the
 * whole REGIONAL_OFFERS array for every region×provider×tier cell.
 */
const OVERRIDES_BY_PROVIDER_REGION: Map<string, RegionalOffer[]> = (() => {
  const m = new Map<string, RegionalOffer[]>();
  for (const o of REGIONAL_OFFERS) {
    const key = `${o.providerId}:${o.regionCode}`;
    const arr = m.get(key);
    if (arr) arr.push(o);
    else m.set(key, [o]);
  }
  return m;
})();

/** Minimal FX shape: currency code -> units per 1 USD. */
export type FxRatesLike = Record<string, number>;

/**
 * Aggregation engine.
 *
 * Pure functions: given FX rates + filters, produce the computed offer rows the
 * UI renders. No network, no side effects, no globals — easy to reason about and
 * to reuse from both server and client.
 */

export interface AggregateFilters {
  regionCode?: string;
  providerId?: string;
  freeOnly?: boolean;
}

/**
 * Compute every offer row across all providers × regions.
 * `rates` is a map of currency -> units per 1 USD.
 */
export function computeOffers(rates: Record<string, number>): PublicOffer[] {
  const offers: PublicOffer[] = [];

  for (const region of REGIONS) {
    const rate = rates[region.currency] ?? region.fallbackRate;

    for (const provider of PROVIDERS) {
      for (const tier of provider.tiers) {
        // Is there a regional override that matches this provider+region (and
        // optionally this tier)? Look up the small candidate list via the index.
        const candidates = OVERRIDES_BY_PROVIDER_REGION.get(`${provider.id}:${region.code}`);
        const override = candidates?.find(
          (o) => o.tierId == null || o.tierId === tier.id,
        );

        const isFree = override?.isFree ?? tier.isFree;
        // Local price: explicit override > USD conversion > 0 for free tiers.
        let localPrice: number;
        if (override?.localPrice != null) {
          localPrice = override.localPrice;
        } else if (tier.isFree) {
          localPrice = 0;
        } else {
          localPrice = round2(tier.usdPrice * rate);
        }

        // Annual price (local + USD) when the tier defines an annual plan.
        let annualLocalPrice: number | undefined;
        let annualUsdEquivalent: number | undefined;
        if (!isFree && tier.annualUsdPrice != null) {
          annualLocalPrice = round2(tier.annualUsdPrice * rate);
          annualUsdEquivalent = round2(annualLocalPrice / (rate || 1));
        }

        offers.push({
          providerId: provider.id,
          providerName: provider.name,
          providerColor: provider.color,
          tierId: tier.id,
          tierName: tier.name,
          regionCode: region.code,
          localPrice,
          usdEquivalent: round2(localPrice / (rate || 1)),
          currency: region.currency,
          symbol: region.symbol,
          billingCycle: tier.billingCycle,
          isFree,
          annualLocalPrice,
          annualUsdEquivalent,
          regionalHeadline: override?.headline,
          regionalNote: override?.note,
        });
      }
    }
  }

  return offers;
}

// Memoize the full offer set by rates-object identity. `getRates()` returns a
// stable object that is only replaced when the Update button refreshes FX, so
// repeated /api/offers and /api/export calls between updates reuse one compute
// instead of re-running the whole regions×providers×tiers loop each request.
let _cacheRates: Record<string, number> | null = null;
let _cacheOffers: PublicOffer[] | null = null;

/** Like computeOffers, but cached on the rates object reference. */
export function computeOffersCached(rates: Record<string, number>): PublicOffer[] {
  if (_cacheOffers && _cacheRates === rates) return _cacheOffers;
  _cacheOffers = computeOffers(rates);
  _cacheRates = rates;
  return _cacheOffers;
}

/**
 * Apply client-supplied filters to a precomputed offer list.
 */
export function filterOffers(offers: PublicOffer[], f: AggregateFilters): PublicOffer[] {
  return offers.filter((o) => {
    if (f.regionCode && o.regionCode !== f.regionCode) return false;
    if (f.providerId && o.providerId !== f.providerId) return false;
    if (f.freeOnly && !o.isFree) return false;
    return true;
  });
}

/**
 * Highlight reel: every regional free offer (the banner content).
 */
export function regionalFreeHighlights(rates: Record<string, number>): PublicOffer[] {
  return REGIONAL_OFFERS.filter((o) => o.isFree)
    .map((o) => {
      const provider = providerById(o.providerId);
      const region = regionByCode(o.regionCode);
      if (!provider || !region) return null;
      const tier = o.tierId ? provider.tiers.find((t) => t.id === o.tierId) : provider.tiers[0];
      const rate = rates[region.currency] ?? region.fallbackRate;
      const localPrice = o.localPrice ?? 0;
      return {
        providerId: provider.id,
        providerName: provider.name,
        providerColor: provider.color,
        tierId: tier?.id ?? "",
        tierName: tier?.name ?? "",
        regionCode: region.code,
        localPrice,
        usdEquivalent: round2(localPrice / (rate || 1)),
        currency: region.currency,
        symbol: region.symbol,
        billingCycle: (tier?.billingCycle ?? "monthly") as PublicOffer["billingCycle"],
        isFree: true,
        regionalHeadline: o.headline,
        regionalNote: o.note,
      } as PublicOffer;
    })
    .filter((x): x is PublicOffer => x !== null);
}

/** For one region, the cheapest paid (non-free) tier per provider. */
export function cheapestPaidByRegion(
  offers: PublicOffer[],
  regionCode: string,
): PublicOffer[] {
  const inRegion = offers.filter((o) => o.regionCode === regionCode && !o.isFree);
  const byProvider = new Map<string, PublicOffer>();
  for (const o of inRegion) {
    const cur = byProvider.get(o.providerId);
    if (!cur || o.usdEquivalent < cur.usdEquivalent) byProvider.set(o.providerId, o);
  }
  return [...byProvider.values()].sort((a, b) => a.usdEquivalent - b.usdEquivalent);
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

