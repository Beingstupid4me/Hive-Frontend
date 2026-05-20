"use client";

import { motion } from "framer-motion";
import { Shield, AlertTriangle } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { AllocationBarChart } from "@/components/charts/AllocationBarChart";
import { DendrogramChart } from "@/components/charts/DendrogramChart";
import { cn, formatLargeNumber } from "@/lib/utils";
import { useApiResource } from "@/lib/hooks/useApiResource";
import { riskPayloadFallback } from "@/lib/api/fallbacks";
import type { RiskPayloadResponse } from "@/lib/api/types";

export default function RiskDeskPage() {
  const { data, error } = useApiResource<RiskPayloadResponse>("/risk/all", {
    initialData: riskPayloadFallback,
    refreshMs: 30_000,
  });

  const hrp = {
    total_exposure: data.risk.total_exposure_usd,
    diversification_ratio: data.risk.diversification_ratio,
    cluster_count: data.risk.cluster_count,
    system_status: data.risk.system_status,
    expected_volatility: data.risk.expected_volatility_pct,
    clusters: data.risk.clusters,
    dendrogram: data.risk.dendrogram,
  };

  const activeOrders = data.risk.active_orders;

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-text-primary tracking-tight">The Risk Desk</h1>
          <p className="text-xs text-text-tertiary text-mono mt-1">HRP Visualization / Cluster Allocation Engine</p>
          {error ? <p className="text-[10px] text-gold text-mono mt-1">Using fallback data ({error})</p> : null}
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-gain/10 text-gain text-[10px] font-bold text-mono uppercase">{hrp.system_status}</span>
        </div>
      </motion.div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Exposure" value={`$${formatLargeNumber(hrp.total_exposure)}`} change={data.risk.total_exposure_change_pct} icon={<Shield className="w-5 h-5 text-primary" />} />
        <StatCard label="Diversification Ratio" value={hrp.diversification_ratio.toFixed(2)} change={data.risk.diversification_change} delay={0.1} />
        <StatCard label="Cluster Count" value={String(hrp.cluster_count)} delay={0.2} />
        <StatCard label="Expected Volatility" value={`${hrp.expected_volatility}%`} delay={0.3} icon={<AlertTriangle className="w-5 h-5 text-gold" />} />
      </div>

      {/* Risk Allocation Bar */}
      <Card>
        <CardHeader>
          <CardTitle>Risk Allocation</CardTitle>
          <span className="text-[10px] text-text-tertiary text-mono">{hrp.cluster_count} Clusters Active</span>
        </CardHeader>
        <div className="flex h-8 rounded-lg overflow-hidden mb-4">
          {hrp.clusters.map((cluster, i) => {
            const opacities = [0.9, 0.75, 0.6, 0.5, 0.4, 0.3];
            return (
              <div
                key={cluster.cluster_id}
                className="relative group flex items-center justify-center transition-all duration-200 hover:opacity-100"
                style={{ width: `${cluster.weight * 100}%`, background: `rgba(0, 246, 255, ${opacities[i] || 0.2})` }}
              >
                <span className="text-[9px] font-bold text-text-inverse text-mono opacity-0 group-hover:opacity-100 transition-opacity">
                  {cluster.label}
                </span>
              </div>
            );
          })}
          <div className="flex items-center justify-center bg-surface-hover" style={{ width: "10%" }}>
            <span className="text-[9px] font-bold text-text-tertiary text-mono">RES</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-3 text-[10px] text-mono">
          {hrp.clusters.map((c) => (
            <span key={c.cluster_id} className="text-text-secondary">
              <span className="text-text-primary font-bold">{c.label}</span> {(c.weight * 100).toFixed(1)}%
            </span>
          ))}
        </div>
      </Card>

      {/* Chart + Cluster Details */}
      <Card>
        <CardHeader>
          <CardTitle>HRP Correlation Dendrogram</CardTitle>
          <span className="text-[10px] text-text-tertiary text-mono">Hierarchical clustering tree (stocks to sector clusters)</span>
        </CardHeader>
        <DendrogramChart data={hrp.dendrogram} />
      </Card>

      {/* Chart + Cluster Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Allocation Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Cluster Weight vs Risk Contribution</CardTitle>
          </CardHeader>
          <AllocationBarChart data={hrp.clusters.map((c) => ({ label: c.label, weight: c.weight, risk_contribution: c.risk_contribution }))} />
        </Card>

        {/* HRP Weights Table */}
        <Card>
          <CardHeader>
            <CardTitle>HRP Cluster Weights</CardTitle>
          </CardHeader>
          <div className="space-y-3">
            {hrp.clusters.map((cluster) => (
              <div key={cluster.cluster_id} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-primary text-mono font-bold">{cluster.cluster_id}</span>
                    <span className="text-xs text-text-primary font-bold">{cluster.label}</span>
                  </div>
                  <span className="text-xs text-text-primary text-mono font-bold">{(cluster.weight * 100).toFixed(1)}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-surface-hover overflow-hidden">
                  <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${cluster.weight * 100 / 0.25}%` }} />
                </div>
                <div className="flex gap-1">
                  {cluster.assets.map((a) => (
                    <span key={a} className="text-[10px] text-text-tertiary text-mono">{a}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Active Orders */}
      <Card>
        <CardHeader>
          <CardTitle>Active Orders</CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 px-3 label">Ticker</th>
                <th className="text-center py-2 px-3 label">Side</th>
                <th className="text-right py-2 px-3 label">Shares</th>
                <th className="text-right py-2 px-3 label">Price</th>
                <th className="text-right py-2 px-3 label">Status</th>
              </tr>
            </thead>
            <tbody>
              {activeOrders.map((order, i) => (
                <tr key={i} className="border-b border-border/50 hover:bg-surface-hover transition-colors">
                  <td className="py-2.5 px-3 text-mono font-bold text-text-primary">{order.ticker}</td>
                  <td className="py-2.5 px-3 text-center">
                    <span className={cn(
                      "px-2 py-0.5 rounded text-[10px] font-bold text-mono",
                      order.side === "BUY" ? "bg-primary/10 text-primary" : "bg-magenta/10 text-magenta"
                    )}>
                      {order.side === "BUY" ? "B" : "S"}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right text-mono text-text-secondary">{order.shares.toLocaleString()} SHRS</td>
                  <td className="py-2.5 px-3 text-right text-mono text-text-primary">${order.price.toFixed(2)}</td>
                  <td className="py-2.5 px-3 text-right">
                    <span className="text-[10px] font-bold text-mono text-text-tertiary">{order.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
