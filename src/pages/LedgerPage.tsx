import { useMemo, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { addManualEntry, db, toggleEntryRealized } from "../db";
import type { EntryType, LedgerEntry } from "../types";
import { formatWon, todayParts } from "../utils";

type Filter = "ALL" | "REALIZED" | "UNREALIZED";

export default function LedgerPage() {
  const today = todayParts();
  const entries = useLiveQuery(() =>
    db.ledgerEntries.orderBy("id").reverse().toArray(),
  );

  const [filter, setFilter] = useState<Filter>("ALL");
  const [type, setType] = useState<EntryType>("EXPENSE");
  const [amount, setAmount] = useState("");
  const [year, setYear] = useState(today.year);
  const [month, setMonth] = useState(today.month);
  const [day, setDay] = useState(today.day);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("기타");
  const [isRealized, setIsRealized] = useState(true);
  const [note, setNote] = useState("");
  const [message, setMessage] = useState("");

  const filtered = useMemo(() => {
    const list = entries ?? [];
    if (filter === "REALIZED") return list.filter((e) => e.isRealized);
    if (filter === "UNREALIZED") return list.filter((e) => !e.isRealized);
    return list;
  }, [entries, filter]);

  const handleAdd = async () => {
    const parsed = Number(amount.replace(/,/g, ""));
    if (!title.trim() || !parsed || parsed <= 0) {
      setMessage("제목과 금액을 입력해 주세요.");
      return;
    }

    await addManualEntry({
      type,
      amount: parsed,
      year,
      month,
      day,
      title: title.trim(),
      category,
      roomName: null,
      memberId: null,
      isRealized,
      note: note.trim(),
    });

    setAmount("");
    setTitle("");
    setNote("");
    setMessage("내역이 추가되었습니다.");
  };

  return (
    <div className="page">
      <header className="page-header">
        <h1>수입 · 지출</h1>
        <p>실제 지출/수입과 아직 실현되지 않은 금액을 구분해 관리합니다.</p>
      </header>

      <div className="card">
        <h3 style={{ marginTop: 0 }}>내역 추가</h3>
        <div className="form-grid">
          <div className="field">
            <label>구분</label>
            <div className="filter-row">
              <button
                type="button"
                className={`chip-filter ${type === "INCOME" ? "active" : ""}`}
                onClick={() => setType("INCOME")}
              >
                수익
              </button>
              <button
                type="button"
                className={`chip-filter ${type === "EXPENSE" ? "active" : ""}`}
                onClick={() => setType("EXPENSE")}
              >
                지출
              </button>
            </div>
          </div>

          <div className="field">
            <label>금액 (원)</label>
            <input
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              inputMode="numeric"
              placeholder="100000"
            />
          </div>

          <div className="field">
            <label>날짜</label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
              <input type="number" value={year} onChange={(e) => setYear(Number(e.target.value))} />
              <input
                type="number"
                min={1}
                max={12}
                value={month}
                onChange={(e) => setMonth(Number(e.target.value))}
              />
              <input
                type="number"
                min={1}
                max={31}
                value={day}
                onChange={(e) => setDay(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="field">
            <label>제목</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="전기요금, 수리비 등"
            />
          </div>

          <div className="field">
            <label>카테고리</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="월세">월세</option>
              <option value="공과금">공과금</option>
              <option value="관리비">관리비</option>
              <option value="수리">수리</option>
              <option value="기타">기타</option>
            </select>
          </div>

          <div className="field">
            <label>
              <input
                type="checkbox"
                checked={isRealized}
                onChange={(e) => setIsRealized(e.target.checked)}
                style={{ marginRight: 8 }}
              />
              실제 입출금 완료 (실현)
            </label>
          </div>

          <div className="field">
            <label>메모</label>
            <textarea value={note} onChange={(e) => setNote(e.target.value)} />
          </div>
        </div>

        {message && <p style={{ color: "var(--primary)" }}>{message}</p>}

        <div className="btn-row">
          <button type="button" className="btn btn-primary" onClick={() => void handleAdd()}>
            추가
          </button>
        </div>
      </div>

      <div className="card">
        <div className="filter-row">
          {(["ALL", "REALIZED", "UNREALIZED"] as const).map((item) => (
            <button
              key={item}
              type="button"
              className={`chip-filter ${filter === item ? "active" : ""}`}
              onClick={() => setFilter(item)}
            >
              {item === "ALL" ? "전체" : item === "REALIZED" ? "실현" : "미실현"}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state">표시할 내역이 없습니다.</div>
        ) : (
          <div className="entry-list">
            {filtered.map((entry) => (
              <LedgerRow key={entry.id} entry={entry} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function LedgerRow({ entry }: { entry: LedgerEntry }) {
  return (
    <div className="entry-item">
      <div className="entry-top">
        <div>
          <div className="entry-title">{entry.title}</div>
          <div className="entry-meta">
            {entry.year}.{String(entry.month).padStart(2, "0")}.
            {String(entry.day).padStart(2, "0")} · {entry.category}
            {entry.roomName ? ` · ${entry.roomName}호` : ""}
          </div>
          {entry.note && <div className="entry-meta">{entry.note}</div>}
        </div>
        <div style={{ textAlign: "right" }}>
          <div
            style={{
              fontWeight: 700,
              color: entry.type === "INCOME" ? "var(--income)" : "var(--expense)",
            }}
          >
            {entry.type === "INCOME" ? "+" : "-"}
            {formatWon(entry.amount)}
          </div>
          <button
            type="button"
            className={`badge ${entry.isRealized ? "realized" : "unrealized"}`}
            style={{ border: "none", marginTop: 6, cursor: "pointer" }}
            onClick={() => entry.id && void toggleEntryRealized(entry.id)}
          >
            {entry.isRealized ? "실현" : "미실현"} (탭하여 변경)
          </button>
        </div>
      </div>
    </div>
  );
}
