import { getCountryPack } from "../data/countries";
import { getInstrumentsForCountry } from "../data/marketUniverse";
import type { InvestmentFormData, User } from "../types";
import type { BacktestResult, NewsItem, QuoteSnapshot } from "../types/market";
import { formatAgeDisplay } from "../utils/birthYear";
import { analyzeInstrumentIssues, sentimentLabel } from "./issueAnalysisService";
import { formatPrice } from "./marketDataService";
import {
  buildInvestmentStrategy,
  estimateTerminalWealth,
} from "./strategyEngine";

export function generateFullReport(
  user: User,
  form: InvestmentFormData,
  quotes: Map<string, QuoteSnapshot>,
  newsMap: Map<string, NewsItem[]>,
  backtests: BacktestResult[],
): string {
  const pack = getCountryPack(user.countryCode)!;
  const strategy = buildInvestmentStrategy(user, form, quotes, newsMap);
  const ageLine = formatAgeDisplay(user.birthYear, user.countryCode);
  const date = new Date().toISOString().slice(0, 10);
  const monthly = Number(form.monthlyContribution.replace(/[^\d.]/g, "")) || 0;
  const instruments = getInstrumentsForCountry(user.countryCode);

  const lines: string[] = [
    `# ${pack.flag} ${user.name} · 통합 투자·순차전략 리포트`,
    `> 세법·상품: ${pack.label} | ${ageLine} | 기준일: ${date} | 투자 참고용`,
    "",
    "## 0. 프로필 & Reference Pack",
    `- 국적·세법: ${pack.label} (${pack.code})`,
    `- 절세계좌: ${pack.taxAccounts.join(", ")}`,
    `- 추천 브로커: ${pack.brokers.slice(0, 5).join(", ")}`,
    "",
    "## 1. Executive Summary",
    strategy.summary,
    "",
    "## 2. 자산 배분",
    ...strategy.allocation.map((a) => `- ${a.label}: ${a.percent}%`),
    "",
    "## 3. 시장·시세·지표 (유니버스 ${instruments.length}종목)",
    "| 종목 | 코드 | 현재가 | PER | 등급 | 뉴스톤 |",
    "|------|------|--------|-----|------|--------|",
  ];

  for (const inst of instruments.slice(0, 15)) {
    const q = quotes.get(inst.symbol);
    const news = newsMap.get(inst.symbol)?.map((n) => n.title) ?? [];
    const issue = analyzeInstrumentIssues(inst, q, news);
    lines.push(
      `| ${inst.name} | ${inst.localCode} | ${formatPrice(q?.price ?? null, q?.currency ?? "")} | ${q?.peRatio?.toFixed(1) ?? "—"} | ${issue.grade} | ${sentimentLabel(issue.newsSentiment)} |`,
    );
  }

  lines.push("", "## 4. 이슈·미래가치 (전략 편입 종목)");
  for (const leg of strategy.legs) {
    const news = newsMap.get(leg.instrument.symbol)?.map((n) => n.title) ?? [];
    const issue = analyzeInstrumentIssues(leg.instrument, quotes.get(leg.instrument.symbol), news);
    lines.push(`### ${leg.instrument.name} (${leg.instrument.localCode}) — ${issue.grade}`);
    lines.push(`- 거시: ${issue.macro}`);
    lines.push(`- 섹터: ${issue.sector}`);
    lines.push(`- 밸류: ${issue.valuation}`);
    if (news.length) lines.push(`- 최근 뉴스: ${news[0]}`);
    lines.push(`- 전망: ${issue.outlook}`);
    lines.push("");
  }

  lines.push("## 5. 순차 매수 전략");
  lines.push("| # | Phase | 기간 | 종목 | 코드 | 비중 | 계좌 | 액션 |");
  lines.push("|---|-------|------|------|------|------|------|------|");
  for (const leg of strategy.legs) {
    lines.push(
      `| ${leg.order} | ${leg.phaseLabel} | ${leg.period} | ${leg.instrument.name} | ${leg.instrument.localCode} | ${leg.weightPercent}% | ${leg.account} | ${leg.action} |`,
    );
  }

  lines.push("", "## 6. 백테스트 (월간·과거 데이터)");
  if (backtests.length === 0) {
    lines.push("- 데이터 미로드 — 앱 백테스트 탭에서 실행");
  } else {
    lines.push("| 종목 | CAGR | 총수익 | MDD | 변동성 |");
    lines.push("|------|------|--------|-----|--------|");
    for (const bt of backtests) {
      lines.push(
        `| ${bt.name} | ${bt.cagrPercent}% | ${bt.totalReturnPercent}% | ${bt.maxDrawdownPercent}% | ${bt.volatilityPercent}% |`,
      );
    }
  }

  lines.push("", `## 7. 기대수익 시나리오 (${strategy.horizonYears}년)`);
  for (const s of strategy.scenarios) {
    const terminal =
      monthly > 0
        ? ` · 적립만 ~${Math.round(estimateTerminalWealth(monthly, strategy.horizonYears, s.annualReturnPercent)).toLocaleString()}`
        : "";
    lines.push(`- **${s.label}**: 연 ${s.annualReturnPercent}% (${s.probabilityLabel})${terminal}`);
  }

  lines.push("", "## 8. 리스크 & 체크리스트");
  lines.push("- [ ] 절세계좌 한도·납입 일정 확인");
  lines.push("- [ ] 환율·수수료·TER 반영");
  lines.push("- [ ] 분기 리밸런싱·뉴스 모니터링");
  lines.push("- [ ] 세법·거주지 변경 시 재설정");

  lines.push("", "## 9. 면책·가정");
  for (const d of strategy.disclaimers) lines.push(`- ${d}`);

  return lines.join("\n");
}
