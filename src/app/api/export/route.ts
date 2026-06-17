import { NextResponse } from "next/server";
import { computeOffers } from "@/lib/aggregate";
import { getRates } from "@/lib/store";

export const dynamic = "force-dynamic";

/**
 * GET /api/export?region=&provider=&freeOnly=
 *
 * Returns all computed offers as a CSV download. Reuses the same computation and
 * filters as /api/offers but formats the output as text/csv.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const regionCode = searchParams.get("region") || undefined;
  const providerId = searchParams.get("provider") || undefined;
  const freeOnly = searchParams.get("freeOnly") === "1" || searchParams.get("freeOnly") === "true";

  const rates = getRates();
  const all = computeOffers(rates.rates);
  const filtered = all.filter((o) => {
    if (regionCode && o.regionCode !== regionCode) return false;
    if (providerId && o.providerId !== providerId) return false;
    if (freeOnly && !o.isFree) return false;
    return true;
  });

  const header = "Provider,Tier,Region,Currency,Local Price,USD Equivalent,Billing,Free,Annual Local,Annual USD,Regional Offer";
  const rows = filtered.map((o) =>
    [
      o.providerName,
      o.tierName,
      o.regionCode,
      o.currency,
      o.localPrice,
      o.usdEquivalent,
      o.billingCycle,
      o.isFree ? "Yes" : "No",
      o.annualLocalPrice ?? "",
      o.annualUsdEquivalent ?? "",
      o.regionalHeadline ?? "",
    ].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","),
  );

  const csv = [header, ...rows].join("\r\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="ai-prices-${regionCode || "all"}-${Date.now()}.csv"`,
    },
  });
}
