"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ComputedOffer, Provider, Region } from "@/lib/types";

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

export interface RegionsResponse {
  regions: Region[];
  updatedAt: number;
  cooldownRemaining: number;
}

export interface UpdateResponse {
  ok: boolean;
  updatedAt: number;
  fxSource: "live" | "fallback";
  rateCount: number;
  cooldownRemaining: number;
  message?: string;
}

interface UsePricesArgs {
  regionCode?: string;
  providerId?: string;
  freeOnly?: boolean;
}

/**
 * Fetches regions + filtered offers and exposes an `update()` action bound to
 * the Update button. Owns the client-side cooldown countdown so the button stays
 * disabled until the server allows another refresh.
 */
export function usePrices({ regionCode, providerId, freeOnly }: UsePricesArgs) {
  const [regions, setRegions] = useState<Region[]>([]);
  const [data, setData] = useState<OffersResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [lastMessage, setLastMessage] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchOffers = useCallback(async () => {
    const params = new URLSearchParams();
    if (regionCode) params.set("region", regionCode);
    if (providerId) params.set("provider", providerId);
    if (freeOnly) params.set("freeOnly", "1");
    const res = await fetch(`/api/offers?${params.toString()}`, { cache: "no-store" });
    if (!res.ok) throw new Error(`offers ${res.status}`);
    const json: OffersResponse = await res.json();
    setData(json);
    setCooldown(json.cooldownRemaining);
    return json;
  }, [regionCode, providerId, freeOnly]);

  const fetchRegions = useCallback(async () => {
    const res = await fetch("/api/regions", { cache: "no-store" });
    if (!res.ok) throw new Error(`regions ${res.status}`);
    const json: RegionsResponse = await res.json();
    setRegions(json.regions);
    setCooldown(json.cooldownRemaining);
  }, []);

  // Initial load.
  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      try {
        await Promise.all([fetchRegions(), fetchOffers()]);
      } catch {
        // swallow — UI shows empty/loading state
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [fetchRegions, fetchOffers]);

  // Refetch offers whenever filters change.
  useEffect(() => {
    fetchOffers().catch(() => {});
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
    regions,
    data,
    loading,
    updating,
    cooldown,
    lastMessage,
    update,
    refresh: fetchOffers,
  };
}
