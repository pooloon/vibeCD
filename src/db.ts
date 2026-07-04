import Dexie, { type EntityTable } from "dexie";
import {
  ROOM_NAMES,
  type BackupData,
  type Contract,
  type LedgerEntry,
  type Member,
  type RoomName,
  isContractActiveInMonth,
  monthRange,
} from "./types";

class PracticeRoomDB extends Dexie {
  members!: EntityTable<Member, "id">;
  contracts!: EntityTable<Contract, "id">;
  ledgerEntries!: EntityTable<LedgerEntry, "id">;

  constructor() {
    super("PracticeRoomDB");
    this.version(2).stores({
      members: "++id, name, phone, createdAt",
      contracts: "++id, memberId, roomName, isActive, startYear, startMonth",
      ledgerEntries:
        "++id, year, month, day, type, isRealized, contractId, memberId",
    });
  }
}

export const db = new PracticeRoomDB();

export async function getActiveContractForRoom(
  roomName: RoomName,
): Promise<Contract | undefined> {
  return db.contracts
    .where("roomName")
    .equals(roomName)
    .filter((c) => c.isActive)
    .first();
}

export async function getMember(id: number): Promise<Member | undefined> {
  return db.members.get(id);
}

export async function addMember(
  member: Omit<Member, "id" | "createdAt">,
): Promise<number> {
  const id = await db.members.add({
    ...member,
    createdAt: Date.now(),
  } as Member);
  return id as number;
}

export async function updateMember(member: Member): Promise<void> {
  await db.members.put(member);
}

export async function createContractWithRentEntries(
  contract: Omit<Contract, "id" | "createdAt">,
): Promise<number> {
  const occupied = await getActiveContractForRoom(contract.roomName);
  if (occupied) {
    throw new Error(`ROOM_OCCUPIED:${contract.roomName}`);
  }

  const member = await db.members.get(contract.memberId);
  if (!member) throw new Error("MEMBER_NOT_FOUND");

  const contractId = await db.contracts.add({
    ...contract,
    createdAt: Date.now(),
  } as Contract);

  const months = monthRange(
    contract.startYear,
    contract.startMonth,
    contract.endYear,
    contract.endMonth,
  );

  const entries: LedgerEntry[] = months.map(({ year, month }) => ({
    type: "INCOME",
    source: "CONTRACT_RENT",
    amount: contract.monthlyRent,
    year,
    month,
    day: 1,
    title: `${contract.roomName}호 월세`,
    category: "월세",
    roomName: contract.roomName,
    memberId: contract.memberId,
    contractId: contractId ?? null,
    isRealized: false,
    note: member.name,
  }));

  await db.ledgerEntries.bulkAdd(entries);
  return contractId as number;
}

export async function terminateContract(contractId: number): Promise<void> {
  await db.transaction("rw", db.contracts, db.ledgerEntries, async () => {
    const contract = await db.contracts.get(contractId);
    if (!contract) return;

    await db.contracts.update(contractId, { isActive: false });

    const today = new Date();
    const futureEntries = await db.ledgerEntries
      .where("contractId")
      .equals(contractId)
      .toArray();

    for (const entry of futureEntries) {
      const entryDate = new Date(entry.year, entry.month - 1, entry.day);
      if (entryDate > today && !entry.isRealized) {
        await db.ledgerEntries.delete(entry.id!);
      }
    }
  });
}

export async function toggleEntryRealized(entryId: number): Promise<void> {
  const entry = await db.ledgerEntries.get(entryId);
  if (!entry) return;
  await db.ledgerEntries.update(entryId, { isRealized: !entry.isRealized });
}

export async function addManualEntry(
  entry: Omit<LedgerEntry, "id" | "source" | "contractId">,
): Promise<void> {
  await db.ledgerEntries.add({
    ...entry,
    source: "MANUAL",
    contractId: null,
  } as LedgerEntry);
}

export async function exportBackup(): Promise<BackupData> {
  const [members, contracts, ledgerEntries] = await Promise.all([
    db.members.toArray(),
    db.contracts.toArray(),
    db.ledgerEntries.toArray(),
  ]);
  return {
    version: 2,
    exportedAt: new Date().toISOString(),
    members,
    contracts,
    ledgerEntries,
  };
}

export async function importBackup(data: BackupData): Promise<void> {
  if (data.version !== 2) {
    throw new Error("지원하지 않는 백업 형식입니다. v2 백업 파일이 필요합니다.");
  }
  await db.transaction("rw", db.members, db.contracts, db.ledgerEntries, async () => {
    await db.ledgerEntries.clear();
    await db.contracts.clear();
    await db.members.clear();
    await db.members.bulkAdd(data.members);
    await db.contracts.bulkAdd(data.contracts);
    await db.ledgerEntries.bulkAdd(data.ledgerEntries);
  });
}

export async function clearAllData(): Promise<void> {
  await db.transaction("rw", db.members, db.contracts, db.ledgerEntries, async () => {
    await db.ledgerEntries.clear();
    await db.contracts.clear();
    await db.members.clear();
  });
}

export async function ensureSeedData(): Promise<void> {
  const count = await db.members.count();
  if (count > 0) return;

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  const member1Id = await addMember({
    name: "김민수",
    phone: "010-1234-5678",
    email: "",
    note: "드럼 연습",
  });
  const member2Id = await addMember({
    name: "박지은",
    phone: "010-9876-5432",
    email: "jieun@example.com",
    note: "보컬 정기",
  });

  await createContractWithRentEntries({
    memberId: member1Id,
    roomName: "1",
    startYear: year,
    startMonth: month,
    endYear: year,
    endMonth: month + 5 > 12 ? 12 : month + 5,
    monthlyRent: 350000,
    deposit: 500000,
    note: "",
    isActive: true,
  });

  await createContractWithRentEntries({
    memberId: member2Id,
    roomName: "7",
    startYear: year,
    startMonth: Math.max(1, month - 1),
    endYear: null,
    endMonth: null,
    monthlyRent: 400000,
    deposit: 600000,
    note: "",
    isActive: true,
  });

  await addManualEntry({
    type: "EXPENSE",
    amount: 120000,
    year,
    month,
    day: 5,
    title: "전기요금",
    category: "공과금",
    roomName: null,
    memberId: null,
    isRealized: true,
    note: "",
  });

  await addManualEntry({
    type: "EXPENSE",
    amount: 80000,
    year,
    month,
    day: 15,
    title: "건물 관리비",
    category: "관리비",
    roomName: null,
    memberId: null,
    isRealized: false,
    note: "미납 예정",
  });
}

export function countVacantRooms(
  contracts: Contract[],
  year: number,
  month: number,
): number {
  const occupied = new Set(
    contracts
      .filter((c) => isContractActiveInMonth(c, year, month))
      .map((c) => c.roomName),
  );
  return ROOM_NAMES.length - occupied.size;
}

export function isValidRoomName(
  value: string,
): value is (typeof ROOM_NAMES)[number] {
  return (ROOM_NAMES as readonly string[]).includes(value);
}
