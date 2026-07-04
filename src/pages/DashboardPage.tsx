import { useMemo } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { countVacantRooms, db } from "../db";
import { ROOM_NAMES, summarizeEntries } from "../types";
import { formatWon, todayParts } from "../utils";

interface DashboardPageProps {
  onNavigate: (tab: "schedule" | "vacancy" | "members" | "ledger") => void;
}

export default function DashboardPage({ onNavigate }: DashboardPageProps) {
  const today = todayParts();
  const members = useLiveQuery(() => db.members.toArray());
  const contracts = useLiveQuery(() => db.contracts.toArray());
  const entries = useLiveQuery(() => db.ledgerEntries.toArray());

  const monthEntries = useMemo(
    () =>
      (entries ?? []).filter(
        (e) => e.year === today.year && e.month === today.month,
      ),
    [entries, today.month, today.year],
  );

  const monthSummary = summarizeEntries(monthEntries);
  const vacant = countVacantRooms(contracts ?? [], today.year, today.month);
  const occupied = ROOM_NAMES.length - vacant;
  const occupancyRate = Math.round((occupied / ROOM_NAMES.length) * 100);
  const activeContracts = (contracts ?? []).filter((c) => c.isActive).length;
  const unpaidRent = monthSummary.incomeUnrealized;
  const dueThisMonth = monthEntries.filter(
    (e) => e.type === "INCOME" && e.category === "월세" && !e.isRealized,
  ).length;

  return (
    <div className="page">
      <header className="page-header">
        <h1>대시보드</h1>
        <p>
          {today.year}년 {today.month}월 {today.day}일 운영 현황
        </p>
      </header>

      <div className="total-banner">
        <div>이번 달 예상 순이익</div>
        <div className="big">{formatWon(monthSummary.totalNet)}</div>
        <div className="banner-sub">
          실현 순이익 {formatWon(monthSummary.realizedNet)}
        </div>
      </div>

      <div className="card">
        <h3 className="card-title">핵심 지표</h3>
        <div className="summary-grid">
          <button type="button" className="summary-item kpi-btn" onClick={() => onNavigate("members")}>
            <div className="label">활성 계약</div>
            <div className="value">{activeContracts}건</div>
          </button>
          <button type="button" className="summary-item kpi-btn" onClick={() => onNavigate("vacancy")}>
            <div className="label">공실</div>
            <div className="value">{vacant} / {ROOM_NAMES.length}</div>
          </button>
          <div className="summary-item">
            <div className="label">입주율</div>
            <div className="value">{occupancyRate}%</div>
          </div>
          <button type="button" className="summary-item kpi-btn income" onClick={() => onNavigate("ledger")}>
            <div className="label">미수 월세</div>
            <div className="value">{formatWon(unpaidRent)}</div>
          </button>
        </div>
      </div>

      <div className="card">
        <h3 className="card-title">이번 달 손익 요약</h3>
        <div className="summary-grid">
          <div className="summary-item income">
            <div className="label">실현 수익</div>
            <div className="value">{formatWon(monthSummary.incomeRealized)}</div>
          </div>
          <div className="summary-item muted">
            <div className="label">미실현 수익</div>
            <div className="value">{formatWon(monthSummary.incomeUnrealized)}</div>
          </div>
          <div className="summary-item expense">
            <div className="label">실현 지출</div>
            <div className="value">{formatWon(monthSummary.expenseRealized)}</div>
          </div>
          <div className="summary-item muted">
            <div className="label">미실현 지출</div>
            <div className="value">{formatWon(monthSummary.expenseUnrealized)}</div>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="card-title">오늘 할 일</h3>
        <ul className="todo-list">
          <li>
            <button type="button" className="link-btn" onClick={() => onNavigate("schedule")}>
              이번 달 미수납 월세 {dueThisMonth}건 확인
            </button>
          </li>
          <li>
            <button type="button" className="link-btn" onClick={() => onNavigate("vacancy")}>
              공실 {vacant}개 방 현황 보기
            </button>
          </li>
          <li>
            <button type="button" className="link-btn" onClick={() => onNavigate("members")}>
              가입자 {(members ?? []).length}명 관리
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
}
