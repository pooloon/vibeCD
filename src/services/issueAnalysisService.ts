import type { MarketInstrument, IssueAnalysis, IssueGrade, QuoteSnapshot } from "../types/market";
import { scoreNewsSentiment } from "./newsService";

function gradeFromScore(score: number): IssueGrade {
  if (score >= 8) return "A";
  if (score >= 6) return "B";
  if (score >= 4) return "C";
  return "D";
}

export function analyzeInstrumentIssues(
  instrument: MarketInstrument,
  quote: QuoteSnapshot | undefined,
  newsHeadlines: string[] = [],
): IssueAnalysis {
  let score = 6;
  const risks: string[] = [];
  const newsSentiment = scoreNewsSentiment(newsHeadlines);

  if (newsSentiment === "negative") {
    score -= 1;
    risks.push("최근 부정적 뉴스 흐름");
  } else if (newsSentiment === "positive") {
    score += 0.5;
  }

  let macro = "글로벌 금리·환율 변동에 민감. 분산 투자 전제.";
  if (instrument.themes.includes("금리")) {
    macro = "금리 인하/인상 사이클에 직접 노출. 듀레이션·재투자 리스크 주시.";
    if (quote?.changePercent && quote.changePercent < -1) score -= 0.5;
  }
  if (instrument.themes.includes("환헤지") || instrument.themes.includes("미국")) {
    macro = "원·엔·달러 환율 및 미국 경기·금리 연동. FX 헤지 여부가 실질 수익 좌우.";
  }

  let sector = `${instrument.sector} 섹터 — 업황·규제·경기민감도 반영 필요.`;
  if (instrument.themes.includes("AI")) {
    sector = "AI 수요 확대 수혜 가능, 밸류에이션·경쟁 심화 리스크 병존.";
    risks.push("AI 테마 프리미엄 축소 가능");
  }
  if (instrument.themes.includes("반도체")) {
    sector = "반도체 사이클(재고·CAPEX) 변동성 큼. 업황 회복/둔화 주기 점검.";
    risks.push("반도체 다운사이클");
  }
  if (instrument.themes.includes("규제")) {
    sector = "플랫폼 규제·독과점 이슈 지속. 정책 변화 모니터링.";
    score -= 1;
    risks.push("규제 강화");
  }

  let valuation = "시세 데이터 부족 — 공시·컨센서스로 보완 필요.";
  const pe = quote?.peRatio;
  const price = quote?.price;
  const high = quote?.fiftyTwoWeekHigh;
  const low = quote?.fiftyTwoWeekLow;

  if (pe !== null && pe !== undefined) {
    if (pe > 35) {
      valuation = `PER ${pe.toFixed(1)}x — 성장 기대 반영, 밸류에이션 부담 가능.`;
      score -= 1;
      risks.push("고PER");
    } else if (pe < 12) {
      valuation = `PER ${pe.toFixed(1)}x — 상대적 저평가 구간 가능, 이유(업황·구조) 확인.`;
      score += 0.5;
    } else {
      valuation = `PER ${pe.toFixed(1)}x — 중립~합리 구간(섹터 평균 대비 확인).`;
    }
  }

  if (price && high && low && high > low) {
    const pos = (price - low) / (high - low);
    if (pos > 0.85) {
      valuation += ` 52주 고점 대비 상단(${Math.round(pos * 100)}%) — 추격 매수 주의.`;
      score -= 0.5;
    } else if (pos < 0.35) {
      valuation += ` 52주 저점 대비 하단 — 역발상 기회 vs 추가 하락 리스크.`;
    }
  }

  if (instrument.assetClass === "etf" && instrument.themes.includes("코어")) {
    score += 1;
  }

  const grade = gradeFromScore(score);
  const newsNote =
    newsHeadlines.length > 0
      ? ` 뉴스 톤: ${newsSentiment === "positive" ? "우호" : newsSentiment === "negative" ? "부정" : "중립"}.`
      : "";

  const outlook =
    (grade === "A"
      ? "중장기 코어·위성 포트폴리오에 적합(분산·DCA 전제)."
      : grade === "B"
        ? "비중 제한·분할 매수 권장. 이슈 해소 시 비중 확대 검토."
        : grade === "C"
          ? "투기적 비중만. 변동성·밸류 리스크 상존."
          : "현재 가정 하 회피 또는 극소 비중.") + newsNote;

  return {
    symbol: instrument.symbol,
    grade,
    macro,
    sector,
    valuation,
    risks: risks.length ? risks : ["일반 시장 변동성"],
    outlook,
    newsHeadlines,
    newsSentiment,
  };
}

export function gradeColor(grade: IssueGrade): string {
  switch (grade) {
    case "A":
      return "grade-a";
    case "B":
      return "grade-b";
    case "C":
      return "grade-c";
    case "D":
      return "grade-d";
    default: {
      const _exhaustive: never = grade;
      return _exhaustive;
    }
  }
}

export function sentimentLabel(s: IssueAnalysis["newsSentiment"]): string {
  switch (s) {
    case "positive":
      return "우호";
    case "negative":
      return "부정";
    case "neutral":
      return "중립";
    default: {
      const _exhaustive: never = s;
      return _exhaustive;
    }
  }
}
