import { useMemo } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../db";
import { ROOM_NAMES, isContractActiveInMonth, type Contract } from "../types";
import { formatWonSymbol, todayParts } from "../utils";

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
      <div className="kpi-grid">
        <div className="kpi-card income">
          <div className="kpi-label">입주</div>
          <div className="kpi-value">
            <span className="kpi-number">{occupied}</span>
            <span className="kpi-unit">Rooms</span>
          </div>
        </div>
        <div className="kpi-card expense">
          <div className="kpi-label">공실</div>
          <div className="kpi-value">
            <span className="kpi-number">{vacant}</span>
            <span className="kpi-unit">Rooms</span>
          </div>
        </div>
      </div>

      <div className="section-header">
        <h2>실시간 방 현황</h2>
        <div className="section-header-meta">
          <span aria-hidden>▦</span>
          <span>{ROOM_NAMES.length}개 총합</span>
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
              <div className="room-tile-top">
                <div className="room-tile-number">{room}</div>
                {isOccupied && <span className="room-occupied-dot" aria-hidden />}
              </div>
              {isOccupied ? (
                <>
                  <div className="room-tile-tenant">
                    {memberMap.get(contract!.memberId)?.name ?? "입주자"}
                  </div>
                  <div className="room-tile-rent">
                    {formatWonSymbol(contract!.monthlyRent)}
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
