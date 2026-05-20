"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Wifi } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { PriceChart } from "@/components/charts/PriceChart";
import { cn, formatCurrency } from "@/lib/utils";
import { apiPost, withQuery } from "@/lib/api/http";
import { useApiResource } from "@/lib/hooks/useApiResource";
import { executionPayloadFallback } from "@/lib/api/fallbacks";
import type {
  ExecutionCapacityResponse,
  ExecutionOrderRequest,
  ExecutionOrderResponse,
  ExecutionPayloadResponse,
} from "@/lib/api/types";

const algoOptions = ["VWAP", "TWAP", "ICEBERG", "POV"];
const timeframeOptions = [
  { label: "1m", value: "1m" },
  { label: "5m", value: "5m" },
  { label: "15m", value: "15m" },
  { label: "1H", value: "1h" },
  { label: "1D", value: "1d" },
] as const;

type Timeframe = (typeof timeframeOptions)[number]["value"];

function formatLogTime(timestamp: string): string {
  if (!timestamp) {
    return "--:--:--";
  }
  if (timestamp.includes("T")) {
    return timestamp.split("T")[1]?.slice(0, 8) ?? timestamp;
  }
  return timestamp.slice(0, 8);
}

function formatCandleLabel(time: string): string {
  if (!time) {
    return "N/A";
  }
  if (time.includes("T")) {
    return time.split("T")[1]?.slice(0, 5) ?? time;
  }
  return time;
}

