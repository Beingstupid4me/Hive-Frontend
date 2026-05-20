"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Play, CheckCircle } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { EfficientFrontierChart } from "@/components/charts/EfficientFrontierChart";
import { cn } from "@/lib/utils";
import { apiPost } from "@/lib/api/http";
import { useApiResource } from "@/lib/hooks/useApiResource";
import { optimizerCurrentFallback } from "@/lib/api/fallbacks";
import type {
  OptimizerCurrentResponse,
  OptimizerSolveRequest,
  OptimizerSolveResponse,
} from "@/lib/api/types";

export default function PortfolioPage() {
  const [targetReturn, setTargetReturn] = useState("12.50");
  const [volCap, setVolCap] = useState("8.00");
  const [maxWeight, setMaxWeight] = useState(15);
  const [sectorNeutral, setSectorNeutral] = useState(true);
  const [runMessage, setRunMessage] = useState("");
  const [isRunning, setIsRunning] = useState(false);

  const { data, error, refresh, setData } = useApiResource<OptimizerCurrentResponse>("/optimizer/current", {
    initialData: optimizerCurrentFallback,
    refreshMs: 30_000,
  });

  const optimizer = data.optimizer;

  async function runSolver(): Promise<void> {
    const target = Number.parseFloat(targetReturn);
    const vol = Number.parseFloat(volCap);

    if (!Number.isFinite(target) || !Number.isFinite(vol) || target < 0 || vol <= 0) {
      setRunMessage("Target return and volatility cap must be valid positive numbers.");
      return;
    }

    const payload: OptimizerSolveRequest = {
      target_return_pct: target,
      volatility_cap_pct: vol,
      max_asset_weight_pct: maxWeight,
      sector_neutrality: sectorNeutral,
    };

    try {
      setIsRunning(true);
      const result = await apiPost<OptimizerSolveRequest, OptimizerSolveResponse>("/optimizer/solve", payload);
      setData(result);
      setRunMessage(`Solve complete. Job ${result.job_id} generated.`);
      await refresh();
    } catch {
      setRunMessage("Solver request failed. Please retry.");
    } finally {
      setIsRunning(false);
    }
  }

  const frontierPoints = optimizer.frontier_curve.length > 0 ? optimizer.frontier_curve : optimizer.frontier_points;

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-text-primary tracking-tight">Portfolio Optimization</h1>
          <p className="text-xs text-text-tertiary text-mono mt-1">Mean-Variance + HRP Solver / Quadratic Programming</p>
          {error ? <p className="text-[10px] text-gold text-mono mt-1">Using fallback data ({error})</p> : null}
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gain/10 text-gain text-[10px] font-bold text-mono">
            <CheckCircle className="w-3 h-3" /> {optimizer.status}
          </span>
          <button
            onClick={() => {
              void runSolver();
            }}
            disabled={isRunning}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-text-inverse text-xs font-bold text-mono uppercase hover:opacity-90 transition-opacity glow-sm disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Play className="w-3.5 h-3.5" /> {isRunning ? "Running..." : "Run Solver"}
          </button>
        </div>
      </motion.div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left - Parameters */}
        <div className="lg:col-span-4 space-y-6">
          {/* Input Parameters */}
          <Card>
            <CardTitle>Parameters</CardTitle>
            <div className="mt-4 space-y-4">
              <div>
                <label className="label mb-1.5 block">Target Return (%)</label>
                <input
                  type="text"
                  value={targetReturn}
                  onChange={(e) => setTargetReturn(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-transparent text-sm text-primary text-mono font-bold focus:outline-none focus:border-primary transition-colors"
                />
              </div>
              <div>
                <label className="label mb-1.5 block">Volatility Cap (%)</label>
                <input
                  type="text"
                  value={volCap}
                  onChange={(e) => setVolCap(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-transparent text-sm text-primary text-mono font-bold focus:outline-none focus:border-primary transition-colors"
                />
              </div>
            </div>
          </Card>

          {/* Constraints */}
          <Card>
            <CardTitle>Constraints</CardTitle>
            <div className="mt-4 space-y-5">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="label">Max Asset Weight</label>
                  <span className="text-xs text-primary text-mono font-bold">{maxWeight}.0%</span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={30}
                  value={maxWeight}
                  onChange={(e) => setMaxWeight(Number(e.target.value))}
                  className="w-full h-1.5 rounded-full appearance-none bg-surface-hover accent-primary cursor-pointer"
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="label">Sector Neutrality</label>
                <button
                  onClick={() => setSectorNeutral(!sectorNeutral)}
                  className={cn(
                    "w-10 h-5 rounded-full transition-colors relative",
                    sectorNeutral ? "bg-primary" : "bg-surface-hover"
                  )}
                >
                  <span className={cn(
                    "absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform",
                    sectorNeutral ? "translate-x-5" : "translate-x-0.5"
                  )} />
                </button>
              </div>
            </div>
          </Card>

          {/* Solver Log */}
          <Card>
            <CardTitle>Solver Output</CardTitle>
            <div className="mt-4 space-y-1 text-xs text-mono max-h-60 overflow-y-auto">
              {optimizer.solver_log.length === 0 ? (
                <p className="text-text-secondary">No solver events yet. Run the solver to generate output.</p>
              ) : (
                optimizer.solver_log.map((line, i) => (
                  <p key={i} className={cn(line.level === "success" ? "text-gain" : "text-text-secondary")}>
                    {line.message}
                  </p>
                ))
              )}
              {runMessage ? <p className="text-primary">{runMessage}</p> : null}
              <p className="text-primary animate-pulse-slow">_</p>
            </div>
          </Card>
        </div>

        {/* Right - Visualization + Table */}
        <div className="lg:col-span-8 space-y-6">
          {/* Efficient Frontier */}
          <Card>
            <CardHeader>
              <CardTitle>Efficient Frontier</CardTitle>
              <span className="text-[10px] text-text-tertiary text-mono">{optimizer.rebalance.length || 0} Assets • QP Solver</span>
            </CardHeader>
            <EfficientFrontierChart
              frontierPoints={frontierPoints}
              optimalPoint={optimizer.optimal_point}
            />
          </Card>

          {/* Rebalance Preview */}
          <Card className="p-0 overflow-hidden">
            <div className="p-6 pb-3">
              <CardTitle>Rebalance Preview</CardTitle>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-surface-hover/50">
                    <th className="text-left py-2.5 px-4 label">Asset Name</th>
                    <th className="text-left py-2.5 px-4 label">Ticker</th>
                    <th className="text-right py-2.5 px-4 label">Current %</th>
                    <th className="text-right py-2.5 px-4 label">Optimized %</th>
                    <th className="text-right py-2.5 px-4 label">Delta</th>
                  </tr>
                </thead>
                <tbody>
                  {optimizer.rebalance.map((alloc) => (
                    <tr key={alloc.ticker} className="border-b border-border/50 hover:bg-surface-hover transition-colors">
                      <td className="py-2.5 px-4 text-text-primary">{alloc.asset}</td>
                      <td className="py-2.5 px-4 text-text-secondary text-mono font-bold">{alloc.ticker}</td>
                      <td className="py-2.5 px-4 text-right text-text-secondary text-mono">{alloc.current_pct.toFixed(2)}</td>
                      <td className="py-2.5 px-4 text-right text-primary text-mono font-bold">{alloc.optimized_pct.toFixed(2)}</td>
                      <td className={cn("py-2.5 px-4 text-right text-mono font-bold", alloc.delta > 0 ? "text-gain" : "text-loss")}>
                        {alloc.delta > 0 ? "+" : ""}{alloc.delta.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between p-4 border-t border-border">
              <span className="text-xs text-text-tertiary text-mono">Turnover Rate: <span className="text-text-primary font-bold">{optimizer.turnover_rate_pct.toFixed(2)}%</span></span>
              <button
                onClick={() => {
                  void runSolver();
                }}
                className="px-5 py-2.5 rounded-lg bg-primary text-text-inverse text-xs font-bold text-mono uppercase tracking-wider hover:opacity-90 transition-opacity glow-sm"
              >
                Recompute Portfolio
              </button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
