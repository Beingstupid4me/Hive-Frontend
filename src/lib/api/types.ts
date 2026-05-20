export type RegimeState = "LOW_VOL_BULL" | "HIGH_VOL_BEAR" | "SIDEWAYS" | "TRANSITION";

export interface SystemStatusResponse {
  system: {
    latency_ms: number;
    clock_est: string;
    status: string;
  };
  alerts: {
    unread_count: number;
  };
  user: {
    initials: string;
  };
}

export interface LandingOverviewResponse {
  platform: {
    protocol_version: string;
    hero: {
      headline: string;
      subcopy: string;
    };
    desks: Array<{
      name: string;
      summary: string;
      href: string;
      status: string;
    }>;
    onboarding: {
      headline: string;
      cta_primary_href: string;
      cta_secondary_href: string;
    };
  };
  market: {
    aggregate_volume_24h: number;
    signal_tape: Array<{
      region: string;
      value: number;
      status: string;
    }>;
  };
  execution: {
    avg_latency_ms: number;
  };
  alpha: {
    signal_confidence_score: number;
  };
  infrastructure: {
    global_nodes_online: number;
  };
  methodology: {
    stages: string[];
  };
  risk: {
    guardrail_status: string;
  };
}

export interface AboutPageResponse {
  about: {
    hero: {
      title: string;
    };
    principles: string[];
    highlights: Array<{
      title: string;
      body: string;
    }>;
  };
}

export interface MethodologyPageResponse {
  methodology: {
    hero: {
      title: string;
    };
    stages: Array<{
      title: string;
      detail: string;
    }>;
    governance_note: string;
  };
}

export interface ContactMetaResponse {
  contact: {
    form: {
      submit: string;
      success_message: string;
    };
    response_window_hours: number;
  };
}

export interface ExecutePageResponse {
  execute: {
    status: string;
  };
  placeholder: {
    title: string;
    description: string;
  };
}

export interface ContactSubmitRequest {
  name: string;
  email: string;
  organization?: string;
  message: string;
}

export interface ContactSubmitResponse {
  accepted: boolean;
  name: string;
  email: string;
  message: string;
}

export interface MacroPayloadResponse {
  regime: {
    current_state: RegimeState;
    confidence: number;
    state_probabilities: Record<RegimeState, number>;
    weather_label: string;
    transition_matrix: Record<RegimeState, Record<RegimeState, number>>;
    history: Array<{
      date: string;
      bull_prob: number;
      bear_prob: number;
      neutral_prob: number;
      price: number;
    }>;
    transition_events: Array<{
      ts: string;
      event: string;
      detail: string;
      severity: string;
    }>;
  };
  macro: {
    volatility_index: number;
    volatility_change_pct: number;
    liquidity_score: number;
    liquidity_change_pct: number;
    correlation_skew: number;
    latent_factors: Array<{
      name: string;
      value: number;
    }>;
    cross_asset_context: Array<{
      asset: string;
      value: number;
    }>;
  };
}

export interface AlphaPayloadResponse {
  alpha: {
    model_version: string;
    model_confidence_pct: number;
    decay_bps_per_hr: number;
    long_portfolio_return_pct: number;
    short_portfolio_return_pct: number;
    information_ratio: number;
    system_health_score: number;
    batch_id: string;
    rolling_rank_ic: {
      window_days: number;
      threshold: number;
      current_rank_ic: number;
      status: "HEALTHY" | "DECAY";
      warning: string;
      series: Array<{
        date: string;
        rank_ic: number;
      }>;
    };
    rankings: Array<{
      rank: number;
      ticker: string;
      company: string;
      alpha_score: number;
      volatility_30d: number;
      shap_drivers: string[];
      action: "TOP_LONG" | "TOP_SHORT" | "NEUTRAL";
    }>;
    feature_importance: Array<{
      name: string;
      importance: number;
    }>;
    execution_log: Array<{
      ts: string;
      action: string;
      detail: string;
      severity: string;
    }>;
  };
}

