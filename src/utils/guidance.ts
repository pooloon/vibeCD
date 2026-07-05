import type { CountryCode } from "../types";
import { getCountryPack } from "../data/countries";
import { calcAgeFromBirthYear } from "./birthYear";

export interface UserGuidance {
  lifeStage: string;
  summary: string;
  priorities: string[];
  accounts: string[];
  brokers: string[];
  milestones: string[];
}

export function buildUserGuidance(
  countryCode: CountryCode,
  birthYear: string,
  retirementAge = 60,
): UserGuidance | null {
  const pack = getCountryPack(countryCode);
  const age = calcAgeFromBirthYear(birthYear);
  if (!pack || age === null) return null;

  const yearsToRetire = Math.max(retirementAge - age, 0);
  const lifeStage = getLifeStageLabel(countryCode, age);
  const summary = getSummary(countryCode, pack.label, age, yearsToRetire, retirementAge);

  return {
    lifeStage,
    summary,
    priorities: getPriorities(countryCode, age, yearsToRetire),
    accounts: pack.taxAccounts.slice(0, 4),
    brokers: pack.brokers.slice(0, 4),
    milestones: getMilestones(age, retirementAge, pack.currencySymbol),
  };
}

function getLifeStageLabel(countryCode: CountryCode, age: number): string {
  if (age < 30) return countryCode === "JPN" ? "資産形成期" : "자산 형성기";
  if (age < 45) return countryCode === "JPN" ? "成長・積立期" : "성장·적립기";
  if (age < 55) return countryCode === "JPN" ? "ピーク積立期" : "피크 적립기";
  if (age < retirementThreshold(countryCode)) return countryCode === "JPN" ? "退職準備期" : "은퇴 준비기";
  return countryCode === "JPN" ? "退職・受取期" : "은퇴·수령기";
}

function retirementThreshold(countryCode: CountryCode): number {
  return getCountryPack(countryCode)?.defaultRetirementAge ?? 60;
}

function getSummary(
  countryCode: CountryCode,
  countryLabel: string,
  age: number,
  yearsToRetire: number,
  retirementAge: number,
): string {
  const ageText =
    countryCode === "JPN"
      ? `${age}歳`
      : countryCode === "KOR"
        ? `만 ${age}세`
        : `Age ${age}`;

  if (countryCode === "JPN") {
    return `${countryLabel}在住・${ageText}。${retirementAge}歳退職まで約${yearsToRetire}年の積立期間。${getCountryPack(countryCode)?.publicPension}を確認し、NISA・iDeCoを優先検討。`;
  }
  if (countryCode === "KOR") {
    return `${countryLabel} 기준 · ${ageText}. ${retirementAge}세 은퇴까지 약 ${yearsToRetire}년 축적. ${getCountryPack(countryCode)?.publicPension} 확인 후 ISA·연금·IRP 우선 검토.`;
  }
  return `${countryLabel} · ${ageText}. ~${yearsToRetire} years to retirement at ${retirementAge}. Review ${getCountryPack(countryCode)?.publicPension} and tax-advantaged accounts first.`;
}

function getPriorities(countryCode: CountryCode, age: number, yearsToRetire: number): string[] {
  switch (countryCode) {
    case "KOR":
      if (age < 40) {
        return [
          "ISA 비과세 한도 우선 — 성장·배당 ETF",
          "연금저축·IRP 세액공제 극대화",
          "앱금융(토스·카카오) vs 전통사 수수료·환전 비교",
        ];
      }
      if (yearsToRetire > 10) {
        return [
          "ISA + 연금/IRP 납입 한도 소진",
          "글로벌 분산 + 환헤지 ETF 검토",
          "금융소득 종합과세 여부 확인",
        ];
      }
      return [
        "은퇴 5년 전 Glide Path — 주식↓ 채권·금↑",
        "ISA→연금 전환 검토",
        "국민연금 수령 시점·액수 확인",
      ];
    case "JPN":
      if (age < 40) {
        return [
          "신NISA つみたて — 全世界株インデックス",
          "iDeCo 加入・控除活用",
          "SBI vs 楽天 — NISA·米国株コスト比較",
        ];
      }
      if (yearsToRetire > 10) {
        return ["NISA枠の継続活用", "iDeCo追加拠出", "特定口座は超過分のみ"];
      }
      return ["退職前ポートフォリオ縮小", "年金定期便で受給額確認", "iDeCo受取方法検討"];
    case "USA":
      return [
        "Max 401(k) employer match first",
        "Roth vs Traditional IRA by tax bracket",
        "HSA if eligible — triple tax advantage",
      ];
    case "GBR":
      return ["Use ISA allowance before GIA", "SIPP for higher-rate taxpayers", "LISA if under 40"];
    case "SGP":
      return ["CPF OA/SA optimization", "SRS for tax relief", "Local vs IBKR for US exposure"];
  }
}

function getMilestones(
  age: number,
  retirementAge: number,
  currencySymbol: string,
): string[] {
  const now = age;
  const steps = [5, 10, 15].map((offset) => now + offset).filter((a) => a < retirementAge);
  if (steps.length === 0) {
    return [`현재 ${now}세 — 은퇴 ${retirementAge}세 (${currencySymbol} 기준 목표 자산 입력 후 산출)`];
  }
  return steps.map(
    (targetAge) =>
      `${targetAge}세 (${retirementAge - targetAge}년 후 은퇴) — 절세계좌·적립률 점검`,
  );
}
