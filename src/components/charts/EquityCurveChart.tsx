"use client";

import { Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Line, ComposedChart } from "recharts";

interface EquityCurveChartProps {
  data: { date: string; strategy: number; benchmark: number }[];
}

export function EquityCurveChart({ data }: EquityCurveChartProps) {
  return (
    <ResponsiveContainer width="100%" height={320}>
      <ComposedChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="strategyGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--accent-primary)" stopOpacity={0.25} />
            <stop offset="100%" stopColor="var(--accent-primary)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
        <XAxis
          dataKey="date"
          tick={{ fill: "var(--text-caption)", fontSize: 10, fontFamily: "var(--font-mono)" }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => v.slice(5)}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fill: "var(--text-caption)", fontSize: 10, fontFamily: "var(--font-mono)" }}
          tickLine={false}
          axisLine={false}
          domain={["dataMin - 5", "dataMax + 5"]}
          tickFormatter={(v: number) => v.toFixed(0)}
        />
        <Tooltip
          contentStyle={{
            background: "var(--surface-card)",
            border: "1px solid var(--border-default)",
            borderRadius: 8,
            fontSize: 12,
            fontFamily: "var(--font-mono)",
            color: "var(--text-heading)",
          }}
          formatter={(value) => [Number(value).toFixed(2), ""]}
          labelStyle={{ color: "var(--text-caption)", fontSize: 10 }}
        />
        <Legend
          wrapperStyle={{ fontSize: 10, fontFamily: "var(--font-mono)", paddingTop: 8 }}
          iconType="plainline"
        />
        <Area
          type="monotone"
          dataKey="strategy"
          stroke="var(--accent-primary)"
          strokeWidth={2}
          fill="url(#strategyGrad)"
          name="Strategy"
          dot={false}
          activeDot={{ r: 3, fill: "var(--accent-primary)" }}
        />
        <Line
          type="monotone"
          dataKey="benchmark"
          stroke="var(--text-caption)"
          strokeWidth={1.5}
          strokeDasharray="4 4"
          name="Benchmark (SPY)"
          dot={false}
          activeDot={{ r: 3, fill: "var(--text-caption)" }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
