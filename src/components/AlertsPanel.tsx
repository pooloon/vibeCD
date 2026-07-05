import { useCallback, useEffect, useState } from "react";
import {
  addAlert,
  checkAlerts,
  loadAlerts,
  loadRecentTriggers,
  removeAlert,
  requestNotificationPermission,
  showBrowserNotification,
} from "../storage/alertStorage";
import type { InvestmentAlert, PriceAlert, RebalanceAlert } from "../types/alerts";
import type { QuoteSnapshot } from "../types/market";

interface AlertsPanelProps {
  quotes: Map<string, QuoteSnapshot>;
  prefill?: { symbol: string; name: string; localCode: string; targetPrice?: number } | null;
  onClearPrefill?: () => void;
  onNavigateMarket?: () => void;
}

export default function AlertsPanel({
  quotes,
  prefill,
  onClearPrefill,
  onNavigateMarket,
}: AlertsPanelProps) {
  const [alerts, setAlerts] = useState<InvestmentAlert[]>(() => loadAlerts());
  const [triggers, setTriggers] = useState(() => loadRecentTriggers());
  const [localCode, setLocalCode] = useState("");
  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [targetPrice, setTargetPrice] = useState("");
  const [alertType, setAlertType] = useState<"price_above" | "price_below">("price_above");
  const [rebalanceTitle, setRebalanceTitle] = useState("분기 리밸런싱");
  const [rebalanceDate, setRebalanceDate] = useState("");

  useEffect(() => {
    if (!prefill) return;
    setSymbol(prefill.symbol);
    setLocalCode(prefill.localCode);
    setName(prefill.name);
    if (prefill.targetPrice) setTargetPrice(String(prefill.targetPrice));
    onClearPrefill?.();
  }, [prefill, onClearPrefill]);

  const refresh = useCallback(() => {
    setAlerts(loadAlerts());
    setTriggers(loadRecentTriggers());
  }, []);

  useEffect(() => {
    requestNotificationPermission();
    const hits = checkAlerts(loadAlerts(), quotes);
    if (hits.length > 0) {
      for (const h of hits) {
        showBrowserNotification("투자 알림", h.message);
      }
      refresh();
    }
  }, [quotes, refresh]);

  useEffect(() => {
    const id = window.setInterval(() => {
      const hits = checkAlerts(loadAlerts(), quotes);
      if (hits.length > 0) {
        for (const h of hits) {
          showBrowserNotification("투자 알림", h.message);
        }
        refresh();
      }
    }, 60_000);
    return () => window.clearInterval(id);
  }, [quotes, refresh]);

  const addPriceAlert = () => {
    if (!symbol || !localCode || !targetPrice) return;
    const alert: PriceAlert = {
      id: crypto.randomUUID(),
      type: alertType,
      symbol,
      localCode,
      name: name || localCode,
      targetPrice: Number(targetPrice),
      currency: "KRW",
      createdAt: new Date().toISOString(),
      active: true,
    };
    addAlert(alert);
    refresh();
    setTargetPrice("");
  };

  const addRebalance = () => {
    if (!rebalanceDate) return;
    const alert: RebalanceAlert = {
      id: crypto.randomUUID(),
      type: "rebalance",
      title: rebalanceTitle,
      dueDate: rebalanceDate,
      note: "포트폴리오 비중 점검",
      createdAt: new Date().toISOString(),
      active: true,
    };
    addAlert(alert);
    refresh();
  };

  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <h2>알림 · 목표가 · 리밸런싱</h2>
          <p className="panel-desc">
            목표가 도달·리밸런싱 일정 알림 (브라우저 알림 · 1분 주기 점검)
          </p>
        </div>
        {onNavigateMarket ? (
          <button type="button" className="btn btn-sm" onClick={onNavigateMarket}>
            시장에서 종목 선택
          </button>
        ) : null}
      </div>

      {triggers.length > 0 ? (
        <div className="trigger-banner">
          <h3 className="sub-heading">최근 트리거</h3>
          <ul className="disclosure-list">
            {triggers.slice(0, 5).map((t, i) => (
              <li key={`${t.triggeredAt}-${i}`}>
                <span className="disclosure-date">{t.triggeredAt.slice(0, 16).replace("T", " ")}</span>
                {t.message}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <h3 className="sub-heading">목표가 알림 추가</h3>
      <div className="field-row">
        <div className="field">
          <label htmlFor="alert-symbol">심볼 (Yahoo)</label>
          <input id="alert-symbol" value={symbol} onChange={(e) => setSymbol(e.target.value)} placeholder="005930.KS" />
        </div>
        <div className="field">
          <label htmlFor="alert-code">종목코드</label>
          <input id="alert-code" value={localCode} onChange={(e) => setLocalCode(e.target.value)} placeholder="005930" />
        </div>
        <div className="field">
          <label htmlFor="alert-name">종목명</label>
          <input id="alert-name" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
      </div>
      <div className="field-row">
        <div className="field">
          <label htmlFor="alert-type">조건</label>
          <select id="alert-type" value={alertType} onChange={(e) => setAlertType(e.target.value as typeof alertType)}>
            <option value="price_above">목표가 이상</option>
            <option value="price_below">목표가 이하</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="alert-price">목표가</label>
          <input id="alert-price" type="number" value={targetPrice} onChange={(e) => setTargetPrice(e.target.value)} />
        </div>
        <button type="button" className="btn primary" onClick={addPriceAlert}>
          추가
        </button>
      </div>

      <h3 className="sub-heading">리밸런싱 알림</h3>
      <div className="field-row">
        <div className="field">
          <label htmlFor="rb-title">제목</label>
          <input id="rb-title" value={rebalanceTitle} onChange={(e) => setRebalanceTitle(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="rb-date">예정일</label>
          <input id="rb-date" type="date" value={rebalanceDate} onChange={(e) => setRebalanceDate(e.target.value)} />
        </div>
        <button type="button" className="btn primary" onClick={addRebalance}>
          추가
        </button>
      </div>

      <h3 className="sub-heading">활성 알림 ({alerts.filter((a) => a.active).length})</h3>
      <ul className="alert-list">
        {alerts.length === 0 ? (
          <li className="meta-line">등록된 알림 없음</li>
        ) : (
          alerts.map((a) => (
            <li key={a.id} className={a.active ? "" : "muted"}>
              {a.type === "rebalance" ? (
                <span>
                  📅 {a.title} — {a.dueDate}
                  {!a.active ? " (완료)" : ""}
                </span>
              ) : (
                <span>
                  {a.name} ({a.localCode}) — {a.type === "price_above" ? "≥" : "≤"}{" "}
                  {a.targetPrice.toLocaleString()}
                  {!a.active ? " (트리거됨)" : ""}
                </span>
              )}
              <button type="button" className="link-btn" onClick={() => { removeAlert(a.id); refresh(); }}>
                삭제
              </button>
            </li>
          ))
        )}
      </ul>
    </section>
  );
}
