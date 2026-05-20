"use client";

import { cn } from "@/lib/utils";

interface FrontierPoint {
  risk_pct: number;
  return_pct: number;
}

interface EfficientFrontierChartProps {
  className?: string;
  frontierPoints?: FrontierPoint[];
  optimalPoint?: FrontierPoint;
}

const fallbackFrontier: FrontierPoint[] = [
  { risk_pct: 6, return_pct: 4 },
  { risk_pct: 7, return_pct: 6 },
  { risk_pct: 8, return_pct: 8 },
  { risk_pct: 9.5, return_pct: 10 },
  { risk_pct: 11, return_pct: 11.5 },
  { risk_pct: 13, return_pct: 13 },
  { risk_pct: 16, return_pct: 14 },
  { risk_pct: 19, return_pct: 14.8 },
  { risk_pct: 23, return_pct: 15.2 },
  { risk_pct: 27, return_pct: 15 },
];

export function EfficientFrontierChart({ className, frontierPoints = [], optimalPoint }: EfficientFrontierChartProps) {
  const points = (frontierPoints.length > 0 ? frontierPoints : fallbackFrontier)
    .map((point) => ({ x: point.risk_pct, y: point.return_pct }))
    .sort((a, b) => a.x - b.x);

  const optimal = optimalPoint
    ? { x: optimalPoint.risk_pct, y: optimalPoint.return_pct }
    : points[Math.floor(points.length / 2)];

  const minXRaw = Math.min(...points.map((point) => point.x), optimal.x);
  const maxXRaw = Math.max(...points.map((point) => point.x), optimal.x);
  const minYRaw = Math.min(...points.map((point) => point.y), optimal.y);
  const maxYRaw = Math.max(...points.map((point) => point.y), optimal.y);

  const xSpan = Math.max(1, maxXRaw - minXRaw);
  const ySpan = Math.max(1, maxYRaw - minYRaw);

  const minX = minXRaw - xSpan * 0.12;
  const maxX = maxXRaw + xSpan * 0.12;
  const minY = minYRaw - ySpan * 0.12;
  const maxY = maxYRaw + ySpan * 0.12;

  const xDomainSpan = Math.max(1, maxX - minX);
  const yDomainSpan = Math.max(1, maxY - minY);

  const w = 400;
  const h = 280;
  const padL = 50;
  const padR = 20;
  const padT = 20;
  const padB = 40;
  const plotW = w - padL - padR;
  const plotH = h - padT - padB;

  const toSvg = (point: { x: number; y: number }) => ({
    sx: padL + ((point.x - minX) / xDomainSpan) * plotW,
    sy: padT + plotH - ((point.y - minY) / yDomainSpan) * plotH,
  });

  const frontierPath = points
    .map((point, index) => {
      const { sx, sy } = toSvg(point);
      return index === 0 ? `M${sx},${sy}` : `L${sx},${sy}`;
    })
    .join(" ");

  const optSvg = toSvg(optimal);

  return (
    <div className={cn("relative", className)}>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto">
        {[0, 0.25, 0.5, 0.75, 1].map((fraction) => (
          <line
            key={`h-${fraction}`}
            x1={padL}
            y1={padT + fraction * plotH}
            x2={padL + plotW}
            y2={padT + fraction * plotH}
            stroke="rgba(255,255,255,0.04)"
            strokeWidth={1}
          />
        ))}
        {[0, 0.25, 0.5, 0.75, 1].map((fraction) => (
          <line
            key={`v-${fraction}`}
            x1={padL + fraction * plotW}
            y1={padT}
            x2={padL + fraction * plotW}
            y2={padT + plotH}
            stroke="rgba(255,255,255,0.04)"
            strokeWidth={1}
          />
        ))}

        <text x={w / 2} y={h - 4} textAnchor="middle" fill="var(--text-caption)" fontSize={10} fontFamily="var(--font-mono)">
          Volatility (Risk)
        </text>
        <text x={12} y={h / 2} textAnchor="middle" fill="var(--text-caption)" fontSize={10} fontFamily="var(--font-mono)" transform={`rotate(-90, 12, ${h / 2})`}>
          Expected Return
        </text>

        {[0, 0.25, 0.5, 0.75, 1].map((fraction) => {
          const value = minY + yDomainSpan * (1 - fraction);
          const { sy } = toSvg({ x: minX, y: value });
          return (
            <text key={`y-${fraction}`} x={padL - 8} y={sy + 3} textAnchor="end" fill="var(--text-caption)" fontSize={9} fontFamily="var(--font-mono)">
              {value.toFixed(1)}%
            </text>
          );
        })}

        {[0, 0.25, 0.5, 0.75, 1].map((fraction) => {
          const value = minX + xDomainSpan * fraction;
          const { sx } = toSvg({ x: value, y: minY });
          return (
            <text key={`x-${fraction}`} x={sx} y={padT + plotH + 16} textAnchor="middle" fill="var(--text-caption)" fontSize={9} fontFamily="var(--font-mono)">
              {value.toFixed(1)}%
            </text>
          );
        })}

        {points.map((point, index) => {
          const { sx, sy } = toSvg(point);
          return <circle key={`pt-${index}`} cx={sx} cy={sy} r={2.5} fill="rgba(100, 116, 139, 0.4)" />;
        })}

        <path d={frontierPath} fill="none" stroke="var(--accent-primary)" strokeWidth={2} strokeDasharray="6 3" opacity={0.6} />

        <circle cx={optSvg.sx} cy={optSvg.sy} r={6} fill="var(--accent-primary)" opacity={0.3}>
          <animate attributeName="r" from="6" to="14" dur="2s" repeatCount="indefinite" />
          <animate attributeName="opacity" from="0.3" to="0" dur="2s" repeatCount="indefinite" />
        </circle>
        <circle cx={optSvg.sx} cy={optSvg.sy} r={5} fill="var(--accent-primary)" />
        <text x={optSvg.sx + 10} y={optSvg.sy - 8} fill="var(--accent-primary)" fontSize={10} fontFamily="var(--font-mono)" fontWeight="bold">
          OPTIMAL
        </text>
      </svg>
    </div>
  );
}