export interface AlphaRollingIcResponse {
  alpha: {
    rolling_rank_ic: {
      window_days: number;
      threshold: number;
      current_rank_ic: number;
      status: "HEALTHY" | "DECAY";
      warning: string;
      series: Array<{
        date: string;
        rank_ic: number;
      }>;
    };
  };
}

export interface AlphaShapDetailResponse {
  alpha: {
    shap_detail: {
      ticker: string;
      company: string;
      rank: number;
      action: "TOP_LONG" | "TOP_SHORT" | "NEUTRAL";
      alpha_score: number;
      predicted_return_pct: number;
      drivers: Array<{
        feature: string;
        feature_label: string;
        impact_pct: number;
        direction: "positive" | "negative";
        narrative: string;
      }>;
      waterfall: Array<{
        label: string;
        impact_pct: number;
        cumulative_pct: number;
      }>;
    };
  };
}

export interface RiskPayloadResponse {
  risk: {
    total_exposure_usd: number;
    total_exposure_change_pct: number;
    diversification_ratio: number;
    diversification_change: number;
    cluster_count: number;
    expected_volatility_pct: number;
    system_status: string;
    clusters: Array<{
      cluster_id: string;
      label: string;
      weight: number;
      risk_contribution: number;
      assets: string[];
    }>;
    dendrogram: {
      root: string;
      nodes: Array<{
        id: string;
        label: string;
        level: number;
        weight: number;
        risk_contribution?: number;
      }>;
      links: Array<{
        source: string;
        target: string;
        distance: number;
      }>;
    };
    active_orders: Array<{
      ticker: string;
      side: "BUY" | "SELL";
      shares: number;
      price: number;
      status: string;
      timestamp?: string;
    }>;
  };
}

export interface BacktestPayloadResponse {
  run_id: string;
  backtest: {
    sharpe_ratio: number;
    max_drawdown_pct: number;
    win_rate_pct: number;
    profit_factor: number;
    date_range: {
      start: string | null;
      end: string | null;
    };
    equity_curve: Array<{
      date: string;
      strategy: number;
      benchmark: number;
    }>;
    trades: Array<{
      date: string;
      ticker: string;
      model_version: string;
      signal: "LONG" | "SHORT" | "REBALANCE";
      entry: number;
      exit: number;
      pnl_pct: number;
      contribution_bps: number;
    }>;
    annual_volatility_pct: number;
    skewness: number;
    kurtosis: number;
    sortino_ratio: number;
    avg_win_usd: number;
    avg_loss_usd: number;
    max_consecutive_wins: number;
    kelly_criterion_pct: number;
    model_params: Record<string, unknown>;
  };
}

export interface ExecutionPayloadResponse {
  execution: {
    connectivity_endpoint: string;
    connectivity_latency_ms: number;
    quick_size_options: Array<number | string>;
    l2_bids: Array<{ price: number; size: number }>;
    l2_asks: Array<{ price: number; size: number }>;
    spread: number;
    candles: Array<{
      time: string;
      open: number;
      high: number;
      low: number;
      close: number;
      volume: number;
    }>;
    timeframe: string;
    positions: Array<{
      instrument: string;
      side: "LONG" | "SHORT";
      size: number;
      entry_price: number;
      mark_price: number;
      unrealized_pnl: number;
    }>;
    orders: Array<{
      id: string;
      timestamp: string;
      ticker: string;
      side: "BUY" | "SELL";
      quantity: number;
      price: number;
      status: "FILLED" | "ROUTED" | "CANCELLED" | "PENDING" | "NEW_ORD";
      route?: string;
      algo?: string;
      reference_price?: number;
      transaction_cost_bps?: number;
      transaction_cost_usd?: number;
      slippage_bps?: number;
      participation_rate?: number;
      turnover_pct?: number;
    }>;
    ledger: {
      cash: number;
      simulated_aum_usd: number;
      holdings: Record<string, { quantity: number; avg_cost: number }>;
      history: Array<{
        ts: string;
        ticker: string;
        side: "BUY" | "SELL";
        quantity: number;
        reference_price: number;
        executed_price: number;
        notional: number;
        turnover_pct: number;
        transaction_cost_bps: number;
        transaction_cost_usd: number;
        slippage_bps: number;
        avg_daily_volume_shares: number;
        participation_rate: number;
      }>;
    };
    capacity: {
      aum_usd: number;
      reference_ticker: string;
      sample_trade_notional_usd: number;
      avg_daily_volume_shares: number;
      participation_rate: number;
      tc_bps: number;
      slippage_bps: number;
      total_cost_bps: number;
      projected_annual_return_pct: number;
      projected_sharpe: number;
    };
    order_side: "BUY" | "SELL";
    order_ticker: string;
    order_quantity: number;
    order_price: number;
    order_algo: string;
  };
}

