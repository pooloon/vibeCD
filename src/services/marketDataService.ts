import type { QuoteSnapshot } from "../types/market";

interface YahooQuoteRow {
  symbol?: string;
  regularMarketPrice?: number;
  regularMarketChangePercent?: number;
  currency?: string;
  trailingPE?: number;
  dividendYield?: number;
  fiftyTwoWeekHigh?: number;
  fiftyTwoWeekLow?: number;
  marketCap?: number;
}

const CHUNK_SIZE = 15;

export async function fetchQuotes(symbols: string[]): Promise<Map<string, QuoteSnapshot>> {
  const unique = [...new Set(symbols)];
  const results = new Map<string, QuoteSnapshot>();
  const fetchedAt = new Date().toISOString();

  for (let i = 0; i < unique.length; i += CHUNK_SIZE) {
    const chunk = unique.slice(i, i + CHUNK_SIZE);
    const query = encodeURIComponent(chunk.join(","));
    try {
      const res = await fetch(`/api/yahoo/v7/finance/quote?symbols=${query}`);
      if (!res.ok) continue;
      const json = (await res.json()) as { quoteResponse?: { result?: YahooQuoteRow[] } };
      for (const row of json.quoteResponse?.result ?? []) {
        if (!row.symbol) continue;
        results.set(row.symbol, {
          symbol: row.symbol,
          price: row.regularMarketPrice ?? null,
          changePercent: row.regularMarketChangePercent ?? null,
          currency: row.currency ?? "",
          peRatio: row.trailingPE ?? null,
          dividendYield: row.dividendYield ?? null,
          fiftyTwoWeekHigh: row.fiftyTwoWeekHigh ?? null,
          fiftyTwoWeekLow: row.fiftyTwoWeekLow ?? null,
          marketCap: row.marketCap ?? null,
          fetchedAt,
        });
      }
    } catch {
      // network / CORS fallback handled by empty map entries
    }
  }

  for (const sym of unique) {
    if (!results.has(sym)) {
      results.set(sym, {
        symbol: sym,
        price: null,
        changePercent: null,
        currency: "",
        peRatio: null,
        dividendYield: null,
        fiftyTwoWeekHigh: null,
        fiftyTwoWeekLow: null,
        marketCap: null,
        fetchedAt,
      });
    }
  }

  return results;
}

export function formatPrice(price: number | null, currency: string): string {
  if (price === null) return "—";
  if (currency === "KRW") return `${Math.round(price).toLocaleString()}원`;
  if (currency === "JPY") return `¥${Math.round(price).toLocaleString()}`;
  if (currency === "GBp") return `${(price / 100).toFixed(2)} GBP`;
  return `${price.toFixed(2)} ${currency || "USD"}`;
}

export function formatMarketCap(cap: number | null): string {
  if (cap === null) return "—";
  if (cap >= 1e12) return `${(cap / 1e12).toFixed(2)}T`;
  if (cap >= 1e9) return `${(cap / 1e9).toFixed(2)}B`;
  if (cap >= 1e6) return `${(cap / 1e6).toFixed(2)}M`;
  return String(cap);
}
