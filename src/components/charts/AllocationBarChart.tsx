"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface AllocationBarChartProps {
  data: { label: string; weight: number; risk_contribution: number }[];
}

export function AllocationBarChart({ data }: AllocationBarChartProps) {
  const opacities = [0.9, 0.75, 0.6, 0.5, 0.4, 0.3, 0.2];

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }} barCategoryGap="20%">
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fill: "var(--text-caption)", fontSize: 10, fontFamily: "var(--font-mono)" }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          tick={{ fill: "var(--text-caption)", fontSize: 10, fontFamily: "var(--font-mono)" }}
          tickLine={false}
          axisLine={false}
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
        <Bar dataKey="weight" name="Weight" radius={[4, 4, 0, 0]}>
          {data.map((_, idx) => (
            <Cell key={idx} fill={`rgba(0, 246, 255, ${opacities[idx] || 0.2})`} />
          ))}
        </Bar>
        <Bar dataKey="risk_contribution" name="Risk Contrib" radius={[4, 4, 0, 0]}>
          {data.map((_, idx) => (
            <Cell key={idx} fill={`rgba(255, 0, 255, ${(opacities[idx] || 0.2) * 0.6})`} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
