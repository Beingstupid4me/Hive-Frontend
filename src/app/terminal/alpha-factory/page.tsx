"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Zap } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge, SignalBadge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import { apiGet } from "@/lib/api/http";
import { useApiResource } from "@/lib/hooks/useApiResource";
import { alphaPayloadFallback } from "@/lib/api/fallbacks";
import type { AlphaPayloadResponse, AlphaShapDetailResponse } from "@/lib/api/types";

type TabId = "rankings" | "features" | "log";

const tabs: { id: TabId; label: string }[] = [
  { id: "rankings", label: "Ranked Decile Table" },
  { id: "features", label: "Feature Importance" },
  { id: "log", label: "Execution Log" },
];

export default function AlphaFactoryPage() {
  const [activeTab, setActiveTab] = useState<TabId>("rankings");
  const [selectedTicker, setSelectedTicker] = useState<string | null>(null);
  const [shapDetail, setShapDetail] = useState<AlphaShapDetailResponse["alpha"]["shap_detail"] | null>(null);
  const [shapLoading, setShapLoading] = useState(false);
  const [shapError, setShapError] = useState<string | null>(null);
  const { data, error } = useApiResource<AlphaPayloadResponse>("/alpha/all", {
    initialData: alphaPayloadFallback,
    refreshMs: 30_000,
  });

  const alpha = data.alpha;
  const rollingIc = alpha.rolling_rank_ic;
  const isDecay = rollingIc.current_rank_ic < rollingIc.threshold;
  const healthSegments = Math.max(1, Math.round(alpha.system_health_score * 4));
  const executionLog = alpha.execution_log.map((item) => ({
    time: item.ts.includes("T") ? item.ts.split("T")[1]?.slice(0, 8) ?? item.ts : item.ts,
    action: item.action,
    detail: item.detail,
    type: item.severity === "signal" ? "success" : item.severity === "warn" ? "warn" : "info",
  }));

  const rankingCount = Math.max(alpha.rankings.length, 1);

  const openShapModal = async (ticker: string) => {
    setSelectedTicker(ticker);
    setShapLoading(true);
    setShapError(null);
    try {
      const payload = await apiGet<AlphaShapDetailResponse>(`/alpha/shap/${encodeURIComponent(ticker)}`);
      setShapDetail(payload.alpha.shap_detail);
    } catch {
      setShapError("Unable to fetch SHAP attribution details.");
      setShapDetail(null);
    } finally {
      setShapLoading(false);
    }
  };

  const closeShapModal = () => {
    setSelectedTicker(null);
    setShapDetail(null);
    setShapError(null);
  };

  const toDecile = (rank: number) => {
    const bucket = Math.floor(((rank - 1) / rankingCount) * 10);
    return Math.max(1, 10 - bucket);
  };

  const maxWaterfallImpact = Math.max(
    0.01,
    ...(shapDetail?.waterfall.map((item) => Math.abs(item.impact_pct)) ?? [0.01]),
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-text-primary tracking-tight">The Alpha Factory</h1>
          <p className="text-xs text-text-tertiary text-mono mt-1">Cross-Sectional Ranking Engine / {alpha.model_version}</p>
          {error ? <p className="text-[10px] text-gold text-mono mt-1">Using fallback data ({error})</p> : null}
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-surface">
            <Zap className="w-3.5 h-3.5 text-primary" />
            <span className="text-[10px] text-text-tertiary text-mono">Model Confidence:</span>
            <span className="text-xs font-bold text-primary text-mono">{alpha.model_confidence_pct.toFixed(1)}%</span>
          </div>
          <div className="px-3 py-1.5 rounded-lg border border-border bg-surface">
            <span className="text-[10px] text-text-tertiary text-mono">Alpha Decay: </span>
            <span className="text-xs font-bold text-gold text-mono">{alpha.decay_bps_per_hr.toFixed(3)} bps/hr</span>
          </div>
        </div>
      </motion.div>

      <Card className={cn("p-4 border", isDecay ? "border-gold/60 bg-gold/10" : "border-border bg-surface") }>
        <div className="flex flex-wrap items-center gap-3 justify-between">
          <div>
            <p className="label mb-1">Rolling 30-Day Rank IC</p>
            <p className={cn("text-sm font-bold text-mono", isDecay ? "text-gold" : "text-gain")}>
              {rollingIc.current_rank_ic.toFixed(4)} (threshold {rollingIc.threshold.toFixed(2)})
            </p>
          </div>
          <div className="text-xs text-text-secondary max-w-2xl">
            {isDecay
              ? "Model Decay Detected: Alpha signals degrading in current market microstructure."
              : rollingIc.warning}
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-border">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-colors border-b-2",
              activeTab === tab.id
                ? "text-primary border-primary"
                : "text-text-tertiary border-transparent hover:text-text-secondary"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "rankings" && (
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-surface-hover/50">
                  <th className="text-left py-3 px-4 label">Rank</th>
                  <th className="text-left py-3 px-4 label">Decile</th>
                  <th className="text-left py-3 px-4 label">Ticker</th>
                  <th className="text-left py-3 px-4 label hidden md:table-cell">Company</th>
                  <th className="text-right py-3 px-4 label">Alpha Score</th>
                  <th className="text-left py-3 px-4 label hidden lg:table-cell">SHAP Drivers (Top 3)</th>
                  <th className="text-right py-3 px-4 label hidden md:table-cell">Vol 30D</th>
                  <th className="text-center py-3 px-4 label">Signal</th>
                </tr>
              </thead>
              <tbody>
                {alpha.rankings.map((row) => {
                  const isLong = row.action === "TOP_LONG";
                  const isShort = row.action === "TOP_SHORT";
                  return (
                    <tr
                      key={row.ticker}
                      className={cn(
                        "border-b border-border/50 hover:bg-surface-hover transition-colors",
                        isLong && "bg-primary/5",
                        isShort && "bg-magenta/5"
                      )}
                    >
                      <td className={cn("py-3 px-4 text-mono font-bold", isLong ? "text-primary" : isShort ? "text-magenta" : "text-text-tertiary")}>
                        {String(row.rank).padStart(3, "0")}
                      </td>
                      <td className="py-3 px-4 text-mono font-bold text-text-secondary">D{toDecile(row.rank)}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              void openShapModal(row.ticker);
                            }}
                            className="text-mono font-bold text-text-primary hover:text-primary transition-colors"
                          >
                            {row.ticker}
                          </button>
                          {isLong && <Badge variant="success">LONG</Badge>}
                          {isShort && <Badge variant="danger">SHORT</Badge>}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-text-secondary hidden md:table-cell">{row.company}</td>
                      <td className={cn("py-3 px-4 text-right text-mono font-bold", row.alpha_score > 0 ? "text-gain" : row.alpha_score < 0 ? "text-loss" : "text-text-secondary")}>
                        {row.alpha_score > 0 ? "+" : ""}{row.alpha_score.toFixed(3)}
                      </td>
                      <td className="py-3 px-4 hidden lg:table-cell">
                        <div className="flex gap-1.5">
                          {row.shap_drivers.map((driver) => (
                            <span key={driver} className="px-2 py-0.5 rounded bg-surface-hover text-[10px] text-text-secondary text-mono font-bold">
                              {driver}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right text-text-secondary text-mono hidden md:table-cell">{row.volatility_30d.toFixed(1)}%</td>
                      <td className="py-3 px-4 text-center">
                        <SignalBadge signal={isLong ? "BUY" : isShort ? "SELL" : "HOLD"} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {activeTab === "features" && (
        <Card>
          <CardHeader>
            <CardTitle>SHAP Feature Attribution — Global</CardTitle>
          </CardHeader>
          <div className="space-y-3">
            {alpha.feature_importance.map((f, i) => (
              <div key={f.name} className="flex items-center gap-4">
                <span className="text-xs text-text-secondary text-mono w-48 shrink-0">{f.name}</span>
                <div className="flex-1 h-2 rounded-full bg-surface-hover overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, f.importance * 10000)}%` }}
                    transition={{ duration: 0.8, delay: i * 0.05 }}
                    className="h-full rounded-full bg-primary"
                  />
                </div>
                <span className="text-xs text-text-primary text-mono font-bold w-12 text-right">{(f.importance * 100).toFixed(2)}%</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {activeTab === "log" && (
        <Card>
          <CardHeader>
            <CardTitle>Execution Log</CardTitle>
          </CardHeader>
          <div className="space-y-2">
            {executionLog.map((log, i) => (
              <div key={i} className="flex gap-3 text-xs py-1.5 border-b border-border/30 last:border-0">
                <span className="text-text-tertiary text-mono shrink-0">[{log.time}]</span>
                <span className={cn(
                  "font-bold text-mono shrink-0",
                  log.type === "success" ? "text-gain" : log.type === "warn" ? "text-gold" : "text-text-secondary"
                )}>
                  {log.action}:
                </span>
                <span className="text-text-secondary">{log.detail}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Footer Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <p className="label mb-1">Long Portfolio</p>
          <p className="text-xl font-bold text-gain text-mono">{alpha.long_portfolio_return_pct > 0 ? "+" : ""}{alpha.long_portfolio_return_pct.toFixed(2)}%</p>
          <div className="mt-2 h-1.5 rounded-full bg-surface-hover overflow-hidden">
            <div className="h-full rounded-full bg-gain" style={{ width: `${Math.min(100, Math.max(0, alpha.long_portfolio_return_pct * 4))}%` }} />
          </div>
        </Card>
        <Card className="p-4">
          <p className="label mb-1">Short Portfolio</p>
          <p className="text-xl font-bold text-loss text-mono">{alpha.short_portfolio_return_pct.toFixed(2)}%</p>
          <div className="mt-2 h-1.5 rounded-full bg-surface-hover overflow-hidden">
            <div className="h-full rounded-full bg-loss" style={{ width: `${Math.min(100, Math.max(0, Math.abs(alpha.short_portfolio_return_pct) * 4))}%` }} />
          </div>
        </Card>
        <Card className="p-4">
          <p className="label mb-1">Information Ratio</p>
          <p className="text-xl font-bold text-primary text-mono">{alpha.information_ratio.toFixed(3)}</p>
          <div className="mt-2 h-1.5 rounded-full bg-surface-hover overflow-hidden">
            <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(100, Math.max(0, alpha.information_ratio * 45))}%` }} />
          </div>
        </Card>
        <Card className="p-4">
          <p className="label mb-1">System Health</p>
          <p className="text-sm font-bold text-text-secondary text-mono">Processing Batch: {alpha.batch_id}</p>
          <div className="mt-2 flex gap-1">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className={cn("h-2 flex-1 rounded-full", i <= healthSegments ? "bg-gain" : "bg-surface-hover")} />
            ))}
          </div>
        </Card>
      </div>

      {selectedTicker ? (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-3xl rounded-xl border border-border bg-surface-elevated p-6 space-y-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-black text-text-primary tracking-tight">
                  SHAP Attribution: {selectedTicker}
                </h3>
                <p className="text-xs text-text-tertiary text-mono">Why the model selected this stock</p>
              </div>
              <button onClick={closeShapModal} className="px-3 py-1.5 rounded-lg border border-border text-xs text-text-tertiary hover:text-text-primary">
                Close
              </button>
            </div>

            {shapLoading ? <p className="text-sm text-text-secondary">Loading attribution...</p> : null}
            {shapError ? <p className="text-sm text-loss">{shapError}</p> : null}

            {shapDetail ? (
              <>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  <Card className="p-3">
                    <p className="label mb-1">Rank</p>
                    <p className="text-sm text-text-primary font-bold text-mono">{shapDetail.rank}</p>
                  </Card>
                  <Card className="p-3">
                    <p className="label mb-1">Signal</p>
                    <p className="text-sm text-text-primary font-bold text-mono">{shapDetail.action}</p>
                  </Card>
                  <Card className="p-3">
                    <p className="label mb-1">Alpha Score</p>
                    <p className="text-sm text-text-primary font-bold text-mono">{shapDetail.alpha_score.toFixed(3)}</p>
                  </Card>
                  <Card className="p-3">
                    <p className="label mb-1">Predicted Return</p>
                    <p className={cn("text-sm font-bold text-mono", shapDetail.predicted_return_pct >= 0 ? "text-gain" : "text-loss")}>
                      {shapDetail.predicted_return_pct >= 0 ? "+" : ""}
                      {shapDetail.predicted_return_pct.toFixed(2)}%
                    </p>
                  </Card>
                </div>

                <div className="space-y-2">
                  <p className="label">Waterfall Contributions</p>
                  {shapDetail.waterfall.map((step) => {
                    const widthPct = Math.max(4, (Math.abs(step.impact_pct) / maxWaterfallImpact) * 100);
                    return (
                      <div key={step.label} className="space-y-1">
                        <div className="flex items-center justify-between text-xs text-mono">
                          <span className="text-text-secondary">{step.label}</span>
                          <span className={cn(step.impact_pct >= 0 ? "text-gain" : "text-loss")}>
                            {step.impact_pct >= 0 ? "+" : ""}
                            {step.impact_pct.toFixed(2)}%  |  Cum {step.cumulative_pct.toFixed(2)}%
                          </span>
                        </div>
                        <div className="h-2 rounded-full bg-surface-hover overflow-hidden">
                          <div
                            className={cn("h-full rounded-full", step.impact_pct >= 0 ? "bg-primary" : "bg-magenta")}
                            style={{ width: `${Math.min(100, widthPct)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="space-y-1.5">
                  <p className="label">Driver Commentary</p>
                  {shapDetail.drivers.map((driver) => (
                    <p key={driver.feature} className="text-xs text-text-secondary">
                      <span className="text-text-primary font-bold">{driver.feature_label}:</span> {driver.narrative}
                    </p>
                  ))}
                </div>
              </>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
