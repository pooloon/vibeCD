import { useMemo } from "react";
import {
  buildInvestmentStrategy,
  estimateTerminalWealth,
} from "../services/strategyEngine";
import { gradeColor } from "../services/issueAnalysisService";
import type { InvestmentFormData, User } from "../types";
import type { NewsItem, QuoteSnapshot } from "../types/market";

interface StrategyReportProps {
  user: User;
  form: InvestmentFormData;
  quotes: Map<string, QuoteSnapshot>;
  news: Map<string, NewsItem[]>;
}

export default function StrategyReport({ user, form, quotes, news }: StrategyReportProps) {
  const strategy = useMemo(
    () => buildInvestmentStrategy(user, form, quotes, news),
    [user, form, quotes, news],
  );

  const monthly = Number(form.monthlyContribution.replace(/[^\d.]/g, "")) || 0;

  return (
    <section className="panel strategy-panel">
      <div className="panel-header">
        <h2>순차 투자 전략 · 기대수익 시나리오</h2>
      </div>
      <p className="strategy-summary">{strategy.summary}</p>

      <div className="allocation-row">
        {strategy.allocation.map((a) => (
          <div key={a.label} className="allocation-chip">
            <span className="allocation-label">{a.label}</span>
            <span className="allocation-value">{a.percent}%</span>
          </div>
        ))}
      </div>

      <h3 className="sub-heading">순차 매수 로드맵</h3>
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Phase</th>
              <th>기간</th>
              <th>종목</th>
              <th>상장코드</th>
              <th>비중</th>
              <th>계좌</th>
              <th>액션</th>
              <th>등급</th>
            </tr>
          </thead>
          <tbody>
            {strategy.legs.map((leg) => (
              <tr key={leg.order}>
                <td>{leg.order}</td>
                <td>{leg.phaseLabel}</td>
                <td>{leg.period}</td>
                <td>
                  <strong>{leg.instrument.name}</strong>
                  <span className="cell-sub">{leg.rationale}</span>
                </td>
                <td>
                  <code>{leg.instrument.localCode}</code>
                </td>
                <td>{leg.weightPercent}%</td>
                <td>{leg.account}</td>
                <td>{leg.action}</td>
                <td>
                  <span className={`grade-badge ${gradeColor(leg.issueGrade)}`}>
                    {leg.issueGrade}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3 className="sub-heading">기대수익률 시나리오 ({strategy.horizonYears}년·적립 가정)</h3>
      <div className="scenario-grid">
        {strategy.scenarios.map((s) => {
          const terminal = estimateTerminalWealth(monthly, strategy.horizonYears, s.annualReturnPercent);
          return (
            <div key={s.label} className={`scenario-card scenario-${s.label.toLowerCase()}`}>
              <span className="scenario-label">{s.label}</span>
              <span className="scenario-return">연 {s.annualReturnPercent}%</span>
              <span className="scenario-prob">{s.probabilityLabel}</span>
              {monthly > 0 && (
                <span className="scenario-terminal">
                  적립만 기준 약 {Math.round(terminal).toLocaleString()} (원/현지통화 단순)
                </span>
              )}
              <span className="scenario-note">{s.terminalNote}</span>
            </div>
          );
        })}
      </div>

      <ul className="disclaimer-list">
        {strategy.disclaimers.map((d) => (
          <li key={d}>{d}</li>
        ))}
      </ul>
    </section>
  );
}
