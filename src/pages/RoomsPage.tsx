import { useMemo } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../db";
import { ROOM_NAMES, isContractActiveInMonth, type Contract } from "../types";
import { formatWon, todayParts } from "../utils";

export default function RoomsPage() {
  const today = todayParts();
  const contracts = useLiveQuery(() => db.contracts.toArray());
  const members = useLiveQuery(() => db.members.toArray());
  const memberMap = new Map((members ?? []).map((m) => [m.id!, m]));

  const roomMap = useMemo(() => {
    const map = new Map<string, Contract>();
    for (const contract of contracts ?? []) {
      if (
        contract.isActive &&
        isContractActiveInMonth(contract, today.year, today.month)
      ) {
        map.set(contract.roomName, contract);
      }
    }
    return map;
  }, [contracts, today.year, today.month]);

  const occupied = ROOM_NAMES.filter((room) => roomMap.has(room)).length;
  const vacant = ROOM_NAMES.length - occupied;

  return (
    <div className="page">
      <header className="page-header">
        <h1>방 현황</h1>
        <p>
          {today.year}년 {today.month}월 기준 · 입주 {occupied} / 공실 {vacant}
        </p>
      </header>

      <div className="summary-grid" style={{ marginBottom: 12 }}>
        <div className="summary-item income">
          <div className="label">입주</div>
          <div className="value">{occupied}개</div>
        </div>
        <div className="summary-item muted">
          <div className="label">공실</div>
          <div className="value">{vacant}개</div>
        </div>
      </div>

      <div className="room-board">
        {ROOM_NAMES.map((room) => {
          const contract = roomMap.get(room);
          const isOccupied = Boolean(contract);

          return (
            <div
              key={room}
              className={`room-tile ${isOccupied ? "occupied" : "vacant"}`}
            >
              <div className="room-tile-number">{room}</div>
              {isOccupied ? (
                <>
                  <div className="room-tile-status">입주</div>
                  <div className="room-tile-tenant">
                    {memberMap.get(contract!.memberId)?.name ?? "입주자"}
                  </div>
                  <div className="room-tile-rent">
                    {formatWon(contract!.monthlyRent)}
                  </div>
                </>
              ) : (
                <div className="room-tile-status">공실</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
