/* ── Asset State (API Contract) ── */
export interface Forecast {
  dates: string[];
  quantile_5: number[];
  quantile_50: number[];
  quantile_95: number[];
  forecast_volatility: number;
}

export interface MarketContext {
  volume: number;
  volatility_regime: "low" | "medium" | "high";
  order_book_imbalance: number;
  spread: number;
}

export interface ModelMetadata {
  model_version: string;
  model_timestamp: string;
  data_freshness_sec: number;
  drift_score: number;
}

export interface ConfidenceBreakdown {
  model_confidence: number;
  macro_confidence: number;
  technical_confidence: number;
  ensemble_agreement: number;
}

export interface AgentInference {
  signal: "BUY" | "SELL" | "HOLD";
  confidence: number;
  confidence_breakdown: ConfidenceBreakdown;
  reasoning: string;
  macro_factors_considered: string[];
}

export interface RiskContext {
  current_position: string;
  position_size: number;
  max_position_allowed: number;
  stop_loss: number;
  take_profit: number;
  risk_limit_hit: boolean;
}

export interface AssetState {
  ticker: string;
  date: string;
  current_price: number;
  market_context: MarketContext;
  forecast: Forecast;
  model_metadata: ModelMetadata;
  agent_inference: AgentInference;
  risk_context: RiskContext;
  events: {
    upcoming_events: string[];
    news_sentiment_score: number;
    news_sentiment_trend: string;
  };
}

/* ── Regime ── */
export type RegimeState = "LOW_VOL_BULL" | "HIGH_VOL_BEAR" | "SIDEWAYS" | "TRANSITION";

export interface RegimeData {
  current_regime: RegimeState;
  confidence: number;
  volatility_index: number;
  liquidity_score: number;
  correlation_skew: number;
  market_sentiment: string;
  transition_probabilities: Record<RegimeState, Record<RegimeState, number>>;
}

/* ── Alpha Ranking ── */
export interface AlphaRanking {
  rank: number;
  ticker: string;
  company: string;
  alpha_score: number;
  volatility_30d: number;
  shap_drivers: string[];
  action: "TOP_LONG" | "TOP_SHORT" | "NEUTRAL";
}

/* ── Risk / HRP ── */
export interface ClusterAllocation {
  cluster_id: string;
  label: string;
  weight: number;
  risk_contribution: number;
  assets: string[];
}

export interface HRPData {
  total_exposure: number;
  diversification_ratio: number;
  cluster_count: number;
  system_status: string;
  clusters: ClusterAllocation[];
  expected_volatility: number;
}

/* ── Backtest ── */
export interface BacktestTrade {
  date: string;
  ticker: string;
  model_version: string;
  signal: "LONG" | "SHORT" | "REBALANCE";
  entry: number;
  exit: number;
  pnl_pct: number;
  contribution_bps: number;
}

export interface BacktestMetrics {
  sharpe_ratio: number;
  max_drawdown: number;
  win_rate: number;
  profit_factor: number;
  sortino_ratio: number;
  alpha: number;
  beta: number;
  annual_volatility: number;
  skewness: number;
  kurtosis: number;
}

/* ── Execution ── */
export interface Order {
  id: string;
  timestamp: string;
  ticker: string;
  side: "BUY" | "SELL";
  quantity: number;
  price: number;
  status: "FILLED" | "ROUTED" | "CANCELLED" | "PENDING" | "NEW_ORD";
  route?: string;
}

export interface Position {
  instrument: string;
  side: "LONG" | "SHORT";
  size: number;
  entry_price: number;
  mark_price: number;
  unrealized_pnl: number;
}

/* ── Portfolio Optimization ── */
export interface OptimizationParams {
  target_return: number;
  volatility_cap: number;
  max_asset_weight: number;
  sector_neutrality: boolean;
}

export interface OptimizedAllocation {
  asset: string;
  ticker: string;
  current_pct: number;
  optimized_pct: number;
  delta: number;
}

/* ── Navigation ── */
export interface NavItem {
  label: string;
  href: string;
  icon: string;
}
