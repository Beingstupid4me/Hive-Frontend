"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

interface RegimeChartProps {
  data: { date: string; bull_prob: number; bear_prob: number; neutral_prob: number; price: number }[];
}

export function RegimeChart({ data }: RegimeChartProps) {
  return (
    <ResponsiveContainer width="100%" height={320}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="bullGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#00f6ff" stopOpacity={0.3} />
            <stop offset="100%" stopColor="#00f6ff" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="bearGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ff00ff" stopOpacity={0.3} />
            <stop offset="100%" stopColor="#ff00ff" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="neutralGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#64748b" stopOpacity={0.2} />
            <stop offset="100%" stopColor="#64748b" stopOpacity={0} />
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
          domain={[0, 1]}
          tickFormatter={(v: number) => `${(v * 100).toFixed(0)}%`}
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
          formatter={(value) => [`${(Number(value) * 100).toFixed(1)}%`, ""]}
          labelStyle={{ color: "var(--text-caption)", fontSize: 10 }}
        />
        <ReferenceLine y={0.5} stroke="rgba(255,255,255,0.1)" strokeDasharray="3 3" />
        <Area
          type="monotone"
          dataKey="bull_prob"
          stackId="1"
          stroke="#00f6ff"
          strokeWidth={0}
          fill="url(#bullGrad)"
          name="Bull"
        />
        <Area
          type="monotone"
          dataKey="neutral_prob"
          stackId="1"
          stroke="#64748b"
          strokeWidth={0}
          fill="url(#neutralGrad)"
          name="Neutral"
        />
        <Area
          type="monotone"
          dataKey="bear_prob"
          stackId="1"
          stroke="#ff00ff"
          strokeWidth={0}
          fill="url(#bearGrad)"
          name="Bear"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
