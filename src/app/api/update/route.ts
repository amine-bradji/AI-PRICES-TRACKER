import { NextResponse } from "next/server";
import { refresh } from "@/lib/store";

export const dynamic = "force-dynamic";

/**
 * POST /api/update
 *
 * The single action that triggers a live FX fetch. Server-side cooldown
 * enforces the "don't overwork the servers" requirement regardless of how
 * aggressively the client is clicked.
 */
export async function POST() {
  const result = await refresh();
  return NextResponse.json(result);
}
