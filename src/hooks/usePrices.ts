"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ComputedOffer, Provider } from "@/lib/types";

export interface OffersResponse {
  updatedAt: number;
  cooldownRemaining: number;
  fxSource: "live" | "fallback";
  providers: Pick<Provider, "id" | "name" | "color">[];
  offers: ComputedOffer[];
  freeHighlights: ComputedOffer[];
  cheapestPaid: ComputedOffer[];
  stats: {
    providerCount: number;
    offerCount: number;
    freeCount: number;
  };
}

export interface UpdateResponse {
  ok: boolean;
  updatedAt: number;
  fxSource: "live" | "fallback";
  rateCount: number;
  cooldownRemaining: number;
  message?: string;
}

/**
 * Fetches the FULL (unfiltered) offer set ONCE on mount and again only when the
 * Update button refreshes FX. The dataset is tiny (~500 rows / tens of KB), so
 * region/provider/free/search/sort all happen instantly in the client (see
 * page.tsx) instead of paying a network round-trip per interaction.
 *
 * Also owns the client-side cooldown countdown so the Update button stays
 * disabled until the server allows another refresh.
 */
export function usePrices() {
  const [data, setData] = useState<OffersResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [lastMessage, setLastMessage] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  // Fetch the complete, unfiltered offer set. Filtering is done client-side.
  const fetchOffers = useCallback(async () => {
    const res = await fetch("/api/offers", { cache: "no-store" });
    if (!res.ok) throw new Error(`offers ${res.status}`);
    const json: OffersResponse = await res.json();
    setData(json);
    setCooldown(json.cooldownRemaining);
    return json;
  }, []);

  // Initial load — exactly one offers request.
  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      try {
        await fetchOffers();
      } catch {
        // swallow — UI shows empty/loading state
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [fetchOffers]);

  // Client-side cooldown countdown.
  useEffect(() => {
    if (cooldown <= 0) {
      if (timer.current) clearInterval(timer.current);
      return;
    }
    timer.current = setInterval(() => {
      setCooldown((c) => (c <= 1 ? 0 : c - 1));
    }, 1000);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [cooldown]);

  const update = useCallback(async () => {
    if (updating || cooldown > 0) return null;
    setUpdating(true);
    setLastMessage(null);
    try {
      const res = await fetch("/api/update", { method: "POST" });
      const result: UpdateResponse = await res.json();
      setCooldown(result.cooldownRemaining);
      if (result.message) setLastMessage(result.message);
      await fetchOffers();
      return result;
    } catch {
      setLastMessage("Update failed — please retry.");
      return null;
    } finally {
      setUpdating(false);
    }
  }, [updating, cooldown, fetchOffers]);

  return {
    data,
    loading,
    updating,
    cooldown,
    lastMessage,
    update,
    refresh: fetchOffers,
  };
}
