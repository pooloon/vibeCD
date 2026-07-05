import type { QuoteSnapshot } from "../../types/market";

interface MarketTickerProps {
  quotes: Map<string, QuoteSnapshot>;
}

const TICKER_SYMBOLS = [
  { key: "^KS11", label: "KOSPI" },
  { key: "^GSPC", label: "S&P 500" },
  { key: "^N225", label: "NIKKEI 225" },
  { key: "KRW=X", label: "USD/KRW" },
];

function formatChange(q: QuoteSnapshot | undefined): { text: string; dir: "up" | "down" | "flat" } {
  if (!q || q.price == null) return { text: "—", dir: "flat" };
  const pct = q.changePercent ?? 0;
  const sign = pct >= 0 ? "+" : "";
  return {
    text: `${q.price.toLocaleString(undefined, { maximumFractionDigits: 2 })} (${sign}${pct.toFixed(2)}%)`,
    dir: pct > 0.05 ? "up" : pct < -0.05 ? "down" : "flat",
  };
}

export default function MarketTicker({ quotes }: MarketTickerProps) {
  return (
    <div className="market-ticker" aria-label="시장 지수">
      {TICKER_SYMBOLS.map(({ key, label }) => {
        const q = quotes.get(key);
        const { text, dir } = formatChange(q);
        return (
          <div key={key} className="ticker-item">
            <span className="ticker-label">{label}</span>
            <span className={`ticker-value ${dir}`}>{text}</span>
          </div>
        );
      })}
    </div>
  );
}
