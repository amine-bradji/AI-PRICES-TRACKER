import { REGIONS } from "@/data/regions";

/**
 * Foreign-exchange layer.
 *
 * Live rates come from a free, key-less API (open.er-api.com). The Update
 * button is the only thing that triggers a network call — and it is throttled
 * by the API route's cooldown, so we never hammer upstream servers.
 *
 * If the live call fails (offline, rate-limited, bad response), we fall back to
 * the bundled static rates in `regions.ts` and mark the source as "fallback".
 */

export interface FxRates {
  /** Map of currency code -> units per 1 USD. USD is always 1. */
  rates: Record<string, number>;
  /** Where the rates came from. */
  source: "live" | "fallback";
  /** Unix ms timestamp the rates were fetched/frozen. */
  fetchedAt: number;
  /** Number of distinct currency pairs. */
  count: number;
}

const DEFAULT_ENDPOINT = "https://open.er-api.com/v6/latest/USD";

/**
 * Build the fallback rate table from the bundled static rates.
 * These are intentionally conservative snapshots — not authoritative.
 */
export function fallbackRates(): FxRates {
  const rates: Record<string, number> = { USD: 1 };
  for (const r of REGIONS) {
    if (!(r.currency in rates)) rates[r.currency] = r.fallbackRate;
  }
  return { rates, source: "fallback", fetchedAt: Date.now(), count: Object.keys(rates).length };
}

/**
 * Fetch live USD-based rates. Throws on any non-OK/network failure so the
 * caller can decide whether to fall back. Never throws internally.
 */
export async function fetchLiveRates(): Promise<FxRates> {
  const endpoint = process.env.FX_API_BASE?.trim() || DEFAULT_ENDPOINT;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const res = await fetch(endpoint, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
      // Server-side fetch: never cache so the Update button always reflects the
      // most recent upstream response (still throttled by route cooldown).
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`FX HTTP ${res.status}`);
    const json = await res.json();
    const raw = json?.rates;
    if (!raw || typeof raw !== "object") throw new Error("FX: malformed payload");

    // Always include USD. Merge everything we got.
    const rates: Record<string, number> = { USD: 1, ...raw };
    return {
      rates,
      source: "live",
      fetchedAt: Date.now(),
      count: Object.keys(rates).length,
    };
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Get rates for the current process, fetching live if we don't have any yet.
 * Returns fallback on failure. Used on cold start.
 */
export async function getOrFetchRates(): Promise<FxRates> {
  try {
    return await fetchLiveRates();
  } catch {
    return fallbackRates();
  }
}
