import { useCallback, useEffect, useState } from "react";
import { getInstrumentsForCountry } from "../data/marketUniverse";
import { fetchNewsBatch } from "../services/newsService";
import type { CountryCode } from "../types";
import type { NewsItem } from "../types/market";

export function useMarketNews(countryCode: CountryCode | "") {
  const [news, setNews] = useState<Map<string, NewsItem[]>>(new Map());
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!countryCode) return;
    setLoading(true);
    try {
      const instruments = getInstrumentsForCountry(countryCode);
      const data = await fetchNewsBatch(
        instruments.map((i) => i.symbol),
        2,
      );
      setNews(data);
    } finally {
      setLoading(false);
    }
  }, [countryCode]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { news, loading, refresh };
}
