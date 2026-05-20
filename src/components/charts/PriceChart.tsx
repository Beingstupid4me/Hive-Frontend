"use client";

import { cn } from "@/lib/utils";

interface PriceChartProps {
  data: { time: string; open: number; high: number; low: number; close: number; volume: number }[];
  className?: string;
}

export function PriceChart({ data, className }: PriceChartProps) {
  const normalizedData = data
    .map((row) => ({
      time: row.time,
      open: Number(row.open),
      high: Number(row.high),
      low: Number(row.low),
      close: Number(row.close),
      volume: Number(row.volume),
    }))
    .filter(
      (row) =>
        Number.isFinite(row.open) &&
        Number.isFinite(row.high) &&
        Number.isFinite(row.low) &&
        Number.isFinite(row.close),
    );

  if (normalizedData.length === 0) {
    return (
      <div className={cn("relative h-[300px] rounded-lg border border-border bg-surface/30", className)}>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs text-text-tertiary text-mono">No candle data available</span>
        </div>
      </div>
    );
  }

  const w = 600;
  const h = 300;
  const padL = 60;
  const padR = 10;
  const padT = 10;
  const padB = 30;
  const plotW = w - padL - padR;
  const plotH = h - padT - padB;

  const prices = normalizedData.flatMap((d) => [d.high, d.low]);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const rawRange = maxPrice - minPrice;
  const range = Number.isFinite(rawRange) && rawRange > 0 ? rawRange : 1;

  const barW = plotW / Math.max(normalizedData.length, 1);

  const toY = (price: number) => padT + plotH - ((price - minPrice) / range) * plotH;

  const lastCandle = normalizedData[normalizedData.length - 1];
  const lastClose = lastCandle?.close ?? 0;

  return (
    <div className={cn("relative", className)}>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto">
        {/* Grid */}
        {[0, 0.25, 0.5, 0.75, 1].map((f) => {
          const y = padT + f * plotH;
          const price = maxPrice - f * range;
          return (
            <g key={f}>
              <line x1={padL} y1={y} x2={padL + plotW} y2={y} stroke="rgba(255,255,255,0.04)" />
              <text x={padL - 8} y={y + 3} textAnchor="end" fill="var(--text-caption)" fontSize={9} fontFamily="var(--font-mono)">
                {price.toFixed(0)}
              </text>
            </g>
          );
        })}

        {/* Candlesticks */}
        {normalizedData.map((d, i) => {
          const x = padL + i * barW + barW / 2;
          const bullish = d.close >= d.open;
          const color = bullish ? "#00f6ff" : "#ff00ff";
          const bodyTop = toY(Math.max(d.open, d.close));
          const bodyBot = toY(Math.min(d.open, d.close));
          const bodyH = Math.max(bodyBot - bodyTop, 1);

          return (
            <g key={i}>
              {/* Wick */}
              <line x1={x} y1={toY(d.high)} x2={x} y2={toY(d.low)} stroke={color} strokeWidth={1} opacity={0.6} />
              {/* Body */}
              <rect x={x - barW * 0.3} y={bodyTop} width={barW * 0.6} height={bodyH} fill={color} opacity={bullish ? 0.8 : 0.6} rx={1} />
            </g>
          );
        })}

        {/* Current price line */}
        <line x1={padL} y1={toY(lastClose)} x2={padL + plotW} y2={toY(lastClose)} stroke="var(--accent-primary)" strokeWidth={1} strokeDasharray="4 2" opacity={0.5} />
        <rect x={padL + plotW - 60} y={toY(lastClose) - 10} width={60} height={20} rx={4} fill="var(--accent-primary)" />
        <text x={padL + plotW - 30} y={toY(lastClose) + 4} textAnchor="middle" fill="var(--surface-bg)" fontSize={10} fontFamily="var(--font-mono)" fontWeight="bold">
          {lastClose.toFixed(0)}
        </text>

        {/* X-axis labels */}
        {normalizedData
          .map((d, i) => ({ d, i }))
          .filter(({ i }) => i % 10 === 0)
          .map(({ d, i }) => {
          const x = padL + i * barW + barW / 2;
          return (
            <text key={i} x={x} y={h - 6} textAnchor="middle" fill="var(--text-caption)" fontSize={9} fontFamily="var(--font-mono)">
              {d.time}
            </text>
          );
        })}
      </svg>
    </div>
  );
}
