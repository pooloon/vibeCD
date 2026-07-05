import { useMemo, useRef, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import OpenAISettingsSection from "../components/OpenAISettingsSection";
import { clearAllData, db, exportBackup, importBackup } from "../db";
import { ROOM_NAMES, isContractActiveInMonth, type BackupData } from "../types";
import { summarizeEntries } from "../types";
import { formatWonSymbol, todayParts } from "../utils";

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

  const occupiedRooms = useMemo(() => {
    const set = new Set<string>();
    for (const c of contracts ?? []) {
      if (c.isActive && isContractActiveInMonth(c, today.year, today.month)) {
        set.add(c.roomName);
      }
    }
    return set.size;
  }, [contracts, today.year, today.month]);

  const occupancyRate = Math.round((occupiedRooms / ROOM_NAMES.length) * 100);

  const expiringSoon = useMemo(() => {
    const now = new Date();
    const limit = new Date(now);
    limit.setDate(limit.getDate() + 30);
    return (contracts ?? []).filter((c) => {
      if (!c.isActive || c.endYear === null || c.endMonth === null) return false;
      const end = new Date(c.endYear, c.endMonth, 0);
      return end >= now && end <= limit;
    }).length;
  }, [contracts]);

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
      <div>
        <p className="section-label">손익 요약</p>
        <div className="kpi-grid">
          <div className="kpi-card kpi-hero">
            <div className="kpi-label">이번 달 순이익</div>
            <div className="kpi-number">{formatWonSymbol(monthSummary.totalNet)}</div>
            <div className="tx-meta" style={{ color: "var(--income)", marginTop: 4 }}>
              실현 {formatWonSymbol(monthSummary.realizedNet)}
            </div>
          </div>
          <div className="kpi-card primary">
            <div className="kpi-label">누적 총 수입</div>
            <div className="kpi-number" style={{ fontSize: "1.125rem" }}>
              {formatWonSymbol(allSummary.totalIncome)}
            </div>
          </div>
          <div className="kpi-card expense">
            <div className="kpi-label">누적 총 지출</div>
            <div className="kpi-number" style={{ fontSize: "1.125rem" }}>
              {formatWonSymbol(allSummary.totalExpense)}
            </div>
          </div>
        </div>
      </div>

      <div>
        <p className="section-label">운영 통계</p>
        <div className="bento-grid">
          <div className="bento-active">
            <div>
              <div style={{ fontSize: "0.875rem", opacity: 0.9 }}>📄</div>
              <div style={{ marginTop: 12, fontSize: "0.875rem" }}>활성 계약</div>
            </div>
            <div style={{ fontSize: "1.5rem", fontWeight: 700 }}>{activeContracts}건</div>
          </div>
          <div className="bento-rate">
            <div className="tx-meta">가동률</div>
            <div>
              <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--income)" }}>
                {occupancyRate}%
              </div>
              <div className="tx-meta">{ROOM_NAMES.length}개 중 {occupiedRooms}개</div>
            </div>
          </div>
          <div className="bento-alert">
            <div className="bento-alert-left">
              <div className="alert-icon">⏱</div>
              <div>
                <div style={{ fontWeight: 500 }}>만기 예정 계약</div>
                <div className="tx-meta">향후 30일 이내 {expiringSoon}건</div>
              </div>
            </div>
            <span className="tx-meta">›</span>
          </div>
        </div>
      </div>

      <OpenAISettingsSection />

      <div>
        <p className="section-label">데이터 관리</p>
        <div className="settings-list">
          <button type="button" className="settings-item" onClick={() => void handleExport()}>
            <div className="settings-icon">⬇</div>
            <div>
              <div className="settings-item-title">JSON 백업 다운로드</div>
              <div className="settings-item-desc">전체 데이터를 JSON 파일로 보냅니다.</div>
            </div>
          </button>
          <button
            type="button"
            className="settings-item"
            onClick={() => fileRef.current?.click()}
          >
            <div className="settings-icon">⬆</div>
            <div>
              <div className="settings-item-title">백업 복원</div>
              <div className="settings-item-desc">JSON 파일을 통해 데이터를 복구합니다.</div>
            </div>
          </button>
          <button type="button" className="settings-item" onClick={() => void handleReset()}>
            <div className="settings-icon danger">⚠</div>
            <div>
              <div className="settings-item-title danger">데이터 전체 초기화</div>
              <div className="settings-item-desc">모든 내역을 영구적으로 삭제합니다.</div>
            </div>
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
        {message && <p className="message">{message}</p>}
      </div>

      <footer className="app-footer">Room Manager v1.0.0 · 연습실 통합 운영</footer>
    </div>
  );
}
