import { useMemo, useRef, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { clearAllData, db, exportBackup, importBackup } from "../db";
import type { BackupData } from "../types";
import { summarizeEntries } from "../types";
import { formatWon, todayParts } from "../utils";

export default function SummaryPage() {
  const today = todayParts();
  const fileRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState("");
  const entries = useLiveQuery(() => db.ledgerEntries.toArray());
  const contracts = useLiveQuery(() => db.contracts.toArray());

  const monthEntries = useMemo(
    () =>
      (entries ?? []).filter(
        (e) => e.year === today.year && e.month === today.month,
      ),
    [entries, today.year, today.month],
  );

  const allSummary = summarizeEntries(entries ?? []);
  const monthSummary = summarizeEntries(monthEntries);
  const activeContracts = (contracts ?? []).filter((c) => c.isActive).length;

  const handleExport = async () => {
    const backup = await exportBackup();
    const blob = new Blob([JSON.stringify(backup, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `연습실백업_${today.year}${String(today.month).padStart(2, "0")}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    setMessage("백업 파일을 다운로드했습니다.");
  };

  const handleImport = async (file: File) => {
    const text = await file.text();
    const data = JSON.parse(text) as BackupData;
    await importBackup(data);
    setMessage("백업 데이터를 복원했습니다.");
  };

  const handleReset = async () => {
    if (!window.confirm("모든 계약·손익 데이터를 삭제합니다. 계속하시겠습니까?")) {
      return;
    }
    await clearAllData();
    setMessage("데이터가 초기화되었습니다. 페이지를 새로고침하세요.");
  };

  return (
    <div className="page">
      <header className="page-header">
        <h1>합계</h1>
        <p>실현·미실현 수익/지출과 순이익 총합계를 확인합니다.</p>
      </header>

      <div className="total-banner">
        <div>전체 예상 순이익</div>
        <div className="big">{formatWon(allSummary.totalNet)}</div>
        <div style={{ marginTop: 8, fontSize: "0.9rem", opacity: 0.9 }}>
          실현 순이익 {formatWon(allSummary.realizedNet)}
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginTop: 0 }}>전체 누적 합계</h3>
        <SummaryGrid summary={allSummary} />
      </div>

      <div className="card">
        <h3 style={{ marginTop: 0 }}>
          이번 달 ({today.year}.{String(today.month).padStart(2, "0")}) 합계
        </h3>
        <SummaryGrid summary={monthSummary} />
      </div>

      <div className="card">
        <h3 style={{ marginTop: 0 }}>운영 현황</h3>
        <div className="summary-grid">
          <div className="summary-item">
            <div className="label">활성 계약</div>
            <div className="value">{activeContracts}건</div>
          </div>
          <div className="summary-item">
            <div className="label">전체 내역</div>
            <div className="value">{(entries ?? []).length}건</div>
          </div>
          <div className="summary-item income">
            <div className="label">미수 월세(미실현 수익)</div>
            <div className="value">{formatWon(allSummary.incomeUnrealized)}</div>
          </div>
          <div className="summary-item expense">
            <div className="label">예정 지출(미실현)</div>
            <div className="value">{formatWon(allSummary.expenseUnrealized)}</div>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginTop: 0 }}>데이터 백업 · 복원</h3>
        <p style={{ margin: "0 0 12px", color: "var(--muted)", fontSize: "0.9rem" }}>
          안드로이드·PC 간 데이터 이동 시 JSON 백업 파일을 사용하세요.
        </p>
        <div className="btn-row">
          <button type="button" className="btn btn-primary" onClick={() => void handleExport()}>
            백업 다운로드
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => fileRef.current?.click()}
          >
            백업 복원
          </button>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          hidden
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void handleImport(file);
            e.target.value = "";
          }}
        />
        <div className="btn-row">
          <button type="button" className="btn btn-secondary" onClick={() => void handleReset()}>
            전체 데이터 초기화
          </button>
        </div>
        {message && <p style={{ color: "var(--primary)" }}>{message}</p>}
      </div>
    </div>
  );
}

function SummaryGrid({
  summary,
}: {
  summary: ReturnType<typeof summarizeEntries>;
}) {
  return (
    <div className="summary-grid">
      <div className="summary-item income">
        <div className="label">실현 수익</div>
        <div className="value">{formatWon(summary.incomeRealized)}</div>
      </div>
      <div className="summary-item muted">
        <div className="label">미실현 수익</div>
        <div className="value">{formatWon(summary.incomeUnrealized)}</div>
      </div>
      <div className="summary-item expense">
        <div className="label">실현 지출</div>
        <div className="value">{formatWon(summary.expenseRealized)}</div>
      </div>
      <div className="summary-item muted">
        <div className="label">미실현 지출</div>
        <div className="value">{formatWon(summary.expenseUnrealized)}</div>
      </div>
      <div className="summary-item income">
        <div className="label">수익 총합</div>
        <div className="value">{formatWon(summary.totalIncome)}</div>
      </div>
      <div className="summary-item expense">
        <div className="label">지출 총합</div>
        <div className="value">{formatWon(summary.totalExpense)}</div>
      </div>
      <div className="summary-item net">
        <div className="label">실현 순이익</div>
        <div className="value">{formatWon(summary.realizedNet)}</div>
      </div>
      <div className="summary-item net">
        <div className="label">예상 순이익</div>
        <div className="value">{formatWon(summary.totalNet)}</div>
      </div>
    </div>
  );
}
