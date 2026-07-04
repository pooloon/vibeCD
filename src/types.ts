export const ROOM_NAMES = [
  "1", "2", "3", "4", "7", "8", "9", "10",
  "13", "14", "15", "16", "17", "S",
] as const;

export type RoomName = (typeof ROOM_NAMES)[number];

export type EntryType = "INCOME" | "EXPENSE";
export type EntrySource = "CONTRACT_RENT" | "MANUAL";
export type PaymentStatus = "PAID" | "UNPAID" | "PARTIAL";

/** 가입자(회원) — 블루프린트 MemberEntity */
export interface Member {
  id?: number;
  name: string;
  phone: string;
  email: string;
  note: string;
  createdAt: number;
}

/** 월단위 계약서 — 블루프린트 ContractEntity */
export interface Contract {
  id?: number;
  memberId: number;
  roomName: RoomName;
  startYear: number;
  startMonth: number;
  endYear: number | null;
  endMonth: number | null;
  monthlyRent: number;
  deposit: number;
  note: string;
  isActive: boolean;
  createdAt: number;
}

/** 수익·비용 내역 — 블루프린트 TransactionEntity */
export interface LedgerEntry {
  id?: number;
  type: EntryType;
  source: EntrySource;
  amount: number;
  year: number;
  month: number;
  day: number;
  title: string;
  category: string;
  roomName: RoomName | null;
  memberId: number | null;
  contractId: number | null;
  isRealized: boolean;
  note: string;
}

export interface DaySummary {
  incomeRealized: number;
  incomeUnrealized: number;
  expenseRealized: number;
  expenseUnrealized: number;
}

export interface PeriodSummary extends DaySummary {
  totalIncome: number;
  totalExpense: number;
  realizedNet: number;
  totalNet: number;
}

export interface DashboardKpi {
  activeContracts: number;
  vacantRooms: number;
  occupancyRate: number;
  monthSummary: PeriodSummary;
  unpaidRent: number;
  dueThisMonth: number;
}

export function emptyDaySummary(): DaySummary {
  return {
    incomeRealized: 0,
    incomeUnrealized: 0,
    expenseRealized: 0,
    expenseUnrealized: 0,
  };
}

export function summarizeEntries(entries: LedgerEntry[]): PeriodSummary {
  const base = entries.reduce<DaySummary>(
    (acc, entry) => {
      if (entry.type === "INCOME") {
        if (entry.isRealized) acc.incomeRealized += entry.amount;
        else acc.incomeUnrealized += entry.amount;
      } else if (entry.isRealized) {
        acc.expenseRealized += entry.amount;
      } else {
        acc.expenseUnrealized += entry.amount;
      }
      return acc;
    },
    emptyDaySummary(),
  );

  return {
    ...base,
    totalIncome: base.incomeRealized + base.incomeUnrealized,
    totalExpense: base.expenseRealized + base.expenseUnrealized,
    realizedNet: base.incomeRealized - base.expenseRealized,
    totalNet:
      base.incomeRealized +
      base.incomeUnrealized -
      (base.expenseRealized + base.expenseUnrealized),
  };
}

export function monthRange(
  startYear: number,
  startMonth: number,
  endYear: number | null,
  endMonth: number | null,
  openEndedMonths = 24,
): Array<{ year: number; month: number }> {
  const months: Array<{ year: number; month: number }> = [];
  let year = startYear;
  let month = startMonth;

  if (endYear === null || endMonth === null) {
    for (let i = 0; i < openEndedMonths; i += 1) {
      months.push({ year, month });
      month += 1;
      if (month > 12) {
        month = 1;
        year += 1;
      }
    }
    return months;
  }

  while (year < endYear || (year === endYear && month <= endMonth)) {
    months.push({ year, month });
    month += 1;
    if (month > 12) {
      month = 1;
      year += 1;
    }
    if (months.length > 120) break;
  }

  return months;
}

export function isContractActiveInMonth(
  contract: Contract,
  year: number,
  month: number,
): boolean {
  if (!contract.isActive) return false;
  const start = contract.startYear * 12 + contract.startMonth;
  const target = year * 12 + month;
  if (target < start) return false;
  if (contract.endYear === null || contract.endMonth === null) return true;
  const end = contract.endYear * 12 + contract.endMonth;
  return target <= end;
}

export function getMemberPaymentStatus(
  entries: LedgerEntry[],
): PaymentStatus {
  const income = entries.filter((e) => e.type === "INCOME");
  if (income.length === 0) return "PAID";
  const unrealized = income.filter((e) => !e.isRealized);
  if (unrealized.length === income.length) return "UNPAID";
  if (unrealized.length > 0) return "PARTIAL";
  return "PAID";
}

export interface BackupData {
  version: 2;
  exportedAt: string;
  members: Member[];
  contracts: Contract[];
  ledgerEntries: LedgerEntry[];
}
