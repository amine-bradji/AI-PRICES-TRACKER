import { NextResponse } from "next/server";
import { REGIONS } from "@/data/regions";
import { getLastUpdateAt, cooldownRemaining } from "@/lib/store";

export const dynamic = "force-dynamic";

/** GET /api/regions — list of supported regions + current freshness info. */
export async function GET() {
  return NextResponse.json({
    regions: REGIONS,
    updatedAt: getLastUpdateAt(),
    cooldownRemaining: cooldownRemaining(),
  });
}
