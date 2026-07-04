export function formatWon(amount: number): string {
  return `${amount.toLocaleString("ko-KR")}원`;
}

export function formatCompactWon(amount: number): string {
  if (amount >= 10000) {
    const man = amount / 10000;
    return man % 1 === 0 ? `${man}만` : `${man.toFixed(1)}만`;
  }
  if (amount === 0) return "0";
  return `${Math.round(amount / 1000)}천`;
}

export function pad2(value: number): string {
  return String(value).padStart(2, "0");
}

export function todayParts(): { year: number; month: number; day: number } {
  const now = new Date();
  return {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    day: now.getDate(),
  };
}
