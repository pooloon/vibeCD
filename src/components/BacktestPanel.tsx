import { useCallback, useEffect, useMemo, useState } from "react";
import { getInstrumentsForCountry } from "../data/marketUniverse";
import { backtestPortfolio } from "../services/backtestService";
import { buildInvestmentStrategy } from "../services/strategyEngine";
import type { InvestmentFormData, User } from "../types";
import type { BacktestResult, QuoteSnapshot } from "../types/market";

interface BacktestPanelProps {
  user: User;
  form: InvestmentFormData;
  quotes: Map<string, QuoteSnapshot>;
}

export default function BacktestPanel({ user, form, quotes }: BacktestPanelProps) {
  const [results, setResults] = useState<BacktestResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [years, setYears] = useState(5);

  const strategy = useMemo(
    () => buildInvestmentStrategy(user, form, quotes),
    [user, form, quotes],
  );

  const targets = useMemo(
    () =>
      strategy.legs.map((leg) => ({
        symbol: leg.instrument.symbol,
        name: leg.instrument.name,
      })),
    [strategy.legs],
  );

  const runBacktest = useCallback(async () => {
    setLoading(true);
    try {
      const data = await backtestPortfolio(targets, years);
      setResults(data);
    } finally {
      setLoading(false);
    }
  }, [targets, years]);

  useEffect(() => {
    void runBacktest();
  }, [runBacktest]);

  const benchmark = useMemo(() => {
    const inst = getInstrumentsForCountry(user.countryCode).find(
      (i) => i.assetClass === "etf" && i.themes.includes("코어"),
    );
    return inst ?? getInstrumentsForCountry(user.countryCode)[0];
  }, [user.countryCode]);

  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <h2>백테스트 · 과거 수익률 검증</h2>
          <p className="panel-desc">
            순차 전략 편입 종목의 월간 히스토리 기준 CAGR·MDD·변동성 (Yahoo Chart API)
          </p>
        </div>
        <div className="inline-controls">
          <select value={years} onChange={(e) => setYears(Number(e.target.value))}>
            <option value={3}>3년</option>
            <option value={5}>5년</option>
            <option value={10}>10년</option>
          </select>
          <button type="button" className="btn btn-sm" onClick={runBacktest} disabled={loading}>
            {loading ? "계산 중…" : "재실행"}
          </button>
        </div>
      </div>

      {benchmark ? (
        <p className="meta-line">
          벤치마크 참고: {benchmark.name} ({benchmark.localCode})
        </p>
      ) : null}

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>종목</th>
              <th>코드</th>
              <th>기간</th>
              <th>CAGR</th>
              <th>총수익</th>
              <th>최대낙폭(MDD)</th>
              <th>연변동성</th>
            </tr>
          </thead>
          <tbody>
            {results.length === 0 && !loading ? (
              <tr>
                <td colSpan={7}>백테스트 데이터 없음</td>
              </tr>
            ) : (
              results.map((r) => (
                <tr key={r.symbol}>
                  <td>{r.name}</td>
                  <td>
                    <code>{r.symbol}</code>
                  </td>
                  <td>{r.periodYears}년</td>
                  <td className={r.cagrPercent >= 0 ? "up" : "down"}>{r.cagrPercent}%</td>
                  <td>{r.totalReturnPercent}%</td>
                  <td className="down">{r.maxDrawdownPercent}%</td>
                  <td>{r.volatilityPercent}%</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <ul className="disclaimer-list">
        <li>과거 수익률은 미래를 보장하지 않습니다.</li>
        <li>월간 종가 기준 단순 계산이며 배당·세금·수수료 미반영.</li>
        <li>Base case 시나리오와 교차 검증용 참고 자료입니다.</li>
      </ul>
    </section>
  );
}
