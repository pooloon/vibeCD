import {
  addDays,
  endOfMonth,
  endOfWeek,
  format,
  getDay,
  isSameDay,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { ko } from "date-fns/locale";
import { useMemo, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db, toggleEntryRealized } from "../db";
import type { DaySummary, LedgerEntry } from "../types";
import { emptyDaySummary, summarizeEntries } from "../types";
import { formatCompactWon, formatWonSymbol, todayParts } from "../utils";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

interface CalendarPageProps {
  year: number;
  month: number;
  onMonthChange: (year: number, month: number) => void;
}

function buildDayMap(entries: LedgerEntry[]): Map<number, DaySummary> {
  const map = new Map<number, DaySummary>();
  for (const entry of entries) {
    const current = map.get(entry.day) ?? emptyDaySummary();
    if (entry.type === "INCOME") {
      if (entry.isRealized) current.incomeRealized += entry.amount;
      else current.incomeUnrealized += entry.amount;
    } else if (entry.isRealized) {
      current.expenseRealized += entry.amount;
    } else {
      current.expenseUnrealized += entry.amount;
    }
    map.set(entry.day, current);
  }
  return map;
}

export default function CalendarPage({
  year,
  month,
  onMonthChange,
}: CalendarPageProps) {
  const today = todayParts();
  const [selectedDay, setSelectedDay] = useState<number | null>(today.day);

  const monthEntries = useLiveQuery(
    () => db.ledgerEntries.where({ year, month }).toArray(),
    [year, month],
  );

  const dayEntries = useLiveQuery(
    async () => {
      if (!selectedDay) return [] as LedgerEntry[];
      return db.ledgerEntries.where({ year, month, day: selectedDay }).toArray();
    },
    [year, month, selectedDay],
  );

  const dayMap = useMemo(
    () => buildDayMap(monthEntries ?? []),
    [monthEntries],
  );
  const monthSummary = summarizeEntries(monthEntries ?? []);

  const monthDate = new Date(year, month - 1, 1);
  const gridStart = startOfWeek(startOfMonth(monthDate), { weekStartsOn: 0 });
  const gridEnd = endOfWeek(endOfMonth(monthDate), { weekStartsOn: 0 });
  const days: Date[] = [];
  for (let cursor = gridStart; cursor <= gridEnd; cursor = addDays(cursor, 1)) {
    days.push(cursor);
  }

  const shiftMonth = (delta: number) => {
    const next = new Date(year, month - 1 + delta, 1);
    onMonthChange(next.getFullYear(), next.getMonth() + 1);
    setSelectedDay(null);
  };

  const selectedSummary = selectedDay
    ? summarizeEntries(dayEntries ?? [])
    : monthSummary;

  return (
    <div className="page">
      <div>
        <p className="section-label">월간 손익</p>
        <div className="kpi-grid">
          <div className="kpi-card kpi-hero">
            <div className="kpi-label">이번 달 순이익</div>
            <div className="kpi-number">{formatWonSymbol(monthSummary.totalNet)}</div>
            <div className="tx-meta" style={{ color: "var(--income)", marginTop: 4 }}>
              실현 {formatWonSymbol(monthSummary.realizedNet)}
            </div>
          </div>
          <div className="kpi-card income">
            <div className="kpi-label">실현 수익</div>
            <div className="kpi-number" style={{ fontSize: "1.125rem" }}>
              {formatWonSymbol(monthSummary.incomeRealized)}
            </div>
          </div>
          <div className="kpi-card muted">
            <div className="kpi-label">미실현 수익</div>
            <div className="kpi-number" style={{ fontSize: "1.125rem" }}>
              {formatWonSymbol(monthSummary.incomeUnrealized)}
            </div>
          </div>
          <div className="kpi-card expense">
            <div className="kpi-label">실현 지출</div>
            <div className="kpi-number" style={{ fontSize: "1.125rem" }}>
              {formatWonSymbol(monthSummary.expenseRealized)}
            </div>
          </div>
          <div className="kpi-card muted">
            <div className="kpi-label">미실현 지출</div>
            <div className="kpi-number" style={{ fontSize: "1.125rem" }}>
              {formatWonSymbol(monthSummary.expenseUnrealized)}
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="month-nav">
          <button type="button" className="icon-btn" onClick={() => shiftMonth(-1)}>
            ◀
          </button>
          <h2>{format(monthDate, "yyyy년 M월", { locale: ko })}</h2>
          <button type="button" className="icon-btn" onClick={() => shiftMonth(1)}>
            ▶
          </button>
        </div>

        <div className="calendar-grid">
          {WEEKDAYS.map((label) => (
            <div key={label} className="weekday">
              {label}
            </div>
          ))}
          {days.map((date) => {
            const inMonth = date.getMonth() === month - 1;
            if (!inMonth) {
              return <div key={date.toISOString()} className="day-cell empty" />;
            }

            const day = date.getDate();
            const summary = dayMap.get(day) ?? emptyDaySummary();
            const isToday =
              year === today.year && month === today.month && day === today.day;
            const isSelected = selectedDay === day;
            const hasData =
              summary.incomeRealized > 0 ||
              summary.incomeUnrealized > 0 ||
              summary.expenseRealized > 0 ||
              summary.expenseUnrealized > 0;

            return (
              <button
                key={date.toISOString()}
                type="button"
                className={[
                  "day-cell",
                  isToday ? "today" : "",
                  isSelected ? "selected" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => setSelectedDay(day)}
              >
                <span className="day-number">{day}</span>
                {hasData && (
                  <div className="day-amounts">
                    {summary.incomeRealized > 0 && (
                      <span className="amt-income">
                        +{formatCompactWon(summary.incomeRealized)}
                      </span>
                    )}
                    {summary.incomeUnrealized > 0 && (
                      <span className="amt-muted">
                        +{formatCompactWon(summary.incomeUnrealized)}?
                      </span>
                    )}
                    {summary.expenseRealized > 0 && (
                      <span className="amt-expense">
                        -{formatCompactWon(summary.expenseRealized)}
                      </span>
                    )}
                    {summary.expenseUnrealized > 0 && (
                      <span className="amt-muted">
                        -{formatCompactWon(summary.expenseUnrealized)}?
                      </span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <p className="section-label">
          {selectedDay ? `${month}월 ${selectedDay}일 상세` : "이번 달 합계"}
        </p>
        <div className="kpi-grid">
          <div className="kpi-card income">
            <div className="kpi-label">실현 수익</div>
            <div className="kpi-number" style={{ fontSize: "1.125rem" }}>
              {formatWonSymbol(selectedSummary.incomeRealized)}
            </div>
          </div>
          <div className="kpi-card muted">
            <div className="kpi-label">미실현 수익</div>
            <div className="kpi-number" style={{ fontSize: "1.125rem" }}>
              {formatWonSymbol(selectedSummary.incomeUnrealized)}
            </div>
          </div>
          <div className="kpi-card expense">
            <div className="kpi-label">실현 지출</div>
            <div className="kpi-number" style={{ fontSize: "1.125rem" }}>
              {formatWonSymbol(selectedSummary.expenseRealized)}
            </div>
          </div>
          <div className="kpi-card muted">
            <div className="kpi-label">미실현 지출</div>
            <div className="kpi-number" style={{ fontSize: "1.125rem" }}>
              {formatWonSymbol(selectedSummary.expenseUnrealized)}
            </div>
          </div>
        </div>
      </div>

      {selectedDay && (
        <div className="card" style={{ padding: 16 }}>
          {(dayEntries ?? []).length === 0 ? (
            <div className="empty-state">내역이 없습니다.</div>
          ) : (
            <div className="entry-list">
              {(dayEntries ?? []).map((entry) => (
                <EntryRow key={entry.id} entry={entry} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function EntryRow({ entry }: { entry: LedgerEntry }) {
  const isIncome = entry.type === "INCOME";
  return (
    <div className="tx-row">
      <div className="tx-left">
        <div className={`tx-icon ${isIncome ? "income" : "expense"}`}>
          {isIncome ? "↑" : "↓"}
        </div>
        <div>
          <div className="tx-title">{entry.title}</div>
          <div className="tx-meta">
            {entry.category}
            {entry.roomName ? ` · ${entry.roomName}호` : ""}
          </div>
        </div>
      </div>
      <div className="tx-right">
        <div className={`tx-amount ${isIncome ? "income" : "expense"}`}>
          {isIncome ? "+" : "-"}
          {formatWonSymbol(entry.amount).replace("₩ ", "₩")}
        </div>
        <button
          type="button"
          className={`badge ${entry.isRealized ? "realized" : "unrealized"}`}
          style={{ border: "none", cursor: "pointer" }}
          onClick={() => entry.id && void toggleEntryRealized(entry.id)}
        >
          {entry.isRealized ? "실현" : "미실현"}
        </button>
      </div>
    </div>
  );
}

export function isWeekend(year: number, month: number, day: number): boolean {
  const dow = getDay(new Date(year, month - 1, day));
  return dow === 0 || dow === 6;
}

export function isTodayDate(date: Date): boolean {
  return isSameDay(date, new Date());
}
