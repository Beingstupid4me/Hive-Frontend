import type { RegimeData, AlphaRanking, HRPData, BacktestMetrics, BacktestTrade, Position, Order, OptimizedAllocation } from "@/types";

export const mockRegimeData: RegimeData = {
  current_regime: "LOW_VOL_BULL",
  confidence: 0.89,
  volatility_index: 14.28,
  liquidity_score: 89.4,
  correlation_skew: 0.12,
  market_sentiment: "GREED",
  transition_probabilities: {
    LOW_VOL_BULL: { LOW_VOL_BULL: 0.821, HIGH_VOL_BEAR: 0.124, SIDEWAYS: 0.045, TRANSITION: 0.01 },
    HIGH_VOL_BEAR: { LOW_VOL_BULL: 0.228, HIGH_VOL_BEAR: 0.642, SIDEWAYS: 0.105, TRANSITION: 0.025 },
    SIDEWAYS: { LOW_VOL_BULL: 0.35, HIGH_VOL_BEAR: 0.15, SIDEWAYS: 0.45, TRANSITION: 0.05 },
    TRANSITION: { LOW_VOL_BULL: 0.3, HIGH_VOL_BEAR: 0.3, SIDEWAYS: 0.2, TRANSITION: 0.2 },
  },
};

export const mockRegimeHistory = Array.from({ length: 90 }, (_, i) => {
  const date = new Date(2025, 11, 12 - (89 - i));
  const bull = i < 30 ? 0.4 + Math.random() * 0.2 : i < 60 ? 0.2 + Math.random() * 0.3 : 0.7 + Math.random() * 0.2;
  return {
    date: date.toISOString().split("T")[0],
    bull_prob: bull,
    bear_prob: Math.max(0, 1 - bull - 0.1 - Math.random() * 0.15),
    neutral_prob: 0.1 + Math.random() * 0.15,
    price: 4200 + i * 3 + Math.random() * 80 - 40,
  };
});

export const mockAlphaRankings: AlphaRanking[] = [
  { rank: 1, ticker: "NVDA.OQ", company: "Nvidia Corp", alpha_score: 2.482, volatility_30d: 24.2, shap_drivers: ["Mom", "Grwth", "Sent"], action: "TOP_LONG" },
  { rank: 2, ticker: "ASML.AS", company: "ASML Holding", alpha_score: 2.155, volatility_30d: 18.5, shap_drivers: ["Quality", "Vol", "Mom"], action: "TOP_LONG" },
  { rank: 3, ticker: "MSFT.OQ", company: "Microsoft Corp", alpha_score: 1.823, volatility_30d: 15.1, shap_drivers: ["Mom", "Quality", "Size"], action: "TOP_LONG" },
  { rank: 4, ticker: "AMZN.OQ", company: "Amazon", alpha_score: 1.541, volatility_30d: 22.3, shap_drivers: ["Grwth", "Mom", "Rev"], action: "TOP_LONG" },
  { rank: 1225, ticker: "JNJ.N", company: "Johnson & Johnson", alpha_score: 0.012, volatility_30d: 12.1, shap_drivers: ["Low Vol", "Yield"], action: "NEUTRAL" },
  { rank: 2449, ticker: "WBA.OQ", company: "Walgreens Boots", alpha_score: -1.944, volatility_30d: 31.2, shap_drivers: ["Leverage", "Rev", "Val"], action: "TOP_SHORT" },
  { rank: 2450, ticker: "INTC.OQ", company: "Intel Corp", alpha_score: -2.210, volatility_30d: 28.4, shap_drivers: ["Earnings", "Tech", "Vol"], action: "TOP_SHORT" },
];

export const mockHRPData: HRPData = {
  total_exposure: 420691200,
  diversification_ratio: 0.84,
  cluster_count: 6,
  system_status: "STABLE",
  expected_volatility: 14.2,
  clusters: [
    { cluster_id: "C-01", label: "TECH", weight: 0.202, risk_contribution: 0.0825, assets: ["NVDA", "AMD", "MSFT"] },
    { cluster_id: "C-02", label: "FINANCIALS", weight: 0.151, risk_contribution: 0.065, assets: ["JPM", "GS", "BAC"] },
    { cluster_id: "C-03", label: "HEALTHCARE", weight: 0.125, risk_contribution: 0.052, assets: ["JNJ", "UNH", "PFE"] },
    { cluster_id: "C-04", label: "ENERGY", weight: 0.180, risk_contribution: 0.078, assets: ["XOM", "CVX", "COP"] },
    { cluster_id: "C-05", label: "CONSUMER", weight: 0.098, risk_contribution: 0.041, assets: ["AMZN", "WMT", "COST"] },
    { cluster_id: "C-06", label: "RESERVE", weight: 0.145, risk_contribution: 0.032, assets: ["GLD", "TLT", "CASH"] },
  ],
};

export const mockBacktestMetrics: BacktestMetrics = {
  sharpe_ratio: 2.84,
  max_drawdown: -4.12,
  win_rate: 64.2,
  profit_factor: 1.92,
  sortino_ratio: 3.12,
  alpha: 14.2,
  beta: 0.42,
  annual_volatility: 14.2,
  skewness: 0.42,
  kurtosis: 3.12,
};

