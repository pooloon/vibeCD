export interface DartDisclosure {
  corpCode: string;
  corpName: string;
  stockCode: string;
  reportName: string;
  receiptNo: string;
  receiptDate: string;
  submitter: string;
  reportUrl: string;
}

export interface DartCompanySummary {
  corpCode: string;
  corpName: string;
  stockCode: string;
  ceoName: string;
  industry: string;
  listingDate: string;
  homepage: string;
}

export interface KrxListedStock {
  code: string;
  name: string;
  market: "KOSPI" | "KOSDAQ";
  closePrice: number | null;
  changeRate: number | null;
  marketCap: number | null;
  volume: number | null;
  tradingDate: string;
}

export interface KrxLoadResult {
  stocks: KrxListedStock[];
  tradingDate: string;
  loadedAt: string;
}

export interface DartFinancialRow {
  accountName: string;
  currentAmount: number | null;
  previousAmount: number | null;
  currency: string;
}

export interface DartFinancialReport {
  stockCode: string;
  corpName: string;
  businessYear: string;
  reportCode: string;
  reportLabel: string;
  fsDiv: "CFS" | "OFS";
  rows: DartFinancialRow[];
}

export interface PriceHistoryPoint {
  date: string;
  close: number;
}

export interface PriceHistory {
  symbol: string;
  range: string;
  points: PriceHistoryPoint[];
}
