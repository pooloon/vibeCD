import type { CountryCode } from "../types";

export type AssetClass = "stock" | "etf" | "bond" | "commodity" | "reit";
export type Exchange = "KRX" | "NYSE" | "NASDAQ" | "TSE" | "LSE" | "SGX";
export type IssueGrade = "A" | "B" | "C" | "D";

export interface MarketInstrument {
  symbol: string;
  localCode: string;
  name: string;
  nameEn: string;
  assetClass: AssetClass;
  exchange: Exchange;
  countryCodes: CountryCode[];
  sector: string;
  themes: string[];
}

export interface QuoteSnapshot {
  symbol: string;
  price: number | null;
  changePercent: number | null;
  currency: string;
  peRatio: number | null;
  dividendYield: number | null;
  fiftyTwoWeekHigh: number | null;
  fiftyTwoWeekLow: number | null;
  marketCap: number | null;
  fetchedAt: string;
}

export interface NewsItem {
  symbol: string;
  title: string;
  publisher: string;
  link: string;
  publishedAt: string;
}

export interface IssueAnalysis {
  symbol: string;
  grade: IssueGrade;
  macro: string;
  sector: string;
  valuation: string;
  risks: string[];
  outlook: string;
  newsHeadlines: string[];
  newsSentiment: "positive" | "neutral" | "negative";
}

export interface StrategyLeg {
  order: number;
  phase: number;
  phaseLabel: string;
  period: string;
  instrument: MarketInstrument;
  weightPercent: number;
  account: string;
  action: string;
  issueGrade: IssueGrade;
  rationale: string;
}

export interface ReturnScenario {
  label: "Bear" | "Base" | "Bull";
  annualReturnPercent: number;
  probabilityLabel: string;
  terminalNote: string;
}

export interface InvestmentStrategy {
  summary: string;
  horizonYears: number;
  allocation: { label: string; percent: number }[];
  legs: StrategyLeg[];
  scenarios: ReturnScenario[];
  disclaimers: string[];
}

export interface BacktestResult {
  symbol: string;
  name: string;
  periodYears: number;
  cagrPercent: number;
  totalReturnPercent: number;
  maxDrawdownPercent: number;
  volatilityPercent: number;
  dataPoints: number;
}

export interface UniverseFilter {
  query: string;
  assetClass: AssetClass | "all";
}
