import { getCountryPack } from "../data/countries";
import { getInstrumentsForCountry } from "../data/marketUniverse";
import type { InvestmentFormData, User } from "../types";
import type {
  InvestmentStrategy,
  MarketInstrument,
  NewsItem,
  QuoteSnapshot,
  ReturnScenario,
  StrategyLeg,
} from "../types/market";
import { analyzeInstrumentIssues } from "./issueAnalysisService";
import { calcAgeFromBirthYear } from "../utils/birthYear";

interface Allocation {
  equity: number;
  bond: number;
  commodity: number;
  satellite: number;
}

function getAllocation(age: number, yearsToRetire: number, risk: InvestmentFormData["riskProfile"]): Allocation {
  let equity = 70;
  if (risk === "conservative") equity = 45;
  if (risk === "aggressive") equity = 85;
  if (age >= 55) equity -= 15;
  if (yearsToRetire <= 10) equity -= 10;
  if (yearsToRetire <= 5) equity -= 10;
  equity = Math.max(25, Math.min(90, equity));

  const bond = Math.max(10, 100 - equity - 15);
  const commodity = 8;
  const satellite = Math.max(0, 100 - equity - bond - commodity);

  return { equity, bond, commodity, satellite: Math.min(15, satellite) };
}

function pickCoreEquity(instruments: MarketInstrument[], countryCode: User["countryCode"]): MarketInstrument[] {
  const etfs = instruments.filter((i) => i.assetClass === "etf");
  const byCountry =
    countryCode === "KOR"
      ? etfs.filter((i) => i.themes.some((t) => ["국내 대형주", "코어", "미국"].includes(t)))
      : countryCode === "JPN"
        ? etfs.filter((i) => i.themes.some((t) => ["일본", "全世界", "글로벌"].includes(t)))
        : etfs.filter((i) => i.themes.some((t) => ["미국 코어", "Broad Market", "글로벌", "저비용"].includes(t)));

  const core = byCountry.slice(0, 2);
  if (core.length === 0) return etfs.slice(0, 2);
  return core;
}

function pickBond(instruments: MarketInstrument[]): MarketInstrument | undefined {
  return instruments.find((i) => i.assetClass === "bond");
}

function pickGold(instruments: MarketInstrument[]): MarketInstrument | undefined {
  return instruments.find((i) => i.assetClass === "commodity");
}

function pickSatellite(instruments: MarketInstrument[], analyses: Map<string, ReturnType<typeof analyzeInstrumentIssues>>): MarketInstrument[] {
  return instruments
    .filter((i) => i.assetClass === "stock" || (i.assetClass === "etf" && i.themes.includes("성장")))
    .filter((i) => {
      const g = analyses.get(i.symbol)?.grade;
      return g === "A" || g === "B";
    })
    .slice(0, 2);
}

function buildScenarios(
  allocation: Allocation,
  horizonYears: number,
  monthlyContribution: number,
): ReturnScenario[] {
  const equityW = allocation.equity / 100;
  const bondW = allocation.bond / 100;
  const commW = allocation.commodity / 100;

  const bearEquity = 0.03;
  const baseEquity = 0.08;
  const bullEquity = 0.11;
  const bearBond = 0.02;
  const baseBond = 0.04;
  const bullBond = 0.05;

  const blend = (eq: number, bd: number) => eq * equityW + bd * bondW + 0.04 * commW;

  const bear = blend(bearEquity, bearBond);
  const base = blend(baseEquity, baseBond);
  const bull = blend(bullEquity, bullBond);

  const contribNote =
    monthlyContribution > 0
      ? `월 ${monthlyContribution.toLocaleString()} 적립 가정`
      : "적립액 미입력 — 수익률만 참고";

  return [
    {
      label: "Bear",
      annualReturnPercent: Math.round(bear * 1000) / 10,
      probabilityLabel: "참고 20% (침체·고금리 장기)",
      terminalNote: `${horizonYears}년 복리+적립 ${contribNote}. 역사적 하단 가정, 보장 아님.`,
    },
    {
      label: "Base",
      annualReturnPercent: Math.round(base * 1000) / 10,
      probabilityLabel: "참고 55% (장기 평균 근처)",
      terminalNote: `DCA·리밸런싱 전제 ${contribNote}.`,
    },
    {
      label: "Bull",
      annualReturnPercent: Math.round(bull * 1000) / 10,
      probabilityLabel: "참고 25% (저금리·실적 서프라이즈)",
      terminalNote: `낙관 가정 ${contribNote}.`,
    },
  ];
}

function primaryAccount(countryCode: User["countryCode"]): string {
  const pack = getCountryPack(countryCode);
  return pack?.taxAccounts[0] ?? "일반";
}

