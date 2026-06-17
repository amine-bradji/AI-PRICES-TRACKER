import { NextResponse } from "next/server";
import { computeOffersCached, filterOffers, regionalFreeHighlights, cheapestPaidByRegion } from "@/lib/aggregate";
import { getRates, getLastUpdateAt, cooldownRemaining } from "@/lib/store";
import { PROVIDERS } from "@/data/catalog";

export const dynamic = "force-dynamic";

/** GET /api/offers?region=&provider=&freeOnly= */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const regionCode = searchParams.get("region") || undefined;
  const providerId = searchParams.get("provider") || undefined;
  const freeOnly = searchParams.get("freeOnly") === "1" || searchParams.get("freeOnly") === "true";

  const rates = getRates();
  const all = computeOffersCached(rates.rates);
  const filtered = filterOffers(all, { regionCode, providerId, freeOnly });

  return NextResponse.json({
    updatedAt: getLastUpdateAt(),
    cooldownRemaining: cooldownRemaining(),
    fxSource: rates.source,
    providers: PROVIDERS.map((p) => ({ id: p.id, name: p.name, color: p.color })),
    offers: filtered,
    freeHighlights: regionalFreeHighlights(rates.rates),
    cheapestPaid: regionCode ? cheapestPaidByRegion(all, regionCode) : [],
    stats: {
      providerCount: PROVIDERS.length,
      offerCount: filtered.length,
      freeCount: filtered.filter((o) => o.isFree).length,
    },
  });
}
