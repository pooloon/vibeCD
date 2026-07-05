import type { CountryCode } from "../types";

const CURRENT_YEAR = new Date().getFullYear();
const MIN_AGE = 18;
const MAX_AGE = 100;

export interface BirthYearOption {
  year: number;
  age: number;
  label: string;
}

function formatBirthYearLabel(countryCode: CountryCode, year: number, age: number): string {
  switch (countryCode) {
    case "KOR":
      return `${year}년생 (만 ${age}세)`;
    case "JPN":
      return `${year}年 (${age}歳)`;
    case "USA":
    case "GBR":
    case "SGP":
      return `${year} (Age ${age})`;
  }
}

export function getBirthYearPlaceholder(countryCode: CountryCode): string {
  switch (countryCode) {
    case "KOR":
      return "출생연도 선택";
    case "JPN":
      return "生年を選択";
    case "USA":
    case "GBR":
    case "SGP":
      return "Select year of birth";
  }
}

export function getBirthYearFieldLabel(countryCode: CountryCode): string {
  switch (countryCode) {
    case "KOR":
      return "출생연도";
    case "JPN":
      return "生年";
    case "USA":
    case "GBR":
    case "SGP":
      return "Year of birth";
  }
}

export function getBirthYearHint(countryCode: CountryCode): string {
  switch (countryCode) {
    case "KOR":
      return "만 나이 · 올해(2026) 기준";
    case "JPN":
      return "満年齢 · 2026年基準";
    case "USA":
    case "GBR":
    case "SGP":
      return `Age as of ${CURRENT_YEAR}`;
  }
}

export function getBirthYearOptions(
  countryCode: CountryCode,
  referenceYear = CURRENT_YEAR,
): BirthYearOption[] {
  const options: BirthYearOption[] = [];
  const minYear = referenceYear - MAX_AGE;
  const maxYear = referenceYear - MIN_AGE;

  for (let year = maxYear; year >= minYear; year -= 1) {
    const age = referenceYear - year;
    options.push({
      year,
      age,
      label: formatBirthYearLabel(countryCode, year, age),
    });
  }

  return options;
}

export function calcAgeFromBirthYear(
  birthYear: string,
  referenceYear = CURRENT_YEAR,
): number | null {
  const year = Number.parseInt(birthYear, 10);
  if (!Number.isFinite(year) || year < referenceYear - MAX_AGE || year > referenceYear - MIN_AGE) {
    return null;
  }
  return referenceYear - year;
}

export function formatAgeDisplay(
  birthYear: string,
  countryCode?: CountryCode | "",
): string {
  const age = calcAgeFromBirthYear(birthYear);
  if (age === null) return "나이 미입력";

  switch (countryCode) {
    case "JPN":
      return `${age}歳 (${birthYear}年)`;
    case "USA":
    case "GBR":
    case "SGP":
      return `Age ${age} (born ${birthYear})`;
    case "KOR":
    default:
      return `만 ${age}세 (${birthYear}년생)`;
  }
}
