import type { DartCompanySummary, DartDisclosure } from "../types/krxDart";

interface DisclosurePanelProps {
  stockCode: string | null;
  stockName: string;
  company: DartCompanySummary | null;
  disclosures: DartDisclosure[];
  loading: boolean;
  error: string | null;
  onClose: () => void;
}

export default function DisclosurePanel({
  stockCode,
  stockName,
  company,
  disclosures,
  loading,
  error,
  onClose,
}: DisclosurePanelProps) {
  if (!stockCode) return null;

  return (
    <aside className="disclosure-panel">
      <div className="disclosure-header">
        <div>
          <h3>
            {stockName} <code>{stockCode}</code>
          </h3>
          <p className="panel-desc">Open DART 전자공시</p>
        </div>
        <button type="button" className="btn btn-sm" onClick={onClose}>
          닫기
        </button>
      </div>

      {loading ? <p className="meta-line">공시 불러오는 중…</p> : null}
      {error ? <p className="form-error">{error}</p> : null}

      {company ? (
        <div className="company-summary">
          <p>
            <strong>{company.corpName}</strong> · 대표 {company.ceoName || "—"}
          </p>
          <p className="cell-sub">
            업종코드 {company.industry || "—"} · 설립/상장 {company.listingDate || "—"}
          </p>
          {company.homepage ? (
            <a href={company.homepage} target="_blank" rel="noreferrer">
              {company.homepage}
            </a>
          ) : null}
        </div>
      ) : null}

      <ul className="disclosure-list">
        {disclosures.length === 0 && !loading ? (
          <li className="meta-line">최근 공시 없음</li>
        ) : (
          disclosures.map((d) => (
            <li key={d.receiptNo}>
              <span className="disclosure-date">{d.receiptDate}</span>
              <a href={d.reportUrl} target="_blank" rel="noreferrer">
                {d.reportName}
              </a>
              <span className="cell-sub">{d.submitter}</span>
            </li>
          ))
        )}
      </ul>
    </aside>
  );
}
