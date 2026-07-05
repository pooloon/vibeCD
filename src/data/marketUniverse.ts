import type { CountryCode } from "../types";
import type { AssetClass, Exchange, MarketInstrument } from "../types/market";

const instrument = (
  symbol: string,
  localCode: string,
  name: string,
  nameEn: string,
  assetClass: AssetClass,
  exchange: Exchange,
  countryCodes: CountryCode[],
  sector: string,
  themes: string[],
): MarketInstrument => ({
  symbol,
  localCode,
  name,
  nameEn,
  assetClass,
  exchange,
  countryCodes,
  sector,
  themes,
});

export const MARKET_UNIVERSE: MarketInstrument[] = [
  // 🇰🇷 Korea
  instrument("005930.KS", "005930", "삼성전자", "Samsung Electronics", "stock", "KRX", ["KOR"], "Technology", ["반도체", "AI", "메모리"]),
  instrument("000660.KS", "000660", "SK하이닉스", "SK Hynix", "stock", "KRX", ["KOR"], "Technology", ["HBM", "반도체"]),
  instrument("035420.KS", "035420", "NAVER", "NAVER", "stock", "KRX", ["KOR"], "Communication", ["플랫폼", "AI"]),
  instrument("035720.KS", "035720", "카카오", "Kakao", "stock", "KRX", ["KOR"], "Communication", ["플랫폼", "규제"]),
  instrument("069500.KS", "069500", "KODEX 200", "KODEX KOSPI 200", "etf", "KRX", ["KOR"], "Broad Market", ["국내 대형주", "코어"]),
  instrument("102110.KS", "102110", "TIGER 200", "TIGER KOSPI 200", "etf", "KRX", ["KOR"], "Broad Market", ["국내 대형주"]),
  instrument("360750.KS", "360750", "TIGER 미국S&P500", "TIGER S&P500", "etf", "KRX", ["KOR"], "Global Equity", ["미국", "환헤지"]),
  instrument("143850.KS", "143850", "TIGER 미국나스닥100", "TIGER Nasdaq100", "etf", "KRX", ["KOR"], "Global Equity", ["미국 성장"]),
  instrument("114260.KS", "114260", "KODEX 국고채3년", "KODEX KR Treasury 3Y", "bond", "KRX", ["KOR"], "Fixed Income", ["금리", "안정"]),
  instrument("132030.KS", "132030", "KODEX 골드선물(H)", "KODEX Gold Futures", "commodity", "KRX", ["KOR"], "Commodity", ["인플레", "헤지"]),
  instrument("091160.KS", "091160", "KODEX 반도체", "KODEX Semiconductor", "etf", "KRX", ["KOR"], "Technology", ["반도체 사이클"]),
  instrument("251340.KS", "251340", "KODEX 코스닥150", "KODEX KOSDAQ150", "etf", "KRX", ["KOR"], "Broad Market", ["중소형 성장"]),
  instrument("373220.KS", "373220", "LG에너지솔루션", "LG Energy Solution", "stock", "KRX", ["KOR"], "Industrial", ["2차전지", "EV"]),
  instrument("005380.KS", "005380", "현대차", "Hyundai Motor", "stock", "KRX", ["KOR"], "Consumer", ["자동차", "EV"]),
  instrument("207940.KS", "207940", "삼성바이오", "Samsung Biologics", "stock", "KRX", ["KOR"], "Healthcare", ["바이오"]),
  instrument("068270.KS", "068270", "셀트리온", "Celltrion", "stock", "KRX", ["KOR"], "Healthcare", ["바이오"]),
  instrument("259960.KS", "259960", "크래프톤", "Krafton", "stock", "KRX", ["KOR"], "Communication", ["게임"]),
  instrument("105560.KS", "105560", "KB금융", "KB Financial", "stock", "KRX", ["KOR"], "Financial", ["금융", "배당"]),
  instrument("329650.KS", "329650", "KODEX TRF3070", "KODEX TRF3070", "etf", "KRX", ["KOR"], "Fixed Income", ["TDF", "은퇴"]),

  // 🇺🇸 USA
  instrument("SPY", "SPY", "SPDR S&P 500", "SPDR S&P 500", "etf", "NYSE", ["USA", "KOR", "SGP", "GBR"], "Broad Market", ["미국 코어"]),
  instrument("VTI", "VTI", "Vanguard Total Stock", "Vanguard Total Stock", "etf", "NYSE", ["USA"], "Broad Market", ["미국 전체"]),
  instrument("QQQ", "QQQ", "Invesco QQQ", "Invesco QQQ", "etf", "NASDAQ", ["USA"], "Technology", ["나스닥 성장"]),
  instrument("TLT", "TLT", "iShares 20+ Treasury", "iShares 20+ Treasury", "bond", "NASDAQ", ["USA"], "Fixed Income", ["장기 금리"]),
  instrument("BND", "BND", "Vanguard Total Bond", "Vanguard Total Bond", "bond", "NASDAQ", ["USA"], "Fixed Income", ["채권 코어"]),
  instrument("AAPL", "AAPL", "Apple", "Apple", "stock", "NASDAQ", ["USA"], "Technology", ["생태계", "AI"]),
  instrument("MSFT", "MSFT", "Microsoft", "Microsoft", "stock", "NASDAQ", ["USA"], "Technology", ["클라우드", "AI"]),
  instrument("NVDA", "NVDA", "NVIDIA", "NVIDIA", "stock", "NASDAQ", ["USA"], "Technology", ["AI", "밸류에이션"]),
  instrument("VOO", "VOO", "Vanguard S&P 500", "Vanguard S&P 500", "etf", "NYSE", ["USA"], "Broad Market", ["저비용"]),
  instrument("GLD", "GLD", "SPDR Gold Shares", "SPDR Gold", "commodity", "NYSE", ["USA", "GBR"], "Commodity", ["금", "헤지"]),
  instrument("GOOGL", "GOOGL", "Alphabet", "Alphabet", "stock", "NASDAQ", ["USA"], "Communication", ["AI", "광고"]),
  instrument("AMZN", "AMZN", "Amazon", "Amazon", "stock", "NASDAQ", ["USA"], "Consumer", ["클라우드", "AI"]),
  instrument("META", "META", "Meta", "Meta Platforms", "stock", "NASDAQ", ["USA"], "Communication", ["AI", "메타버스"]),
  instrument("BRK-B", "BRK-B", "Berkshire Hathaway", "Berkshire", "stock", "NYSE", ["USA"], "Financial", ["가치", "배당"]),
  instrument("JPM", "JPM", "JPMorgan", "JPMorgan Chase", "stock", "NYSE", ["USA"], "Financial", ["금융", "금리"]),
  instrument("V", "V", "Visa", "Visa", "stock", "NYSE", ["USA"], "Financial", ["핀테크"]),
  instrument("IEMG", "IEMG", "iShares EM ETF", "iShares EM", "etf", "NYSE", ["USA", "SGP"], "Global Equity", ["신흥국"]),

  // 🇯🇵 Japan
  instrument("1320.T", "1320", "NEXT FUNDS 日経225", "Nikkei 225 ETF", "etf", "TSE", ["JPN"], "Broad Market", ["일본 대형주"]),
  instrument("2558.T", "2558", "MAXIS 全世界株式", "MAXIS Global Equity", "etf", "TSE", ["JPN"], "Global Equity", ["全世界"]),
  instrument("7203.T", "7203", "トヨタ自動車", "Toyota", "stock", "TSE", ["JPN"], "Consumer", ["자동차", "환율"]),
  instrument("6758.T", "6758", "ソニーグループ", "Sony Group", "stock", "TSE", ["JPN"], "Technology", ["엔터", "반도체"]),
  instrument("1540.T", "1540", "純金上場信託", "Gold Trust", "commodity", "TSE", ["JPN"], "Commodity", ["금"]),
  instrument("2512.T", "2512", "ニッセイ外国株式", "Nissay Foreign Equity", "etf", "TSE", ["JPN"], "Global Equity", ["海外株"]),
  instrument("8306.T", "8306", "三菱UFJ", "MUFG", "stock", "TSE", ["JPN"], "Financial", ["금융", "금리"]),
  instrument("9432.T", "9432", "NTT", "NTT", "stock", "TSE", ["JPN"], "Communication", ["배당", "통신"]),
  instrument("6861.T", "6861", "キーエンス", "Keyence", "stock", "TSE", ["JPN"], "Technology", ["성장"]),

  // 🇬🇧 UK
  instrument("VUSA.L", "VUSA", "Vanguard S&P 500 UCITS", "Vanguard S&P500", "etf", "LSE", ["GBR"], "Global Equity", ["미국"]),
  instrument("VWRL.L", "VWRL", "Vanguard FTSE All-World", "Vanguard All-World", "etf", "LSE", ["GBR"], "Global Equity", ["글로벌"]),
  instrument("SGLN.L", "SGLN", "iShares Physical Gold", "iShares Gold", "commodity", "LSE", ["GBR"], "Commodity", ["금"]),

  // 🇸🇬 Singapore
  instrument("ES3.SI", "ES3", "SPDR Straits Times", "STI ETF", "etf", "SGX", ["SGP"], "Broad Market", ["싱가포르"]),
  instrument("A35.SI", "A35", "ABF SG Bond Index", "SG Bond ETF", "bond", "SGX", ["SGP"], "Fixed Income", ["채권"]),
];

export function getInstrumentsForCountry(countryCode: CountryCode): MarketInstrument[] {
  return MARKET_UNIVERSE.filter((i) => i.countryCodes.includes(countryCode));
}

export function getInstrumentsBySymbols(symbols: string[]): MarketInstrument[] {
  const set = new Set(symbols);
  return MARKET_UNIVERSE.filter((i) => set.has(i.symbol));
}

export function filterInstruments(
  instruments: MarketInstrument[],
  query: string,
  assetClass: import("../types/market").AssetClass | "all" = "all",
): MarketInstrument[] {
  const q = query.trim().toLowerCase();
  return instruments.filter((i) => {
    if (assetClass !== "all" && i.assetClass !== assetClass) return false;
    if (!q) return true;
    return (
      i.name.toLowerCase().includes(q) ||
      i.nameEn.toLowerCase().includes(q) ||
      i.localCode.toLowerCase().includes(q) ||
      i.symbol.toLowerCase().includes(q) ||
      i.sector.toLowerCase().includes(q) ||
      i.themes.some((t) => t.toLowerCase().includes(q))
    );
  });
}
