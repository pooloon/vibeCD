import { useCallback, useEffect, useState } from "react";
import { MARKET_UNIVERSE } from "../data/marketUniverse";
import {
  fetchKrxAllListed,
  loadKrxFromCache,
  mergeKrxWithStaticEtfs,
  saveKrxToCache,
} from "../services/krxService";
import type { KrxLoadResult } from "../types/krxDart";
import type { MarketInstrument } from "../types/market";

export function useKrxUniverse(enabled: boolean) {
  const [instruments, setInstruments] = useState<MarketInstrument[]>(() => {
    if (!enabled) return [];
    const cached = loadKrxFromCache();
    if (cached) {
      return mergeKrxWithStaticEtfs(cached.stocks, MARKET_UNIVERSE);
    }
    return [];
  });
  const [meta, setMeta] = useState<KrxLoadResult | null>(() =>
    enabled ? loadKrxFromCache() : null,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (force = false) => {
    if (!enabled) return;
    if (!force && meta && instruments.length > 0) return;

    setLoading(true);
    setError(null);
    try {
      const result = await fetchKrxAllListed();
      saveKrxToCache(result);
      const merged = mergeKrxWithStaticEtfs(result.stocks, MARKET_UNIVERSE);
      setInstruments(merged);
      setMeta(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "KRX 로드 실패");
    } finally {
      setLoading(false);
    }
  }, [enabled, meta, instruments.length]);

  useEffect(() => {
    if (enabled && instruments.length === 0) {
      void load(false);
    }
  }, [enabled, instruments.length, load]);

  return { instruments, meta, loading, error, reload: () => load(true) };
}
