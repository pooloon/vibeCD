import { useCallback, useEffect, useState } from "react";
import { getInstrumentsForCountry } from "../data/marketUniverse";
import { fetchQuotes } from "../services/marketDataService";
import type { CountryCode } from "../types";
import type { QuoteSnapshot } from "../types/market";

export function useMarketQuotes(countryCode: CountryCode | "") {
  const [quotes, setQuotes] = useState<Map<string, QuoteSnapshot>>(new Map());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!countryCode) return;
    setLoading(true);
    setError(null);
    try {
      const instruments = getInstrumentsForCountry(countryCode);
      const data = await fetchQuotes(instruments.map((i) => i.symbol));
      setQuotes(data);
      setUpdatedAt(new Date().toLocaleString("ko-KR"));
    } catch {
      setError("시세를 불러오지 못했습니다. 잠시 후 다시 시도하세요.");
    } finally {
      setLoading(false);
    }
  }, [countryCode]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { quotes, loading, error, updatedAt, refresh };
}
