import { useMemo, useRef, useState } from "react";
import { generateFullReport } from "../services/reportService";
import { backtestPortfolio } from "../services/backtestService";
import { exportTextReportToPdf } from "../services/pdfExportService";
import { buildInvestmentStrategy } from "../services/strategyEngine";
import type { InvestmentFormData, User } from "../types";
import type { BacktestResult, NewsItem, QuoteSnapshot } from "../types/market";

interface FullReportPanelProps {
  user: User;
  form: InvestmentFormData;
  quotes: Map<string, QuoteSnapshot>;
  news: Map<string, NewsItem[]>;
}

export default function FullReportPanel({ user, form, quotes, news }: FullReportPanelProps) {
  const reportRef = useRef<HTMLDivElement>(null);
  const [backtests, setBacktests] = useState<BacktestResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const strategy = useMemo(
    () => buildInvestmentStrategy(user, form, quotes, news),
    [user, form, quotes, news],
  );

  const report = useMemo(
    () => generateFullReport(user, form, quotes, news, backtests),
    [user, form, quotes, news, backtests],
  );

  const loadBacktests = async () => {
    setLoading(true);
    try {
      const targets = strategy.legs.map((leg) => ({
        symbol: leg.instrument.symbol,
        name: leg.instrument.name,
      }));
      const data = await backtestPortfolio(targets, 5);
      setBacktests(data);
    } finally {
      setLoading(false);
    }
  };

  const copyReport = async () => {
    await navigator.clipboard.writeText(report);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  const downloadPdf = async () => {
    if (!reportRef.current) return;
    setPdfLoading(true);
    try {
      const date = new Date().toISOString().slice(0, 10);
      await exportTextReportToPdf(
        reportRef.current,
        `investment-report-${user.name}-${date}.pdf`,
      );
    } finally {
      setPdfLoading(false);
    }
  };

  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <h2>통합 리포트 (Step 0~9)</h2>
          <p className="panel-desc">
            프로필 · 시세 · 이슈 · 순차전략 · 백테스트 · 시나리오 · 면책 · PDF 내보내기
          </p>
        </div>
        <div className="inline-controls">
          <button type="button" className="btn btn-sm" onClick={loadBacktests} disabled={loading}>
            {loading ? "백테스트 로드…" : "백테스트 반영"}
          </button>
          <button type="button" className="btn btn-sm" onClick={copyReport}>
            {copied ? "복사됨 ✓" : "복사"}
          </button>
          <button type="button" className="btn primary btn-sm" onClick={downloadPdf} disabled={pdfLoading}>
            {pdfLoading ? "PDF 생성…" : "PDF 저장"}
          </button>
        </div>
      </div>
      <div ref={reportRef} className="report-print-area">
        <pre className="report-body">{report}</pre>
      </div>
    </section>
  );
}
