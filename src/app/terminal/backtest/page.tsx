"use client";

import { motion } from "framer-motion";
import { Play, Calendar } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { Badge } from "@/components/ui/Badge";
import { EquityCurveChart } from "@/components/charts/EquityCurveChart";
import { cn, formatPercentage } from "@/lib/utils";
import { useApiResource } from "@/lib/hooks/useApiResource";
import { backtestPayloadFallback } from "@/lib/api/fallbacks";
import type { BacktestPayloadResponse } from "@/lib/api/types";

export default function BacktestPage() {
  const { data, error } = useApiResource<BacktestPayloadResponse>("/backtest/latest", {
    initialData: backtestPayloadFallback,
    refreshMs: 30_000,
  });

  const m = data.backtest;
  const riskDecomp = [
    { label: "Vol (Ann.)", value: `${m.annual_volatility_pct.toFixed(2)}%`, bar: Math.min(100, Math.abs(m.annual_volatility_pct) * 3) },
    { label: "Skewness", value: `${m.skewness > 0 ? "+" : ""}${m.skewness.toFixed(3)}`, bar: Math.min(100, Math.abs(m.skewness) * 100) },
    { label: "Kurtosis", value: m.kurtosis.toFixed(3), bar: Math.min(100, Math.abs(m.kurtosis) * 20) },
    { label: "Sortino Ratio", value: m.sortino_ratio.toFixed(3), bar: Math.min(100, Math.abs(m.sortino_ratio) * 25) },
  ];

  const tradeStats = [
    { label: "Avg Win", value: `$${m.avg_win_usd.toLocaleString(undefined, { maximumFractionDigits: 2 })}`, color: "text-gain" },
    { label: "Avg Loss", value: `($${Math.abs(m.avg_loss_usd).toLocaleString(undefined, { maximumFractionDigits: 2 })})`, color: "text-loss" },
    { label: "Max Consec. Wins", value: String(m.max_consecutive_wins), color: "text-text-primary" },
    { label: "Kelly Criterion", value: `${m.kelly_criterion_pct.toFixed(2)}%`, color: "text-primary" },
  ];

  const modelParams = Object.entries(m.model_params)
    .map(([key, value]) => `${key}: ${String(value)}`)
    .join("\n");

  const equityCurve = m.equity_curve.map((row) => ({
    date: row.date,
    strategy: row.strategy * 100,
    benchmark: row.benchmark * 100,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-text-primary tracking-tight">Backtest Engine</h1>
          <p className="text-xs text-text-tertiary text-mono mt-1">Simulation Log / Alpha-v4.2</p>
          {error ? <p className="text-[10px] text-gold text-mono mt-1">Using fallback data ({error})</p> : null}
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-surface">
            <Calendar className="w-3.5 h-3.5 text-text-tertiary" />
            <span className="text-[10px] text-text-tertiary text-mono">{m.date_range.start ?? "N/A"} → {m.date_range.end ?? "N/A"}</span>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-text-inverse text-xs font-bold text-mono uppercase hover:opacity-90 transition-opacity glow-sm">
            <Play className="w-3.5 h-3.5" /> Run New Sim
          </button>
        </div>
      </motion.div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Sharpe Ratio" value={m.sharpe_ratio.toFixed(2)} />
        <StatCard label="Max Drawdown" value={formatPercentage(m.max_drawdown_pct, false)} delay={0.1} />
        <StatCard label="Win Rate" value={`${m.win_rate_pct}%`} delay={0.2} />
        <StatCard label="Profit Factor" value={m.profit_factor.toFixed(2)} delay={0.3} />
      </div>

      {/* Equity Curve */}
      <Card>
        <CardHeader>
          <CardTitle>Equity Curve</CardTitle>
          <div className="flex items-center gap-3 text-[10px] text-mono">
            <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 rounded-full bg-primary inline-block" /> Strategy</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 rounded-full bg-text-tertiary inline-block" style={{ borderTop: "1px dashed" }} /> SPY</span>
          </div>
        </CardHeader>
        <EquityCurveChart data={equityCurve} />
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Simulation Log */}
        <Card className="lg:col-span-2 p-0 overflow-hidden">
          <div className="p-6 pb-0">
            <CardTitle>Simulation Log</CardTitle>
          </div>
          <div className="overflow-x-auto mt-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-surface-hover/50">
                  <th className="text-left py-2.5 px-4 label">Timestamp</th>
                  <th className="text-left py-2.5 px-4 label">Model</th>
                  <th className="text-left py-2.5 px-4 label">Asset</th>
                  <th className="text-center py-2.5 px-4 label">Signal</th>
                  <th className="text-right py-2.5 px-4 label">Entry</th>
                  <th className="text-right py-2.5 px-4 label">Exit</th>
                  <th className="text-right py-2.5 px-4 label">P&L %</th>
                </tr>
              </thead>
              <tbody>
                {m.trades.map((trade, i) => (
                  <tr key={i} className="border-b border-border/50 hover:bg-surface-hover transition-colors">
                    <td className="py-2.5 px-4 text-text-tertiary text-mono text-xs">{trade.date}</td>
                    <td className="py-2.5 px-4 text-text-secondary text-mono text-xs">{trade.model_version}</td>
                    <td className="py-2.5 px-4 text-text-primary text-mono font-bold">{trade.ticker}</td>
                    <td className="py-2.5 px-4 text-center">
                      <Badge variant={trade.signal === "LONG" ? "success" : trade.signal === "SHORT" ? "danger" : "default"}>
                        {trade.signal}
                      </Badge>
                    </td>
                    <td className="py-2.5 px-4 text-right text-text-secondary text-mono">{trade.entry.toLocaleString()}</td>
                    <td className="py-2.5 px-4 text-right text-text-secondary text-mono">{trade.exit.toLocaleString()}</td>
                    <td className={cn("py-2.5 px-4 text-right text-mono font-bold", trade.pnl_pct > 0 ? "text-gain" : trade.pnl_pct < 0 ? "text-loss" : "text-text-secondary")}>
                      {trade.pnl_pct > 0 ? "+" : ""}{trade.pnl_pct.toFixed(2)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Right Panel */}
        <div className="space-y-6">
          {/* Risk Decomposition */}
          <Card>
            <CardTitle>Risk Decomposition</CardTitle>
            <div className="mt-4 space-y-3">
              {riskDecomp.map((item) => (
                <div key={item.label} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-text-secondary uppercase tracking-wider">{item.label}</span>
                    <span className="text-xs font-bold text-primary text-mono">{item.value}</span>
                  </div>
                  <div className="h-1 rounded-full bg-surface-hover overflow-hidden">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${item.bar}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Trade Statistics */}
          <Card>
            <CardTitle>Trade Statistics</CardTitle>
            <div className="mt-4 space-y-2.5">
              {tradeStats.map((stat) => (
                <div key={stat.label} className="flex items-center justify-between">
                  <span className="text-xs text-text-secondary">{stat.label}</span>
                  <span className={cn("text-sm font-bold text-mono", stat.color)}>{stat.value}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Model Parameters */}
          <Card>
            <CardTitle>Model Parameters</CardTitle>
            <pre className="mt-4 text-xs text-text-secondary text-mono leading-relaxed whitespace-pre-wrap">{modelParams || "No model parameters available"}</pre>
          </Card>
        </div>
      </div>
    </div>
  );
}
