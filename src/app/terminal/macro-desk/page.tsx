"use client";

import { motion } from "framer-motion";
import { TrendingDown, TrendingUp, Minus, Activity } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { RegimeChart } from "@/components/charts/RegimeChart";
import { cn } from "@/lib/utils";
import type { RegimeState } from "@/types";
import type { RegimeData } from "@/types";
import { useApiResource } from "@/lib/hooks/useApiResource";
import { macroPayloadFallback } from "@/lib/api/fallbacks";
import type { MacroPayloadResponse } from "@/lib/api/types";

const regimeColors: Record<RegimeState, string> = {
  LOW_VOL_BULL: "text-primary",
  HIGH_VOL_BEAR: "text-magenta",
  SIDEWAYS: "text-text-secondary",
  TRANSITION: "text-gold",
};

const regimeLabels: Record<RegimeState, string> = {
  LOW_VOL_BULL: "Low Vol Bull",
  HIGH_VOL_BEAR: "High Vol Bear",
  SIDEWAYS: "Sideways",
  TRANSITION: "Transition",
};

export default function MacroDeskPage() {
  const { data, error } = useApiResource<MacroPayloadResponse>("/macro/all", {
    initialData: macroPayloadFallback,
    refreshMs: 30_000,
  });

  const regime: RegimeData = {
    current_regime: data.regime.current_state,
    confidence: data.regime.confidence,
    volatility_index: data.macro.volatility_index,
    liquidity_score: data.macro.liquidity_score,
    correlation_skew: data.macro.correlation_skew,
    market_sentiment: data.regime.weather_label,
    transition_probabilities: data.regime.transition_matrix,
  };

  const latentFactors = data.macro.latent_factors.map((factor) => ({
    label: factor.name,
    value: factor.value.toFixed(3),
  }));

  const crossAsset = data.macro.cross_asset_context.map((item) => ({
    label: item.asset,
    value: item.value,
  }));

  const transitionLog = data.regime.transition_events.map((event) => {
    const time = event.ts.includes("T") ? event.ts.split("T")[1]?.slice(0, 8) ?? event.ts : event.ts;
    const type = event.severity === "high" ? "warn" : event.severity === "signal" ? "success" : "info";
    return {
      time,
      event: event.event,
      detail: event.detail,
      type,
    };
  });

  const probs = regime.transition_probabilities[regime.current_regime];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-text-primary tracking-tight">Macro Desk</h1>
          <p className="text-xs text-text-tertiary text-mono mt-1">Regime Detection / HMM_V4_LATEST</p>
          {error ? <p className="text-[10px] text-gold text-mono mt-1">Using fallback data ({error})</p> : null}
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-gain/10 text-gain text-[10px] font-bold text-mono uppercase">Live</span>
          <span className="px-3 py-1 rounded-full bg-surface border border-border text-text-tertiary text-[10px] font-bold text-mono">
            Confidence: {(regime.confidence * 100).toFixed(1)}%
          </span>
        </div>
      </motion.div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Current Regime" value={regimeLabels[regime.current_regime]} icon={<Activity className="w-5 h-5 text-primary" />} />
        <StatCard label="Volatility Index" value={regime.volatility_index.toFixed(2)} change={data.macro.volatility_change_pct} changeLabel="DELTA" delay={0.1} icon={<TrendingDown className="w-5 h-5" />} />
        <StatCard label="Liquidity Score" value={regime.liquidity_score.toFixed(1)} change={data.macro.liquidity_change_pct} changeLabel="DELTA" delay={0.2} icon={<TrendingUp className="w-5 h-5" />} />
        <StatCard label="Correlation Skew" value={regime.correlation_skew.toFixed(2)} delay={0.3} icon={<Minus className="w-5 h-5" />} />
      </div>

      {/* Market Weather Gauge + Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gauge */}
        <Card>
          <CardHeader>
            <CardTitle>Market Weather</CardTitle>
          </CardHeader>
          <div className="flex flex-col items-center">
            <div className="relative w-40 h-40">
              <svg viewBox="0 0 160 160" className="w-full h-full">
                {/* Background arc */}
                <circle cx="80" cy="80" r="60" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" strokeDasharray="283" strokeDashoffset="70" transform="rotate(135, 80, 80)" />
                {/* Filled arc */}
                <circle cx="80" cy="80" r="60" fill="none" stroke="var(--accent-primary)" strokeWidth="8" strokeDasharray={`${regime.confidence * 213} 283`} strokeDashoffset="70" transform="rotate(135, 80, 80)" strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={cn("text-lg font-black", regimeColors[regime.current_regime])}>
                  {regimeLabels[regime.current_regime]}
                </span>
                <span className="text-2xl font-bold text-text-primary text-mono">
                  {(regime.confidence * 100).toFixed(1)}%
                </span>
              </div>
            </div>
            {/* Probability breakdown */}
            <div className="w-full mt-4 space-y-2">
              {(["LOW_VOL_BULL", "HIGH_VOL_BEAR", "SIDEWAYS", "TRANSITION"] as RegimeState[]).map((state) => (
                <div key={state} className="flex items-center justify-between text-xs">
                  <span className={cn("text-mono", regimeColors[state])}>{regimeLabels[state]}</span>
                  <span className="text-text-secondary text-mono">{(probs[state] * 100).toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* HMM Regime Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>HMM Regime Time-Series</CardTitle>
            <span className="text-[10px] text-text-tertiary text-mono">90D Rolling</span>
          </CardHeader>
          <RegimeChart data={data.regime.history} />
        </Card>
      </div>

      {/* Bottom panels - 3 columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Latent Factors */}
        <Card>
          <CardHeader>
            <CardTitle>Latent Factor Analysis</CardTitle>
          </CardHeader>
          <div className="space-y-3">
            {latentFactors.map((f) => (
              <div key={f.label} className="flex items-center justify-between">
                <span className="text-xs text-text-secondary uppercase tracking-wider">{f.label}</span>
                <span className="text-sm font-bold text-text-primary text-mono">{f.value}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Cross-Asset Context */}
        <Card>
          <CardHeader>
            <CardTitle>Cross-Asset Context</CardTitle>
          </CardHeader>
          <div className="space-y-3">
            {crossAsset.map((item) => (
              <div key={item.label} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-text-secondary uppercase tracking-wider">{item.label}</span>
                  <span className={cn("text-sm font-bold text-mono", item.value > 0 ? "text-primary" : "text-magenta")}>
                    {item.value > 0 ? "+" : ""}{item.value.toFixed(2)}
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-surface-hover overflow-hidden">
                  <div
                    className={cn("h-full rounded-full transition-all", item.value > 0 ? "bg-primary" : "bg-magenta")}
                    style={{ width: `${Math.abs(item.value) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Transition Log */}
        <Card>
          <CardHeader>
            <CardTitle>Transition Log</CardTitle>
          </CardHeader>
          <div className="space-y-2">
            {transitionLog.map((log, i) => (
              <div key={i} className="flex gap-3 text-xs">
                <span className="text-text-tertiary text-mono flex-shrink-0">[{log.time}]</span>
                <div>
                  <span className={cn(
                    "font-bold text-mono",
                    log.type === "success" ? "text-gain" : log.type === "warn" ? "text-gold" : "text-text-secondary"
                  )}>
                    {log.event}:
                  </span>{" "}
                  <span className="text-text-secondary">{log.detail}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Transition Probability Matrix */}
      <Card>
        <CardHeader>
          <CardTitle>Transition Probability Matrix</CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-mono">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 px-3 label">From / To</th>
                {(["LOW_VOL_BULL", "HIGH_VOL_BEAR", "SIDEWAYS", "TRANSITION"] as RegimeState[]).map((s) => (
                  <th key={s} className={cn("text-right py-2 px-3 label", regimeColors[s])}>{regimeLabels[s]}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(["LOW_VOL_BULL", "HIGH_VOL_BEAR", "SIDEWAYS", "TRANSITION"] as RegimeState[]).map((from) => (
                <tr key={from} className="border-b border-border/50 hover:bg-surface-hover transition-colors">
                  <td className={cn("py-2 px-3 font-bold", regimeColors[from])}>{regimeLabels[from]}</td>
                  {(["LOW_VOL_BULL", "HIGH_VOL_BEAR", "SIDEWAYS", "TRANSITION"] as RegimeState[]).map((to) => {
                    const val = regime.transition_probabilities[from][to];
                    return (
                      <td key={to} className="text-right py-2 px-3">
                        <span className={cn(
                          "inline-block px-2 py-0.5 rounded",
                          val > 0.5 ? "bg-primary/15 text-primary" : val > 0.2 ? "bg-gold/10 text-gold" : "text-text-tertiary"
                        )}>
                          {(val * 100).toFixed(1)}%
                        </span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