export const mockBacktestTrades: BacktestTrade[] = [
  { date: "2023-11-24 14:30", ticker: "NVDA.US", model_version: "Alpha-v4.2", signal: "LONG", entry: 480.5, exit: 500.3, pnl_pct: 4.12, contribution_bps: 0.82 },
  { date: "2023-11-24 11:15", ticker: "TSLA.US", model_version: "Alpha-v4.2", signal: "SHORT", entry: 238.2, exit: 242.7, pnl_pct: -1.85, contribution_bps: -0.34 },
  { date: "2023-11-23 09:45", ticker: "AAPL.US", model_version: "Alpha-v4.1", signal: "REBALANCE", entry: 189.1, exit: 189.1, pnl_pct: 0, contribution_bps: 0 },
  { date: "2023-11-22 16:00", ticker: "AMD.US", model_version: "Alpha-v4.1", signal: "LONG", entry: 120.5, exit: 123.84, pnl_pct: 2.77, contribution_bps: 0.55 },
  { date: "2023-11-21 10:20", ticker: "MSFT.US", model_version: "Alpha-v4.1", signal: "LONG", entry: 375.2, exit: 379.51, pnl_pct: 1.15, contribution_bps: 0.23 },
  { date: "2023-11-20 13:45", ticker: "GOOGL.US", model_version: "Alpha-v4.0", signal: "SHORT", entry: 137.8, exit: 139.07, pnl_pct: -0.92, contribution_bps: -0.18 },
];

export const mockEquityCurve = Array.from({ length: 252 }, (_, i) => ({
  date: new Date(2023, 0, i + 1).toISOString().split("T")[0],
  strategy: 100 + i * 0.12 + Math.sin(i / 20) * 5 + Math.random() * 2,
  benchmark: 100 + i * 0.06 + Math.sin(i / 25) * 3 + Math.random() * 1.5,
}));

export const mockPositions: Position[] = [
  { instrument: "BTC/USDT.P", side: "LONG", size: 2.45, entry_price: 63890, mark_price: 64242, unrealized_pnl: 862.49 },
  { instrument: "ETH/USDT.P", side: "SHORT", size: 15, entry_price: 3450.5, mark_price: 3422.1, unrealized_pnl: 426 },
  { instrument: "SOL/USDT.P", side: "LONG", size: 120, entry_price: 142.5, mark_price: 144.52, unrealized_pnl: 242.4 },
];

export const mockOrders: Order[] = [
  { id: "1", timestamp: "14:22:01.042", ticker: "BTC/USDT.P", side: "BUY", quantity: 0.15, price: 64242, status: "FILLED", route: "BINANCE_DIRECT" },
  { id: "2", timestamp: "14:21:58.210", ticker: "BTC/USDT.P", side: "BUY", quantity: 1, price: 64242, status: "ROUTED", route: "NASDAQ-PSM" },
  { id: "3", timestamp: "14:21:55.992", ticker: "BTC/USDT.P", side: "BUY", quantity: 0.75, price: 64220, status: "FILLED", route: "CBOE" },
  { id: "4", timestamp: "14:21:49.115", ticker: "AMD", side: "SELL", quantity: 5000, price: 178.4, status: "CANCELLED" },
  { id: "5", timestamp: "14:21:32.441", ticker: "NVDA", side: "BUY", quantity: 500, price: 784.18, status: "FILLED", route: "ARCA" },
  { id: "6", timestamp: "14:21:30.002", ticker: "BTC/USDT.P", side: "BUY", quantity: 2500, price: 64218, status: "PENDING" },
];

export const mockOptimizedAllocations: OptimizedAllocation[] = [
  { asset: "Apple Inc.", ticker: "AAPL", current_pct: 12.42, optimized_pct: 15.0, delta: 2.58 },
  { asset: "Microsoft Corp.", ticker: "MSFT", current_pct: 10.15, optimized_pct: 9.5, delta: -0.65 },
  { asset: "NVIDIA Corp.", ticker: "NVDA", current_pct: 4.88, optimized_pct: 8.2, delta: 3.32 },
  { asset: "Amazon.com Inc.", ticker: "AMZN", current_pct: 8.2, optimized_pct: 6.4, delta: -1.8 },
  { asset: "Alphabet Inc.", ticker: "GOOGL", current_pct: 6.5, optimized_pct: 7.1, delta: 0.6 },
  { asset: "Tesla Inc.", ticker: "TSLA", current_pct: 5.3, optimized_pct: 3.8, delta: -1.5 },
];

export const mockAgentReasoning = `Our LightGBM Alpha model has identified JNJ as a top long candidate for the upcoming session. The signal is driven by a convergence of mean-reversion factors and a significant reduction in tail-risk metrics from the Risk Desk.

Market transitions indicate a shift from defensive positioning towards selective growth. Macro indicators suggest that the current interest rate plateau is being priced in, allowing the Alpha Factory to capture idiosyncratic returns in the healthcare and utilities sectors.`;

export const mockCandlestickData = Array.from({ length: 60 }, (_, i) => {
  const base = 64000 + Math.sin(i / 10) * 200 + Math.random() * 100;
  return {
    time: `T-${60 - i}`,
    open: base,
    high: base + Math.random() * 100,
    low: base - Math.random() * 100,
    close: base + (Math.random() - 0.5) * 150,
    volume: 1000 + Math.random() * 5000,
  };
});