export interface ExecutionOrderRequest {
  ticker: string;
  side: "BUY" | "SELL";
  quantity: number;
  price?: number;
  algo: string;
}

export interface ExecutionOrderResponse {
  accepted: boolean;
  order: {
    id: string;
    timestamp: string;
    ticker: string;
    side: "BUY" | "SELL";
    quantity: number;
    price: number;
    status: string;
    route?: string;
    algo?: string;
    reference_price?: number;
    transaction_cost_bps?: number;
    transaction_cost_usd?: number;
    slippage_bps?: number;
    participation_rate?: number;
    turnover_pct?: number;
  };
  ledger?: {
    cash: number;
    simulated_aum_usd: number;
    holdings: Record<string, { quantity: number; avg_cost: number }>;
    history: Array<Record<string, unknown>>;
  };
}

export interface ExecutionCapacityRequest {
  aum_usd: number;
  ticker: string;
}

export interface ExecutionCapacityResponse {
  execution: {
    capacity: {
      aum_usd: number;
      reference_ticker: string;
      sample_trade_notional_usd: number;
      avg_daily_volume_shares: number;
      participation_rate: number;
      tc_bps: number;
      slippage_bps: number;
      total_cost_bps: number;
      projected_annual_return_pct: number;
      projected_sharpe: number;
    };
  };
}

export interface OptimizerSolveRequest {
  target_return_pct: number;
  volatility_cap_pct: number;
  max_asset_weight_pct: number;
  sector_neutrality: boolean;
  tickers?: string[];
}

export interface OptimizerPayload {
  status: string;
  target_return_pct: number;
  volatility_cap_pct: number;
  max_asset_weight_pct: number;
  sector_neutrality: boolean;
  frontier_points: Array<{ risk_pct: number; return_pct: number }>;
  frontier_curve: Array<{ risk_pct: number; return_pct: number }>;
  optimal_point: { risk_pct: number; return_pct: number };
  solver_log: Array<{ ts: string; message: string; level: string }>;
  rebalance: Array<{
    asset: string;
    ticker: string;
    current_pct: number;
    optimized_pct: number;
    delta: number;
  }>;
  turnover_rate_pct: number;
}

export interface OptimizerCurrentResponse {
  job_id: string | null;
  status: string;
  optimizer: OptimizerPayload;
}

export interface OptimizerSolveResponse {
  job_id: string;
  status: string;
  optimizer: OptimizerPayload;
}

export interface AgentQueryRequest {
  query: string;
}

export interface AgentQueryResponse {
  query: string;
  answer: string;
  suggested_command: string;
}

export interface MetricsSnapshotResponse {
  agent: {
    regime_label: string;
    regime_sigma_change_pct: number;
    alpha_signal_strength: number;
    alpha_signal_change_pct: number;
    rotation_label: string;
    rotation_rate_pct_per_day: number;
    daily_brief_markdown: string;
    suggested_command: string;
    regime_heatmap: Array<{
      x: number;
      y: number;
      intensity: number;
      state: "Bull" | "Transition" | "Bear";
    }>;
    worker_stream: Array<{
      ts: string;
      level: string;
      message: string;
      seq?: number;
    }>;
    tools: Array<{
      tool: string;
      enabled: boolean;
    }>;
    query_input: string;
  };
}