export function buildInvestmentStrategy(
  user: User,
  form: InvestmentFormData,
  quotes: Map<string, QuoteSnapshot>,
  newsMap?: Map<string, NewsItem[]>,
): InvestmentStrategy {
  const pack = getCountryPack(user.countryCode)!;
  const age = calcAgeFromBirthYear(user.birthYear) ?? 40;
  const retirementAge = Number(form.retirementAge) || pack.defaultRetirementAge;
  const horizonYears = Math.max(retirementAge - age, 5);
  const yearsToRetire = Math.max(retirementAge - age, 0);
  const allocation = getAllocation(age, yearsToRetire, form.riskProfile);
  const instruments = getInstrumentsForCountry(user.countryCode);
  const headlines = (sym: string) => newsMap?.get(sym)?.map((n) => n.title) ?? [];

  const analyses = new Map(
    instruments.map((i) => [
      i.symbol,
      analyzeInstrumentIssues(i, quotes.get(i.symbol), headlines(i.symbol)),
    ]),
  );

  const core = pickCoreEquity(instruments, user.countryCode);
  const bond = pickBond(instruments);
  const gold = pickGold(instruments);
  const satellites = pickSatellite(instruments, analyses);

  const account = primaryAccount(user.countryCode);
  const legs: StrategyLeg[] = [];
  let order = 1;

  const addLeg = (
    phase: number,
    phaseLabel: string,
    period: string,
    inst: MarketInstrument,
    weight: number,
    action: string,
  ) => {
    const issue = analyses.get(inst.symbol)!;
    legs.push({
      order: order++,
      phase,
      phaseLabel,
      period,
      instrument: inst,
      weightPercent: weight,
      account,
      action,
      issueGrade: issue.grade,
      rationale: issue.outlook,
    });
  };

  // Phase 1 — Core (months 1-6)
  const coreWeight = Math.round(allocation.equity * 0.6);
  if (core[0]) addLeg(1, "Core", "1~3개월", core[0], coreWeight, "월 DCA 50%");
  if (core[1]) addLeg(1, "Core", "4~6개월", core[1], Math.round(allocation.equity * 0.25), "월 DCA 30%");

  // Phase 2 — Bond & Gold
  if (bond) addLeg(2, "Defensive", "7~9개월", bond, allocation.bond, "월 DCA 일괄");
  if (gold) addLeg(2, "Hedge", "10~12개월", gold, allocation.commodity, "분기 1회");

  // Phase 3 — Satellite
  satellites.forEach((s, idx) => {
    addLeg(3, "Satellite", `${13 + idx * 3}~${15 + idx * 3}개월`, s, Math.floor(allocation.satellite / satellites.length) || 5, "분할 매수·이슈 A/B만");
  });

  // Phase 4 — Glide note as rebalance
  if (yearsToRetire <= 10 && bond && core[0]) {
    addLeg(4, "Glide", "매년 1회", bond, 5, "주식→채권 5%p 리밸런싱");
  }

  const monthly = Number(form.monthlyContribution.replace(/[^\d.]/g, "")) || 0;
  const scenarios = buildScenarios(allocation, horizonYears, monthly);

  const riskLabel =
    form.riskProfile === "conservative"
      ? "안정형"
      : form.riskProfile === "aggressive"
        ? "공격형"
        : "중립형";

  return {
    summary: `${pack.flag} ${pack.label} · 만 ${age}세 · ${riskLabel} · 은퇴 ${retirementAge}세(${horizonYears}년). 코어 ETF→채권·금→우량 위성 순 DCA. Base case 연 ${scenarios[1].annualReturnPercent}% 참고(보장 없음).`,
    horizonYears,
    allocation: [
      { label: "주식·ETF", percent: allocation.equity },
      { label: "채권형", percent: allocation.bond },
      { label: "금·원자재", percent: allocation.commodity },
      { label: "위성", percent: allocation.satellite },
    ],
    legs,
    scenarios,
    disclaimers: [
      "과거 수익률·확률은 미래를 보장하지 않습니다.",
      "표시 종목은 유동성 상위 유니버스이며 전 상장 종목을 포함하지 않습니다.",
      "세금·수수료·환율은 시나리오에 단순 반영 또는 미반영.",
      "현행 가정 · 공식 확인 및 전문가 상담 필수.",
    ],
  };
}

export function estimateTerminalWealth(
  monthlyContribution: number,
  years: number,
  annualReturnPercent: number,
): number {
  const r = annualReturnPercent / 100 / 12;
  const n = years * 12;
  if (monthlyContribution <= 0 || n <= 0) return 0;
  if (r === 0) return monthlyContribution * n;
  return monthlyContribution * ((Math.pow(1 + r, n) - 1) / r);
}
