import type { BacktestResult } from "../types/market";

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

function computeMetrics(closes: number[]): Omit<BacktestResult, "symbol" | "name"> | null {
  if (closes.length < 12) return null;

  const first = closes[0];
  const last = closes[closes.length - 1];
  const years = closes.length / 12;
  const totalReturn = ((last - first) / first) * 100;
  const cagr = (Math.pow(last / first, 1 / years) - 1) * 100;

  let peak = closes[0];
  let maxDrawdown = 0;
  const returns: number[] = [];

  for (let i = 1; i < closes.length; i += 1) {
    if (closes[i] > peak) peak = closes[i];
    const dd = ((closes[i] - peak) / peak) * 100;
    if (dd < maxDrawdown) maxDrawdown = dd;
    returns.push((closes[i] - closes[i - 1]) / closes[i - 1]);
  }

  const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
  const variance =
    returns.reduce((a, b) => a + (b - mean) ** 2, 0) / Math.max(returns.length - 1, 1);
  const volatility = Math.sqrt(variance) * Math.sqrt(12) * 100;

  return {
    periodYears: Math.round(years * 10) / 10,
    cagrPercent: Math.round(cagr * 10) / 10,
    totalReturnPercent: Math.round(totalReturn * 10) / 10,
    maxDrawdownPercent: Math.round(maxDrawdown * 10) / 10,
    volatilityPercent: Math.round(volatility * 10) / 10,
    dataPoints: closes.length,
  };
}

export async function backtestSymbol(
  symbol: string,
  name: string,
  rangeYears = 5,
): Promise<BacktestResult | null> {
  const range = rangeYears >= 10 ? "10y" : rangeYears >= 5 ? "5y" : "3y";
  try {
    const res = await fetch(
      `/api/yahoo/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1mo&range=${range}`,
    );
    if (!res.ok) return null;
    const json = (await res.json()) as ChartResponse;
    const closesRaw = json.chart?.result?.[0]?.indicators?.quote?.[0]?.close ?? [];
    const closes = closesRaw.filter((c): c is number => c !== null && c > 0);
    const metrics = computeMetrics(closes);
    if (!metrics) return null;
    return { symbol, name, ...metrics };
  } catch {
    return null;
  }
}

export async function backtestPortfolio(
  symbols: { symbol: string; name: string }[],
  rangeYears = 5,
): Promise<BacktestResult[]> {
  const results = await Promise.all(
    symbols.map(({ symbol, name }) => backtestSymbol(symbol, name, rangeYears)),
  );
  return results.filter((r): r is BacktestResult => r !== null);
}
