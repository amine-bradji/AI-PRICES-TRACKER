import { fallbackRates, fetchLiveRates } from "@/lib/fx";
import type { FxRates } from "@/lib/fx";
import type { UpdateResult } from "@/lib/types";

/**
 * In-memory rate store (module-level singleton, per server process).
 *
 * There is intentionally NO database. The Update button is the single action
 * that refreshes this cache by calling the live FX API, and it is protected by
 * a server-side cooldown so upstream servers are never overloaded.
 *
 * On cold start we seed from bundled fallback rates so the app renders instantly
 * without a network call; the first Update click pulls live data.
 */

let current: FxRates = fallbackRates();
let lastUpdateAt = 0; // unix ms of the last successful Update

const COOLDOWN_MS = (() => {
  const configured = Number(process.env.UPDATE_COOLDOWN_SECONDS);
  return Number.isFinite(configured) && configured > 0 ? configured * 1000 : 60_000;
})();

export function getRates(): FxRates {
  return current;
}

export function getLastUpdateAt(): number {
  return lastUpdateAt;
}

/** Seconds remaining before another Update is allowed. */
export function cooldownRemaining(now = Date.now()): number {
  if (lastUpdateAt === 0) return 0;
  const remaining = Math.ceil((lastUpdateAt + COOLDOWN_MS - now) / 1000);
  return remaining > 0 ? remaining : 0;
}

/**
 * Perform an Update. Respects the cooldown: if called too soon after the last
 * update, returns the current state without hitting the network.
 */
export async function refresh(now = Date.now()): Promise<UpdateResult> {
  const remaining = cooldownRemaining(now);
  if (remaining > 0) {
    return {
      ok: true,
      updatedAt: lastUpdateAt,
      fxSource: current.source,
      rateCount: current.count,
      cooldownRemaining: remaining,
      message: `Cooldown active — try again in ${remaining}s.`,
    };
  }

  let next: FxRates;
  try {
    next = await fetchLiveRates();
  } catch (err) {
    // Network/parse failure: keep showing stale rates, don't crash.
    next = fallbackRates();
    lastUpdateAt = now;
    current = next;
    return {
      ok: true,
      updatedAt: now,
      fxSource: "fallback",
      rateCount: next.count,
      cooldownRemaining: cooldownRemaining(now),
      message: "Live FX unavailable — using bundled rates.",
    };
  }

  lastUpdateAt = now;
  current = next;
  return {
    ok: true,
    updatedAt: now,
    fxSource: next.source,
    rateCount: next.count,
    cooldownRemaining: cooldownRemaining(now),
  };
}
