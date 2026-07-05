---
name: integrated-investment-planning
description: Builds nationality-aware sequential stock/bond/ETF strategies with live quotes, issue scoring, and return scenarios. Use for 투자 전략, 종목 추천, 상장코드, 시세, PER, 순차 매수, 기대수익률, Security Engine, or integrated investment planning reports.
---

# 통합 투자 설계 v2 — Security Engine

## Core (이 순서로 실행)

1. **회원/국적** — Reference Pack (절세계좌·브로커·통화)
2. **유니버스** — 국적·나이·위험성향에 맞는 상장코드 후보 ([market-universe.md](market-universe.md))
3. **시세·지표** — 코드별 현재가·PER·배당·52주 (가능 범위)
4. **이슈·스코어** — 거시/섹터/밸류/리스크 → 미래가치 등급 (A~D)
5. **순차 전략** — Phase 1~4, 종목×비중×매수순서×계좌
6. **기대수익** — Bear/Base/Bull, 확률 가정 명시
7. **절세·면책**

## Sequential Strategy Template

```markdown
## 4. 순차 투자 전략
| 순서 | Phase | 기간 | 종목명 | 코드 | 비중 | 계좌 | 액션 |
| 1 | Core | 1~3월 | ... | 069500.KS | 40% | ISA | 월 DCA |
...
**Base case**: 연 X% · 20년 Y% (가정: ..., 확률 참고용)
```

## Issue Score (종목별)

- 거시(금리·FX·지정학) · 섹터 · 밸류(PER/52주) · 품질 · 규제
- 종합: A(우호)~D(회피) + 한 줄 근거

## Constraints

- 전 세계 전 종목 실시간 = 데이터 라이선스 한계 → 유니버스 확장 구조로 설명
- 수익 보장·확정 수익률 표현 금지
- 세후·비용·가정 라벨 필수

## Resources

- [market-universe.md](market-universe.md)
- [reference-packs.md](reference-packs.md)
