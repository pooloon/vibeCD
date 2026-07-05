import type { NewsItem } from "../types/market";

interface YahooNewsRow {
  title?: string;
  publisher?: string;
  link?: string;
  providerPublishTime?: number;
}

interface YahooSearchResponse {
  news?: YahooNewsRow[];
}

const NEGATIVE_KEYWORDS = [
  "fall", "drop", "decline", "loss", "cut", "warn", "risk", "probe", "fine",
  "하락", "감소", "적자", "리콜", "규제", "調査", "下落",
];
const POSITIVE_KEYWORDS = [
  "surge", "rise", "gain", "beat", "record", "growth", "upgrade",
  "상승", "증가", "흑자", "신고가", "上昇", "好調",
];

export function scoreNewsSentiment(titles: string[]): "positive" | "neutral" | "negative" {
  if (titles.length === 0) return "neutral";
  let score = 0;
  for (const title of titles) {
    const lower = title.toLowerCase();
    for (const w of NEGATIVE_KEYWORDS) {
      if (lower.includes(w.toLowerCase())) score -= 1;
    }
    for (const w of POSITIVE_KEYWORDS) {
      if (lower.includes(w.toLowerCase())) score += 1;
    }
  }
  if (score >= 2) return "positive";
  if (score <= -2) return "negative";
  return "neutral";
}

export async function fetchNewsForSymbol(symbol: string, count = 3): Promise<NewsItem[]> {
  const query = encodeURIComponent(symbol);
  try {
    const res = await fetch(`/api/yahoo/v1/finance/search?q=${query}&newsCount=${count}`);
    if (!res.ok) return [];
    const json = (await res.json()) as YahooSearchResponse;
    return (json.news ?? []).slice(0, count).map((n) => ({
      symbol,
      title: n.title ?? "",
      publisher: n.publisher ?? "Unknown",
      link: n.link ?? "",
      publishedAt: n.providerPublishTime
        ? new Date(n.providerPublishTime * 1000).toISOString().slice(0, 10)
        : "",
    }));
  } catch {
    return [];
  }
}

export async function fetchNewsBatch(
  symbols: string[],
  perSymbol = 2,
): Promise<Map<string, NewsItem[]>> {
  const map = new Map<string, NewsItem[]>();
  const batchSize = 5;
  for (let i = 0; i < symbols.length; i += batchSize) {
    const chunk = symbols.slice(i, i + batchSize);
    const results = await Promise.all(chunk.map((s) => fetchNewsForSymbol(s, perSymbol)));
    chunk.forEach((sym, idx) => map.set(sym, results[idx]));
  }
  return map;
}
