import type { PriceHistoryPoint } from "../types/krxDart";

interface PriceChartProps {
  points: PriceHistoryPoint[];
  width?: number;
  height?: number;
}

export default function PriceChart({ points, width = 560, height = 200 }: PriceChartProps) {
  if (points.length < 2) {
    return <p className="meta-line">차트 데이터 없음</p>;
  }

  const closes = points.map((p) => p.close);
  const min = Math.min(...closes);
  const max = Math.max(...closes);
  const pad = (max - min) * 0.05 || 1;

  const xScale = (i: number) => (i / (points.length - 1)) * width;
  const yScale = (v: number) => height - ((v - min + pad) / (max - min + pad * 2)) * height;

  const path = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${xScale(i).toFixed(1)} ${yScale(p.close).toFixed(1)}`)
    .join(" ");

  const first = points[0];
  const last = points[points.length - 1];
  const up = last.close >= first.close;

  return (
    <div className="price-chart-wrap">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="price-chart"
        role="img"
        aria-label="주가 차트"
      >
        <defs>
          <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={up ? "#34d399" : "#f87171"} stopOpacity="0.35" />
            <stop offset="100%" stopColor={up ? "#34d399" : "#f87171"} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d={`${path} L ${width} ${height} L 0 ${height} Z`}
          fill="url(#chartFill)"
        />
        <path d={path} fill="none" stroke={up ? "#34d399" : "#f87171"} strokeWidth="2" />
      </svg>
      <div className="chart-labels">
        <span>{first.date}</span>
        <span>{last.date}</span>
      </div>
    </div>
  );
}
