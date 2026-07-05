import type { PriceHistory, PriceHistoryPoint } from "../types/krxDart";

interface ChartResponse {
  chart?: {
    result?: Array<{
      timestamp?: number[];
      indicators?: {
        quote?: Array<{ close?: (number | null)[] }>;
      };
    }>;
  };
}

export async function fetchPriceHistory(
  symbol: string,
  range: "6mo" | "1y" | "5y" = "1y",
): Promise<PriceHistory> {
  const interval = range === "6mo" ? "1d" : range === "1y" ? "1wk" : "1mo";
  try {
    const res = await fetch(
      `/api/yahoo/v8/finance/chart/${encodeURIComponent(symbol)}?interval=${interval}&range=${range}`,
    );
    if (!res.ok) return { symbol, range, points: [] };
    const json = (await res.json()) as ChartResponse;
    const result = json.chart?.result?.[0];
    const timestamps = result?.timestamp ?? [];
    const closes = result?.indicators?.quote?.[0]?.close ?? [];

    const points: PriceHistoryPoint[] = [];
    for (let i = 0; i < timestamps.length; i += 1) {
      const close = closes[i];
      if (close == null || close <= 0) continue;
      points.push({
        date: new Date(timestamps[i] * 1000).toISOString().slice(0, 10),
        close,
      });
    }
    return { symbol, range, points };
  } catch {
    return { symbol, range, points: [] };
  }
}

export function calcHistoryStats(points: PriceHistoryPoint[]): {
  changePercent: number | null;
  high: number | null;
  low: number | null;
} {
  if (points.length < 2) return { changePercent: null, high: null, low: null };
  const first = points[0].close;
  const last = points[points.length - 1].close;
  const closes = points.map((p) => p.close);
  return {
    changePercent: Math.round(((last - first) / first) * 1000) / 10,
    high: Math.max(...closes),
    low: Math.min(...closes),
  };
}
