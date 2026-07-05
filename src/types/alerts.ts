export type AlertType = "price_above" | "price_below" | "rebalance";

export interface PriceAlert {
  id: string;
  type: "price_above" | "price_below";
  symbol: string;
  localCode: string;
  name: string;
  targetPrice: number;
  currency: string;
  createdAt: string;
  triggeredAt?: string;
  active: boolean;
}

export interface RebalanceAlert {
  id: string;
  type: "rebalance";
  title: string;
  dueDate: string;
  note: string;
  createdAt: string;
  triggeredAt?: string;
  active: boolean;
}

export type InvestmentAlert = PriceAlert | RebalanceAlert;

export interface AlertTrigger {
  alert: InvestmentAlert;
  message: string;
  currentPrice?: number;
  triggeredAt: string;
}
