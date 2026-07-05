# Market Universe (확장형)

Yahoo Finance 심볼: KRX `.KS`/`.KQ`, TSE `.T`, US 무접미사.

## 🇰🇷 KOR — KRX Open API + Open DART

- **KRX** (`data.krx.co.kr`): KOSPI+KOSDAQ 전 종목·종가·등락·시총 (앱: 시장·시세 탭)
- **Open DART** (`opendart.fss.or.kr`): corpCode.xml → 종목코드↔corp_code, list.json 공시
- API 키: `.env` `VITE_DART_API_KEY` 또는 앱 재무·설정 탭

## Curated universe (전략·백테스트)

| 코드 | 명칭 | 유형 |
|------|------|------|--------|
| 005930.KS | 삼성전자 | 주식 | KOSPI |
| 000660.KS | SK하이닉스 | 주식 | KOSPI |
| 035420.KS | NAVER | 주식 | KOSPI |
| 069500.KS | KODEX 200 | ETF | KRX |
| 102110.KS | TIGER 200 | ETF | KRX |
| 360750.KS | TIGER 미국S&P500 | ETF | KRX |
| 143850.KS | TIGER 미국나스닥100 | ETF | KRX |
| 114260.KS | KODEX 국고채3년 | 채권ETF | KRX |
| 132030.KS | KODEX 골드선물(H) | 원자재ETF | KRX |

## 🇺🇸 USA

| 코드 | 명칭 | 유형 |
|------|------|------|
| SPY | SPDR S&P 500 | ETF |
| VTI | Vanguard Total Stock | ETF |
| QQQ | Invesco QQQ | ETF |
| TLT | iShares 20+ Year Treasury | 채권ETF |
| BND | Vanguard Total Bond | 채권ETF |
| AAPL | Apple | 주식 |
| MSFT | Microsoft | 주식 |
| NVDA | NVIDIA | 주식 |

## 🇯🇵 JPN

| 코드 | 명칭 | 유형 |
|------|------|------|
| 1320.T | NEXT FUNDS 日経225 | ETF |
| 2558.T | MAXIS 全世界株式 | ETF |
| 7203.T | トヨタ | 주식 |
| 1540.T | 純金上場信託 | ETF |

전 종목 DB는 `src/data/marketUniverse.ts`에서 국가·자산군별 필터.
