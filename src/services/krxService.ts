import type { KrxListedStock, KrxLoadResult } from "../types/krxDart";
import type { MarketInstrument } from "../types/market";

interface KrxRow {
  ISU_SRT_CD?: string;
  ISU_ABBRV?: string;
  TDD_CLSPRC?: string;
  FLUC_RT?: string;
  MKTCAP?: string;
  ACC_TRDVOL?: string;
}

interface KrxResponse {
  OutBlock_1?: KrxRow[];
}

const KRX_BLD = "dbms/MDC/STAT/standard/MDCSTAT01501";

function formatYmd(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}${m}${day}`;
}

function parseNum(s: string | undefined): number | null {
  if (!s || s === "-" || s === "") return null;
  const n = Number(s.replace(/,/g, ""));
  return Number.isFinite(n) ? n : null;
}

async function fetchKrxMarket(
  mktId: "STK" | "KSQ",
  trdDd: string,
): Promise<KrxListedStock[]> {
  const body = new URLSearchParams({
    bld: KRX_BLD,
    locale: "ko_KR",
    mktId,
    trdDd,
    share: "1",
    money: "1",
    csvxls_isNo: "false",
  });

  const res = await fetch("/api/krx/comm/bldAttendant/getJsonData.cmd", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  if (!res.ok) throw new Error(`KRX API 오류 (${mktId})`);

  const json = (await res.json()) as KrxResponse;
  const market = mktId === "STK" ? "KOSPI" : "KOSDAQ";

  return (json.OutBlock_1 ?? [])
    .filter((row) => row.ISU_SRT_CD && row.ISU_ABBRV)
    .map((row) => ({
      code: row.ISU_SRT_CD!.padStart(6, "0"),
      name: row.ISU_ABBRV!,
      market,
      closePrice: parseNum(row.TDD_CLSPRC),
      changeRate: parseNum(row.FLUC_RT),
      marketCap: parseNum(row.MKTCAP),
      volume: parseNum(row.ACC_TRDVOL),
      tradingDate: trdDd,
    }));
}

async function fetchForDate(trdDd: string): Promise<KrxListedStock[]> {
  const [kospi, kosdaq] = await Promise.all([
    fetchKrxMarket("STK", trdDd),
    fetchKrxMarket("KSQ", trdDd),
  ]);
  return [...kospi, ...kosdaq];
}

export async function fetchKrxAllListed(maxLookbackDays = 10): Promise<KrxLoadResult> {
  const start = new Date();
  let lastError: Error | null = null;

  for (let i = 0; i < maxLookbackDays; i += 1) {
    const d = new Date(start);
    d.setDate(d.getDate() - i);
    const trdDd = formatYmd(d);
    try {
      const stocks = await fetchForDate(trdDd);
      if (stocks.length > 0) {
        return {
          stocks,
          tradingDate: trdDd,
          loadedAt: new Date().toISOString(),
        };
      }
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
    }
  }

  throw lastError ?? new Error("KRX 종목 목록을 불러오지 못했습니다.");
}

export function krxStockToInstrument(stock: KrxListedStock): MarketInstrument {
  const suffix = stock.market === "KOSDAQ" ? "KQ" : "KS";
  return {
    symbol: `${stock.code}.${suffix}`,
    localCode: stock.code,
    name: stock.name,
    nameEn: stock.name,
    assetClass: "stock",
    exchange: "KRX",
    countryCodes: ["KOR"],
    sector: stock.market,
    themes: ["KRX"],
  };
}

export function mergeKrxWithStaticEtfs(
  krxStocks: KrxListedStock[],
  staticInstruments: MarketInstrument[],
): MarketInstrument[] {
  const etfAndBonds = staticInstruments.filter((i) => i.assetClass !== "stock");
  const stockInstruments = krxStocks.map(krxStockToInstrument);
  const byCode = new Map<string, MarketInstrument>();

  for (const s of stockInstruments) byCode.set(s.localCode, s);
  for (const e of etfAndBonds) byCode.set(e.localCode, e);

  return [...byCode.values()];
}

const KRX_CACHE_KEY = "krx_universe_cache";
const KRX_CACHE_META_KEY = "krx_universe_meta";

export function loadKrxFromCache(): KrxLoadResult | null {
  try {
    const raw = localStorage.getItem(KRX_CACHE_KEY);
    const meta = localStorage.getItem(KRX_CACHE_META_KEY);
    if (!raw || !meta) return null;
    return {
      stocks: JSON.parse(raw) as KrxListedStock[],
      ...JSON.parse(meta),
    };
  } catch {
    return null;
  }
}

export function saveKrxToCache(result: KrxLoadResult): void {
  localStorage.setItem(KRX_CACHE_KEY, JSON.stringify(result.stocks));
  localStorage.setItem(
    KRX_CACHE_META_KEY,
    JSON.stringify({ tradingDate: result.tradingDate, loadedAt: result.loadedAt }),
  );
}