export default function ExecutionPage() {
  const [side, setSide] = useState<"BUY" | "SELL">("BUY");
  const [algo, setAlgo] = useState("VWAP");
  const [timeframe, setTimeframe] = useState<Timeframe>("1d");
  const [ticker, setTicker] = useState("AAPL");
  const [simulatedAum, setSimulatedAum] = useState(100_000);
  const [capacityAum, setCapacityAum] = useState(100_000);
  const [quantity, setQuantity] = useState("2500");
  const [price, setPrice] = useState("");
  const [submitMessage, setSubmitMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const capacityInitialData = useMemo(
    () => ({ execution: { capacity: executionPayloadFallback.execution.capacity } }),
    [],
  );

  const normalizedTicker = ticker.trim().toUpperCase() || "AAPL";
  const executionPath = useMemo(
    () => withQuery("/execution/all", { ticker: normalizedTicker, timeframe }),
    [normalizedTicker, timeframe],
  );
  const capacityPath = useMemo(
    () => withQuery("/execution/capacity", { ticker: normalizedTicker, aum_usd: capacityAum }),
    [normalizedTicker, capacityAum],
  );

  const { data, error, refresh } = useApiResource<ExecutionPayloadResponse>(executionPath, {
    initialData: executionPayloadFallback,
    refreshMs: 8_000,
  });
  const { data: capacityData } = useApiResource<ExecutionCapacityResponse>(capacityPath, {
    initialData: capacityInitialData,
    refreshMs: 8_000,
  });

  const execution = data.execution;
  const capacity = capacityData.execution.capacity;

  useEffect(() => {
    if (!price && execution.order_price > 0) {
      setPrice(execution.order_price.toFixed(2));
    }
  }, [execution.order_price, price]);

  useEffect(() => {
    if (!quantity && execution.order_quantity > 0) {
      setQuantity(String(execution.order_quantity));
    }
  }, [execution.order_quantity, quantity]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setCapacityAum(simulatedAum);
    }, 220);

    return () => window.clearTimeout(timer);
  }, [simulatedAum]);

  const chartData = execution.candles.map((row) => ({
    ...row,
    time: formatCandleLabel(row.time),
  }));

  const topAsks = [...execution.l2_asks].slice(0, 3).reverse();
  const topBids = execution.l2_bids.slice(0, 3);
  const quickSizeOptions = execution.quick_size_options.length > 0 ? execution.quick_size_options : [25, 50, 75, "MAX"];
  const orderLog = [...execution.orders].reverse();
  const ledger = execution.ledger;

  function applyQuickSize(option: number | string): void {
    const baseline = execution.order_quantity > 0 ? execution.order_quantity : 1000;
    if (option === "MAX") {
      setQuantity(String(baseline));
      return;
    }
    if (typeof option === "number") {
      setQuantity(String(Math.max(1, Math.round((baseline * option) / 100))));
    }
  }

  async function submitOrder(): Promise<void> {
    const qty = Number.parseFloat(quantity.replace(/,/g, ""));
    const px = Number.parseFloat(price.replace(/,/g, ""));

    if (!Number.isFinite(qty) || qty <= 0) {
      setSubmitMessage("Quantity must be greater than zero.");
      return;
    }

    const payload: ExecutionOrderRequest = {
      ticker: normalizedTicker,
      side,
      quantity: qty,
      price: Number.isFinite(px) && px > 0 ? px : undefined,
      algo,
    };

    try {
      setIsSubmitting(true);
      const response = await apiPost<ExecutionOrderRequest, ExecutionOrderResponse>("/execution/order", payload);
      setSubmitMessage(`Order ${response.order.id} routed via ${response.order.route ?? "SMART"}.`);
      await refresh();
    } catch {
      setSubmitMessage("Order submission failed. Please retry.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleAumSliderChange(value: string): void {
    const exponent = Number(value);
    if (!Number.isFinite(exponent)) {
      return;
    }
    const next = Math.round(10 ** exponent);
    setSimulatedAum(next);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-text-primary tracking-tight">Trade Execution</h1>
          <p className="text-xs text-text-tertiary text-mono mt-1">Direct Market Access / Smart Order Routing</p>
          {error ? <p className="text-[10px] text-gold text-mono mt-1">Using fallback data ({error})</p> : null}
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gain/30 bg-gain/5">
          <Wifi className="w-3.5 h-3.5 text-gain" />
          <span className="text-[10px] text-gain text-mono font-bold">{execution.connectivity_endpoint}: {execution.connectivity_latency_ms.toFixed(1)}ms</span>
        </div>
      </motion.div>

      <Card>
        <CardHeader>
          <CardTitle>Capital Scalability / Friction Engine</CardTitle>
          <span className="text-[10px] text-text-tertiary text-mono">AUM stress from $10k to $100m with liquidity impact penalties</span>
        </CardHeader>
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2 text-xs text-mono">
              <span className="text-text-tertiary">Simulated AUM</span>
              <span className="text-text-primary font-bold">{formatCurrency(simulatedAum)}</span>
            </div>
            <input
              type="range"
              min={4}
              max={8}
              step={0.01}
              value={Math.log10(simulatedAum)}
              onChange={(event) => handleAumSliderChange(event.target.value)}
              className="w-full accent-primary"
            />
            <div className="mt-1 flex items-center justify-between text-[10px] text-text-tertiary text-mono">
              <span>$10k</span>
              <span>$100m</span>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
            <div className="rounded-lg border border-border p-3">
              <p className="label mb-1">Projected Return</p>
              <p className="text-sm font-bold text-mono text-gain">{capacity.projected_annual_return_pct.toFixed(2)}%</p>
            </div>
            <div className="rounded-lg border border-border p-3">
              <p className="label mb-1">Projected Sharpe</p>
              <p className="text-sm font-bold text-mono text-primary">{capacity.projected_sharpe.toFixed(3)}</p>
            </div>
            <div className="rounded-lg border border-border p-3">
              <p className="label mb-1">Total Cost</p>
              <p className="text-sm font-bold text-mono text-gold">{capacity.total_cost_bps.toFixed(2)} bps</p>
            </div>
            <div className="rounded-lg border border-border p-3">
              <p className="label mb-1">Participation</p>
              <p className="text-sm font-bold text-mono text-text-primary">{(capacity.participation_rate * 100).toFixed(3)}%</p>
            </div>
            <div className="rounded-lg border border-border p-3">
              <p className="label mb-1">Sample Trade</p>
              <p className="text-sm font-bold text-mono text-text-primary">{formatCurrency(capacity.sample_trade_notional_usd)}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* 3-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left - Order Entry + L2 Depth */}
        <div className="lg:col-span-3 space-y-6">
          {/* Order Entry */}
          <Card>
            <CardTitle>Order Entry</CardTitle>
            <div className="mt-4 space-y-4">
              {/* Buy/Sell toggle */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setSide("BUY")}
                  className={cn(
                    "py-2 rounded-lg text-xs font-bold text-mono uppercase transition-all",
                    side === "BUY" ? "bg-primary text-text-inverse glow-sm" : "bg-surface-hover text-text-tertiary"
                  )}
                >
                  Buy
                </button>
                <button
                  onClick={() => setSide("SELL")}
                  className={cn(
                    "py-2 rounded-lg text-xs font-bold text-mono uppercase transition-all",
                    side === "SELL" ? "bg-magenta text-white" : "bg-surface-hover text-text-tertiary"
                  )}
                >
                  Sell
                </button>
              </div>

              {/* Ticker */}
              <div>
                <label className="label mb-1 block">Ticker</label>
                <input
                  type="text"
                  value={ticker}
                  onChange={(event) => setTicker(event.target.value.toUpperCase())}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-transparent text-sm text-text-primary text-mono font-bold focus:outline-none focus:border-primary transition-colors"
                />
              </div>

              {/* Qty + Price */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label mb-1 block">Quantity</label>
                  <input
                    type="text"
                    value={quantity}
                    onChange={(event) => setQuantity(event.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-transparent text-sm text-text-primary text-mono focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
                <div>
                  <label className="label mb-1 block">Price</label>
                  <input
                    type="text"
                    value={price}
                    onChange={(event) => setPrice(event.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-transparent text-sm text-text-primary text-mono focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
              </div>

              {/* Algorithm */}
              <div>
                <label className="label mb-1.5 block">Algorithm</label>
                <div className="flex gap-1.5 flex-wrap">
                  {algoOptions.map((a) => (
                    <button
                      key={a}
                      onClick={() => setAlgo(a)}
                      className={cn(
                        "px-2.5 py-1 rounded-md text-[10px] font-bold text-mono uppercase transition-all",
                        algo === a ? "bg-primary text-text-inverse" : "bg-surface-hover text-text-tertiary hover:text-text-secondary"
                      )}
                    >
                      {a}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick size buttons */}
              <div className="flex gap-1.5">
                {quickSizeOptions.map((option) => (
                  <button
                    key={String(option)}
                    onClick={() => applyQuickSize(option)}
                    className="flex-1 py-1 rounded-md bg-surface-hover text-[10px] text-text-tertiary font-bold text-mono hover:bg-primary/10 hover:text-primary transition-colors"
                  >
                    {typeof option === "number" ? `${option}%` : option}
                  </button>
                ))}
              </div>

              {/* Execute */}
              <button
                onClick={() => {
                  void submitOrder();
                }}
                disabled={isSubmitting}
                className={cn(
                  "w-full py-3 rounded-lg font-bold text-sm text-mono uppercase tracking-wider transition-all disabled:opacity-60 disabled:cursor-not-allowed",
                  side === "BUY"
                    ? "bg-primary text-text-inverse glow-md hover:opacity-90"
                    : "bg-magenta text-white hover:opacity-90",
                )}
              >
                {isSubmitting ? "Submitting..." : `Execute ${side === "BUY" ? "Buy" : "Sell"}`}
              </button>
              {submitMessage ? <p className="text-[10px] text-text-tertiary text-mono">{submitMessage}</p> : null}
            </div>
          </Card>

          {/* L2 Depth */}
          <Card>
            <CardTitle>Level 2 Book</CardTitle>
            <div className="mt-3 space-y-0.5 text-mono text-xs">
              {/* Asks */}
              {topAsks.map((ask) => (
                <div key={ask.price} className="flex items-center justify-between py-0.5">
                  <span className="text-text-tertiary w-16" />
                  <span className="text-loss font-bold">{ask.price.toFixed(2)}</span>
                  <span className="text-text-secondary w-16 text-right">{ask.size.toLocaleString()}</span>
                </div>
              ))}
              {/* Spread */}
              <div className="flex items-center justify-center py-1 border-y border-border/50">
                <span className="text-[10px] text-text-tertiary">SPREAD: ${execution.spread.toFixed(4)}</span>
              </div>
              {/* Bids */}
              {topBids.map((bid) => (
                <div key={bid.price} className="flex items-center justify-between py-0.5">
                  <span className="text-text-secondary w-16">{bid.size.toLocaleString()}</span>
                  <span className="text-primary font-bold">{bid.price.toFixed(2)}</span>
                  <span className="text-text-tertiary w-16" />
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Center - Chart + Positions */}
        <div className="lg:col-span-6 space-y-6">
          {/* Price Chart */}
          <Card>
            <CardHeader>
              <CardTitle>{normalizedTicker} — Live Chart</CardTitle>
              <div className="flex gap-1">
                {timeframeOptions.map((tf) => (
                  <button
                    key={tf.label}
                    onClick={() => setTimeframe(tf.value)}
                    className={cn(
                      "px-2 py-0.5 rounded text-[10px] font-bold text-mono transition-colors",
                      timeframe === tf.value ? "bg-primary text-text-inverse" : "text-text-tertiary hover:text-text-secondary"
                    )}
                  >
                    {tf.label}
                  </button>
                ))}
              </div>
            </CardHeader>
            <PriceChart data={chartData} />
          </Card>

          {/* Active Positions */}
          <Card className="p-0 overflow-hidden">
            <div className="p-6 pb-3">
              <CardTitle>Active Positions</CardTitle>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-surface-hover/50">
                    <th className="text-left py-2 px-4 label">Symbol</th>
                    <th className="text-center py-2 px-4 label">Side</th>
                    <th className="text-right py-2 px-4 label">Qty</th>
                    <th className="text-right py-2 px-4 label">Avg Price</th>
                    <th className="text-right py-2 px-4 label">Mark</th>
                    <th className="text-right py-2 px-4 label">Unrealized P&L</th>
                  </tr>
                </thead>
                <tbody>
                  {execution.positions.map((p) => (
                    <tr key={p.instrument} className="border-b border-border/50 hover:bg-surface-hover transition-colors">
                      <td className="py-2.5 px-4 text-mono font-bold text-text-primary">{p.instrument}</td>
                      <td className="py-2.5 px-4 text-center">
                        <Badge variant={p.side === "LONG" ? "long" : "short"}>{p.side}</Badge>
                      </td>
                      <td className="py-2.5 px-4 text-right text-mono text-text-secondary">{p.size.toLocaleString()}</td>
                      <td className="py-2.5 px-4 text-right text-mono text-text-secondary">{formatCurrency(p.entry_price)}</td>
                      <td className="py-2.5 px-4 text-right text-mono text-text-primary">{formatCurrency(p.mark_price)}</td>
                      <td className={cn("py-2.5 px-4 text-right text-mono font-bold", p.unrealized_pnl >= 0 ? "text-gain" : "text-loss")}>
                        {p.unrealized_pnl >= 0 ? "+" : ""}{formatCurrency(p.unrealized_pnl)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Right - Execution Log */}
        <div className="lg:col-span-3 space-y-6">
          <Card>
            <CardTitle>Local Ledger (Simulated)</CardTitle>
            <div className="mt-3 space-y-2 text-xs text-mono">
              <div className="flex items-center justify-between">
                <span className="text-text-tertiary">Cash</span>
                <span className="text-text-primary font-bold">{formatCurrency(ledger.cash)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-text-tertiary">Holdings</span>
                <span className="text-text-primary font-bold">{Object.keys(ledger.holdings).length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-text-tertiary">Ledger Events</span>
                <span className="text-text-primary font-bold">{ledger.history.length}</span>
              </div>
            </div>
          </Card>

          <Card className="h-full">
            <CardTitle>Execution Log</CardTitle>
            <div className="mt-4 space-y-3 max-h-150 overflow-y-auto">
              {orderLog.map((order) => {
                const statusColor = order.status === "FILLED" ? "border-l-primary bg-primary/5" :
                  order.status === "CANCELLED" ? "border-l-loss opacity-80" :
                  order.status === "PENDING" ? "border-l-gold bg-gold/5" :
                  "border-l-text-tertiary bg-surface-hover/50";
                return (
                  <div key={order.id} className={cn("border-l-2 pl-3 py-2 rounded-r-lg text-xs", statusColor)}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-text-tertiary text-mono">[{formatLogTime(order.timestamp)}]</span>
                      <Badge variant={order.status === "FILLED" ? "success" : order.status === "CANCELLED" ? "danger" : "warning"}>
                        {order.status}
                      </Badge>
                    </div>
                    <p className="text-text-primary text-mono font-bold">
                      {order.ticker} {order.side === "BUY" ? "+" : "-"}{order.quantity.toLocaleString()} @ {formatCurrency(order.price)}
                    </p>
                    {order.route && (
                      <p className="text-text-tertiary text-mono mt-0.5">Routed to {order.route}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
