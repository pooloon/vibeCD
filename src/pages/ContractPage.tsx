import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import {
  addMember,
  createContractWithRentEntries,
  db,
  getActiveContractForRoom,
  getMember,
  terminateContract,
} from "../db";
import { ROOM_NAMES, type RoomName } from "../types";
import { formatWon, todayParts } from "../utils";

export default function ContractPage() {
  const today = todayParts();
  const contracts = useLiveQuery(() => db.contracts.orderBy("createdAt").reverse().toArray());
  const members = useLiveQuery(() => db.members.toArray());
  const memberMap = new Map((members ?? []).map((m) => [m.id!, m]));

  const [roomName, setRoomName] = useState<RoomName>("1");
  const [tenantName, setTenantName] = useState("");
  const [phone, setPhone] = useState("");
  const [startYear, setStartYear] = useState(today.year);
  const [startMonth, setStartMonth] = useState(today.month);
  const [hasEnd, setHasEnd] = useState(false);
  const [endYear, setEndYear] = useState(today.year);
  const [endMonth, setEndMonth] = useState(today.month + 6 > 12 ? 12 : today.month + 6);
  const [monthlyRent, setMonthlyRent] = useState("");
  const [deposit, setDeposit] = useState("");
  const [note, setNote] = useState("");
  const [message, setMessage] = useState("");

  const resetForm = () => {
    setTenantName("");
    setPhone("");
    setMonthlyRent("");
    setDeposit("");
    setNote("");
  };

  const handleSubmit = async () => {
    if (!tenantName.trim()) {
      setMessage("입주자 이름을 입력해 주세요.");
      return;
    }
    const rent = Number(monthlyRent.replace(/,/g, ""));
    if (!rent || rent <= 0) {
      setMessage("월세 금액을 올바르게 입력해 주세요.");
      return;
    }

    const occupied = await getActiveContractForRoom(roomName);
    if (occupied) {
      const occupant = await getMember(occupied.memberId);
      setMessage(
        `${roomName}호는 이미 ${occupant?.name ?? "다른 입주자"}님과 계약 중입니다.`,
      );
      return;
    }

    const memberId = await addMember({
      name: tenantName.trim(),
      phone: phone.trim(),
      email: "",
      note: "",
    });

    await createContractWithRentEntries({
      memberId,
      roomName,
      startYear,
      startMonth,
      endYear: hasEnd ? endYear : null,
      endMonth: hasEnd ? endMonth : null,
      monthlyRent: rent,
      deposit: Number(deposit.replace(/,/g, "")) || 0,
      note: note.trim(),
      isActive: true,
    });

    resetForm();
    setMessage("계약서가 등록되었고, 월세 미실현 수익이 자동 생성되었습니다.");
  };

  return (
    <div className="page">
      <header className="page-header">
        <h1>계약서 등록</h1>
        <p>월단위 계약을 등록하면 매월 1일 월세(미실현)가 자동 생성됩니다.</p>
      </header>

      <div className="card">
        <div className="form-grid">
          <div className="field">
            <label>방 번호</label>
            <div className="room-chip-row">
              {ROOM_NAMES.map((room) => (
                <button
                  key={room}
                  type="button"
                  className={`room-chip ${roomName === room ? "selected" : ""}`}
                  onClick={() => setRoomName(room)}
                >
                  {room}호
                </button>
              ))}
            </div>
          </div>

          <div className="field">
            <label>입주자</label>
            <input
              value={tenantName}
              onChange={(e) => setTenantName(e.target.value)}
              placeholder="이름"
            />
          </div>

          <div className="field">
            <label>연락처</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="010-0000-0000"
              inputMode="tel"
            />
          </div>

          <div className="field">
            <label>계약 시작</label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <input
                type="number"
                value={startYear}
                onChange={(e) => setStartYear(Number(e.target.value))}
              />
              <input
                type="number"
                min={1}
                max={12}
                value={startMonth}
                onChange={(e) => setStartMonth(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="field">
            <label>
              <input
                type="checkbox"
                checked={hasEnd}
                onChange={(e) => setHasEnd(e.target.checked)}
                style={{ marginRight: 8 }}
              />
              종료월 지정
            </label>
            {hasEnd && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <input
                  type="number"
                  value={endYear}
                  onChange={(e) => setEndYear(Number(e.target.value))}
                />
                <input
                  type="number"
                  min={1}
                  max={12}
                  value={endMonth}
                  onChange={(e) => setEndMonth(Number(e.target.value))}
                />
              </div>
            )}
          </div>

          <div className="field">
            <label>월세 (원)</label>
            <input
              value={monthlyRent}
              onChange={(e) => setMonthlyRent(e.target.value)}
              placeholder="350000"
              inputMode="numeric"
            />
          </div>

          <div className="field">
            <label>보증금 (원)</label>
            <input
              value={deposit}
              onChange={(e) => setDeposit(e.target.value)}
              placeholder="500000"
              inputMode="numeric"
            />
          </div>

          <div className="field">
            <label>메모</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="계약 특이사항"
            />
          </div>
        </div>

        {message && (
          <p style={{ color: "var(--primary)", fontSize: "0.9rem" }}>{message}</p>
        )}

        <div className="btn-row">
          <button type="button" className="btn btn-primary" onClick={() => void handleSubmit()}>
            계약서 등록
          </button>
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginTop: 0 }}>등록된 계약</h3>
        {(contracts ?? []).length === 0 ? (
          <div className="empty-state">등록된 계약이 없습니다.</div>
        ) : (
          <div className="entry-list">
            {(contracts ?? []).map((contract) => {
              const member = memberMap.get(contract.memberId);
              return (
              <div key={contract.id} className="contract-card">
                <h3>
                  {contract.roomName}호 · {member?.name ?? "입주자"}
                </h3>
                <div className="entry-meta">
                  {contract.startYear}.{String(contract.startMonth).padStart(2, "0")} 시작
                  {contract.endYear
                    ? ` ~ ${contract.endYear}.${String(contract.endMonth).padStart(2, "0")}`
                    : " · 무기한"}
                </div>
                <div className="entry-meta">월세 {formatWon(contract.monthlyRent)}</div>
                {member?.phone && (
                  <div className="entry-meta">{member.phone}</div>
                )}
                {contract.note && <div className="entry-meta">{contract.note}</div>}
                {contract.isActive && contract.id && (
                  <div className="btn-row" style={{ marginTop: 8 }}>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => {
                        if (
                          window.confirm(
                            `${contract.roomName}호 계약을 종료하시겠습니까? 미래 미실현 월세는 삭제됩니다.`,
                          )
                        ) {
                          void terminateContract(contract.id!).then(() =>
                            setMessage(`${contract.roomName}호 계약이 종료되었습니다.`),
                          );
                        }
                      }}
                    >
                      계약 종료
                    </button>
                  </div>
                )}
                {!contract.isActive && (
                  <span className="badge unrealized">종료됨</span>
                )}
              </div>
            );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
