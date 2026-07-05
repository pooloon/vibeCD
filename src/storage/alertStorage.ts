import type { InvestmentAlert, AlertTrigger } from "../types/alerts";
import type { QuoteSnapshot } from "../types/market";

const ALERTS_KEY = "iip_alerts";
const TRIGGERS_KEY = "iip_alert_triggers";

export function loadAlerts(): InvestmentAlert[] {
  try {
    const raw = localStorage.getItem(ALERTS_KEY);
    return raw ? (JSON.parse(raw) as InvestmentAlert[]) : [];
  } catch {
    return [];
  }
}

export function saveAlerts(alerts: InvestmentAlert[]): void {
  localStorage.setItem(ALERTS_KEY, JSON.stringify(alerts));
}

export function addAlert(alert: InvestmentAlert): void {
  const alerts = loadAlerts();
  alerts.push(alert);
  saveAlerts(alerts);
}

export function removeAlert(id: string): void {
  saveAlerts(loadAlerts().filter((a) => a.id !== id));
}

export function updateAlert(id: string, patch: Partial<InvestmentAlert>): void {
  saveAlerts(
    loadAlerts().map((a) => (a.id === id ? ({ ...a, ...patch } as InvestmentAlert) : a)),
  );
}

export function loadRecentTriggers(): AlertTrigger[] {
  try {
    const raw = localStorage.getItem(TRIGGERS_KEY);
    return raw ? (JSON.parse(raw) as AlertTrigger[]) : [];
  } catch {
    return [];
  }
}

function saveTriggers(triggers: AlertTrigger[]): void {
  localStorage.setItem(TRIGGERS_KEY, JSON.stringify(triggers.slice(0, 50)));
}

export function checkAlerts(
  alerts: InvestmentAlert[],
  quotes: Map<string, QuoteSnapshot>,
): AlertTrigger[] {
  const now = new Date().toISOString();
  const today = now.slice(0, 10);
  const newTriggers: AlertTrigger[] = [];

  for (const alert of alerts) {
    if (!alert.active || alert.triggeredAt) continue;

    if (alert.type === "rebalance") {
      if (alert.dueDate <= today) {
        newTriggers.push({
          alert,
          message: `리밸런싱 예정: ${alert.title}`,
          triggeredAt: now,
        });
        updateAlert(alert.id, { triggeredAt: now, active: false });
      }
      continue;
    }

    const quote = quotes.get(alert.symbol);
    const price = quote?.price;
    if (price == null) continue;

    const hit =
      alert.type === "price_above" ? price >= alert.targetPrice : price <= alert.targetPrice;

    if (hit) {
      const dir = alert.type === "price_above" ? "이상" : "이하";
      newTriggers.push({
        alert,
        message: `${alert.name}(${alert.localCode}) — ${alert.targetPrice.toLocaleString()} ${dir} 도달 (현재 ${price.toLocaleString()})`,
        currentPrice: price,
        triggeredAt: now,
      });
      updateAlert(alert.id, { triggeredAt: now, active: false });
    }
  }

  if (newTriggers.length > 0) {
    saveTriggers([...newTriggers, ...loadRecentTriggers()]);
  }

  return newTriggers;
}

export function requestNotificationPermission(): void {
  if ("Notification" in window && Notification.permission === "default") {
    void Notification.requestPermission();
  }
}

export function showBrowserNotification(title: string, body: string): void {
  if ("Notification" in window && Notification.permission === "granted") {
    new Notification(title, { body });
  }
}
