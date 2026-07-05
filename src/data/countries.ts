import type { CountryPack, InvestmentFormData, User } from "../types";
import { formatAgeDisplay } from "../utils/birthYear";

export const COUNTRIES: CountryPack[] = [
  {
    code: "KOR",
    label: "대한민국",
    flag: "🇰🇷",
    currency: "KRW",
    currencySymbol: "원",
    taxAccounts: ["ISA (일반/서민형)", "연금저축", "IRP", "ISA→연금 전환"],
    brokers: [
      "토스증권",
      "카카오페이증권",
      "KB증권 M-able",
      "미래에셋",
      "한국투자",
      "키움",
      "NH투자",
    ],
    publicPension: "국민연금",
    defaultRetirementAge: 60,
    extraAccountFields: [
      { id: "isaLimit", label: "ISA 잔여 납입한도", placeholder: "예: 1,500만 원" },
      { id: "pensionLimit", label: "연금저축 잔여 한도", placeholder: "예: 600만 원" },
      { id: "irpLimit", label: "IRP 잔여 한도", placeholder: "예: 900만 원" },
    ],
    excludedProducts: ["해외 ISA", "401(k)", "Roth IRA (한국 거주자 해당 없음)"],
  },
  {
    code: "JPN",
    label: "일본",
    flag: "🇯🇵",
    currency: "JPY",
    currencySymbol: "円",
    taxAccounts: ["신NISA (成長·つみたて)", "iDeCo", "特定口座 (源泉有/無)"],
    brokers: ["SBI証券", "楽天証券", "マネックス", "auカブコム", "PayPay証券"],
    publicPension: "国民年金·厚生年金",
    defaultRetirementAge: 65,
    extraAccountFields: [
      { id: "nisaUsage", label: "NISA枠利用状況", placeholder: "成長枠 / つみたて枠" },
      { id: "idecoStatus", label: "iDeCo加入", placeholder: "加入済 / 未加入" },
      { id: "tokuteiType", label: "特定口座種別", placeholder: "源泉有 / 源泉無" },
    ],
    excludedProducts: ["한국 ISA", "401(k)"],
  },
  {
    code: "USA",
    label: "미국",
    flag: "🇺🇸",
    currency: "USD",
    currencySymbol: "$",
    taxAccounts: ["401(k)", "Traditional IRA", "Roth IRA", "HSA", "Taxable Brokerage"],
    brokers: ["Fidelity", "Charles Schwab", "Vanguard", "Interactive Brokers"],
    publicPension: "Social Security",
    defaultRetirementAge: 67,
    extraAccountFields: [
      { id: "401kMatch", label: "401(k) Employer Match", placeholder: "예: 4%" },
      { id: "iraType", label: "IRA 유형", placeholder: "Traditional / Roth" },
    ],
    excludedProducts: ["한국 ISA", "일본 NISA"],
  },
  {
    code: "GBR",
    label: "영국",
    flag: "🇬🇧",
    currency: "GBP",
    currencySymbol: "£",
    taxAccounts: ["Stocks & Shares ISA", "LISA", "SIPP", "GIA"],
    brokers: ["Hargreaves Lansdown", "Trading 212", "Freetrade", "Vanguard UK"],
    publicPension: "State Pension",
    defaultRetirementAge: 66,
    extraAccountFields: [
      { id: "isaAllowance", label: "ISA Annual Allowance Used", placeholder: "£20,000 한도 대비" },
    ],
    excludedProducts: ["한국 ISA", "401(k)"],
  },
  {
    code: "SGP",
    label: "싱가포르",
    flag: "🇸🇬",
    currency: "SGD",
    currencySymbol: "S$",
    taxAccounts: ["CPF (OA/SA/MA)", "SRS"],
    brokers: ["DBS Vickers", "OCBC Securities", "Tiger Brokers", "Interactive Brokers"],
    publicPension: "CPF Life",
    defaultRetirementAge: 65,
    extraAccountFields: [
      { id: "cpfBalance", label: "CPF OA/SA 잔액", placeholder: "선택 입력" },
      { id: "srsLimit", label: "SRS 잔여 한도", placeholder: "연간 한도 대비" },
    ],
    excludedProducts: ["한국 ISA", "일본 NISA", "401(k)"],
  },
];

export function getCountryPack(code: string): CountryPack | null {
  if (!code) return null;
  return COUNTRIES.find((c) => c.code === code) ?? COUNTRIES[0];
}

export function formatPromptPayload(user: User, data: InvestmentFormData): string {
  const pack = getCountryPack(user.countryCode);
  if (!pack) return "# 회원 국적 정보가 없습니다.";
  const ageLine = formatAgeDisplay(user.birthYear, user.countryCode);
  const lines: string[] = [
    "# 통합 투자·노후 설계 — 사용자 입력",
    "",
    "[회원 프로필]",
    `- 이름: ${user.name}`,
    `- 이메일: ${user.email}`,
    "",
    "[국적·거주]",
    `- 국적·세법 기준: ${pack.flag} ${pack.label} (${pack.code})`,
    `- 거주지: ${user.residence || pack.label + " 거주 가정"}`,
    `- 출생연도 / 나이: ${ageLine}${user.gender ? ` / ${user.gender}` : ""}`,
    "",
    `[재무 — ${pack.currency}]`,
    `- 현재 투자 가능 자산: ${data.assets || "미입력"}`,
    `- 월 적립 가능액: ${data.monthlyContribution || "미입력"}`,
    `- 은퇴 희망 나이: ${data.retirementAge || "미입력"}`,
    `- 은퇴 후 월 필요 생활비: ${data.monthlyExpense || "미입력"}`,
    `- 공적·사적 연금 예상 (${pack.publicPension}): ${data.pensionEstimate || "미입력"}`,
    "",
    "[계좌·플랫폼]",
    `- 보유 계좌: ${data.accounts.length ? data.accounts.join(", ") : "미입력"}`,
    `- 잔여 한도: ${data.accountLimits || "미입력"}`,
    `- 선호·사용 증권사/앱: ${data.preferredBroker || "미입력"}`,
  ];

  for (const field of pack.extraAccountFields) {
    const val = data.extraFields[field.id];
    if (val) lines.push(`- ${field.label}: ${val}`);
  }

  lines.push(
    "",
    "[투자]",
    `- 위험 성향: ${data.riskProfile || "미입력"}`,
    `- 해외 비중 목표: ${data.foreignWeight || "미입력"}%`,
    `- 금: ${data.allowGold ? "허용" : "비허용"}`,
    `- 은: ${data.allowSilver ? "허용" : "비허용"}`,
    `- BTC: ${data.allowBtc ? `허용 (상한 ${data.btcCap}%)` : "비허용"}`,
    `- 환전/FX: ${data.fxPreference || "미입력"}`,
  );

  if (pack.code === "KOR") {
    lines.push(`- 금융소득 종합과세: ${data.comprehensiveTax || "미입력"}`);
  }

  lines.push(
    "",
    "[Reference Pack]",
    `- 절세계좌: ${pack.taxAccounts.join(", ")}`,
    `- 추천 브로커: ${pack.brokers.join(", ")}`,
    `- 제외(해당 없음): ${pack.excludedProducts.join(", ")}`,
    "",
    `> 기준일: ${new Date().toISOString().slice(0, 10)} | ${pack.code} Reference Pack | 투자 참고용`,
  );

  return lines.join("\n");
}
