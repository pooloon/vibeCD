export type CountryCode = "KOR" | "JPN" | "USA" | "GBR" | "SGP";

export type Gender = "" | "male" | "female" | "other";

export interface CountryPack {
  code: CountryCode;
  label: string;
  flag: string;
  currency: string;
  currencySymbol: string;
  taxAccounts: string[];
  brokers: string[];
  publicPension: string;
  defaultRetirementAge: number;
  extraAccountFields: { id: string; label: string; placeholder?: string }[];
  excludedProducts: string[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  countryCode: CountryCode;
  birthYear: string;
  gender: Gender;
  residence: string;
  createdAt: string;
}

export interface InvestmentFormData {
  assets: string;
  monthlyContribution: string;
  retirementAge: string;
  monthlyExpense: string;
  pensionEstimate: string;
  accounts: string[];
  accountLimits: string;
  preferredBroker: string;
  riskProfile: "" | "conservative" | "moderate" | "aggressive";
  foreignWeight: string;
  allowGold: boolean;
  allowSilver: boolean;
  allowBtc: boolean;
  btcCap: string;
  fxPreference: "" | "local-dca" | "usd-dca" | "hedged-etf";
  comprehensiveTax: "" | "yes" | "no" | "unknown";
  extraFields: Record<string, string>;
}

export const DEFAULT_INVESTMENT_FORM: InvestmentFormData = {
  assets: "",
  monthlyContribution: "",
  retirementAge: "",
  monthlyExpense: "",
  pensionEstimate: "",
  accounts: [],
  accountLimits: "",
  preferredBroker: "",
  riskProfile: "",
  foreignWeight: "30",
  allowGold: true,
  allowSilver: false,
  allowBtc: false,
  btcCap: "3",
  fxPreference: "",
  comprehensiveTax: "",
  extraFields: {},
};

export type AuthView = "login" | "signup";
