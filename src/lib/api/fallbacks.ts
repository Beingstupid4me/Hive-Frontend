import type {
  AboutPageResponse,
  AlphaPayloadResponse,
  BacktestPayloadResponse,
  ContactMetaResponse,
  ExecutePageResponse,
  ExecutionPayloadResponse,
  LandingOverviewResponse,
  MacroPayloadResponse,
  MethodologyPageResponse,
  MetricsSnapshotResponse,
  OptimizerCurrentResponse,
  RiskPayloadResponse,
  SystemStatusResponse,
} from "@/lib/api/types";

export const systemStatusFallback: SystemStatusResponse = {
  system: {
    latency_ms: 14,
    clock_est: "--:--:-- EST",
    status: "ONLINE",
  },
  alerts: {
    unread_count: 0,
  },
  user: {
    initials: "QR",
  },
};

export const landingOverviewFallback: LandingOverviewResponse = {
  platform: {
    protocol_version: "v4.0.2",
    hero: {
      headline: "Precision Execution for Sovereign Capital.",
      subcopy: "Institutional-grade alpha generation with transparent risk controls.",
    },
    desks: [
      {
        name: "Macro Regime",
        summary: "HMM/GMM state tracking with transition diagnostics.",
        href: "/terminal/macro-desk",
        status: "ACTIVE",
      },
      {
        name: "Alpha Factory",
        summary: "Cross-sectional ranking, SHAP diagnostics, and decile analytics.",
        href: "/terminal/alpha-factory",
        status: "ACTIVE",
      },
      {
        name: "Risk Portfolio",
        summary: "HRP allocation, exposure budgets, and active risk controls.",
        href: "/terminal/risk-desk",
        status: "ACTIVE",
      },
    ],
    onboarding: {
      headline: "Engage the Institutional Onboarding Desk",
      cta_primary_href: "/contact",
      cta_secondary_href: "/about",
    },
  },
  market: {
    aggregate_volume_24h: 4_200_000_000,
    signal_tape: [
      { region: "US Large Cap", value: 1.22, status: "UP" },
      { region: "US Growth", value: 0.81, status: "UP" },
      { region: "US Energy", value: -0.26, status: "DOWN" },
      { region: "US Defensives", value: 0.47, status: "UP" },
    ],
  },
  execution: {
    avg_latency_ms: 0.038,
  },
  alpha: {
    signal_confidence_score: 94.2,
  },
  infrastructure: {
    global_nodes_online: 1024,
  },
  methodology: {
    stages: [
      "Classify market regime before exposure decisions.",
      "Generate multi-model directional and cross-sectional signals.",
      "Translate conviction to bounded risk and sizing logic.",
      "Execute, measure, and recycle diagnostics into model updates.",
    ],
  },
  risk: {
    guardrail_status: "ACTIVE",
  },
};

export const aboutPageFallback: AboutPageResponse = {
  about: {
    hero: {
      title: "Research-First Infrastructure For Institutional Capital",
    },
    principles: [
      "Feature engineering before architecture complexity",
      "Risk controls before return maximization",
      "Ensemble intelligence over monolithic models",
      "Glass-box interpretability over opaque black boxes",
    ],
    highlights: [
      {
        title: "Meta-Quant Pipeline",
        body: "Cross-sectional ranking, meta-labeling, and regime-aware sizing.",
      },
      {
        title: "Institutional Risk Engine",
        body: "HRP, dynamic leverage overlays, and transaction-cost-aware rebalancing.",
      },
      {
        title: "Operational Explainability",
        body: "Every recommendation ships with feature-level rationale and audit trail.",
      },
    ],
  },
};

export const methodologyPageFallback: MethodologyPageResponse = {
  methodology: {
    hero: {
      title: "From Data To Decision",
    },
    stages: [
      {
        title: "Data Foundation",
        detail: "Adjusted OHLCV ingestion with survivorship-aware universe handling.",
      },
      {
        title: "Feature Factory",
        detail: "Rolling rank IC filtering, orthogonalization, and feature diagnostics.",
      },
      {
        title: "Meta-Quant Modeling",
        detail: "Ensemble LightGBM actors with meta-labeling and calibrated probabilities.",
      },
      {
        title: "Risk & Deployment",
        detail: "Regime-aware HRP portfolio construction and monitored live execution.",
      },
    ],
    governance_note:
      "All model outputs are constrained by risk budgets, drawdown controls, and explainability checks.",
  },
};

export const contactMetaFallback: ContactMetaResponse = {
  contact: {
    form: {
      submit: "/api/contact",
      success_message: "Your request has been queued. A team member will reach out within SLA.",
    },
    response_window_hours: 24,
  },
};

export const executePageFallback: ExecutePageResponse = {
  execute: {
    status: "IN_PROGRESS",
  },
  placeholder: {
    title: "This Page Is In Progress",
    description: "Execution integrations are being hardened for production routing.",
  },
};

export const macroPayloadFallback: MacroPayloadResponse = {
  regime: {
    current_state: "TRANSITION",
    confidence: 0.5,
    state_probabilities: {
      LOW_VOL_BULL: 0.25,
      HIGH_VOL_BEAR: 0.25,
      SIDEWAYS: 0.25,
      TRANSITION: 0.25,
    },
    weather_label: "Transition",
    transition_matrix: {
      LOW_VOL_BULL: { LOW_VOL_BULL: 0.5, HIGH_VOL_BEAR: 0.1, SIDEWAYS: 0.2, TRANSITION: 0.2 },
      HIGH_VOL_BEAR: { LOW_VOL_BULL: 0.1, HIGH_VOL_BEAR: 0.5, SIDEWAYS: 0.2, TRANSITION: 0.2 },
      SIDEWAYS: { LOW_VOL_BULL: 0.2, HIGH_VOL_BEAR: 0.2, SIDEWAYS: 0.4, TRANSITION: 0.2 },
      TRANSITION: { LOW_VOL_BULL: 0.25, HIGH_VOL_BEAR: 0.25, SIDEWAYS: 0.25, TRANSITION: 0.25 },
    },
    history: [],
    transition_events: [],
  },
  macro: {
    volatility_index: 14,
    volatility_change_pct: 0,
    liquidity_score: 80,
    liquidity_change_pct: 0,
    correlation_skew: 0,
    latent_factors: [],
    cross_asset_context: [],
  },
};

export const alphaPayloadFallback: AlphaPayloadResponse = {
  alpha: {
    model_version: "02-alpha-lgb-ensemble-v1",
    model_confidence_pct: 0,
    decay_bps_per_hr: 0,
    long_portfolio_return_pct: 0,
    short_portfolio_return_pct: 0,
    information_ratio: 0,
    system_health_score: 0,
    batch_id: "#N/A",
    rolling_rank_ic: {
      window_days: 30,
      threshold: 0.02,
      current_rank_ic: 0.0,
      status: "DECAY",
      warning: "Model drift unavailable.",
      series: [],
    },
    rankings: [],
    feature_importance: [],
    execution_log: [],
  },
};

export const riskPayloadFallback: RiskPayloadResponse = {
  risk: {
    total_exposure_usd: 0,
    total_exposure_change_pct: 0,
    diversification_ratio: 0,
    diversification_change: 0,
    cluster_count: 0,
    expected_volatility_pct: 0,
    system_status: "UNKNOWN",
    clusters: [],
    dendrogram: {
      root: "ROOT",
      nodes: [],
      links: [],
    },
    active_orders: [],
  },
};

export const backtestPayloadFallback: BacktestPayloadResponse = {
  run_id: "latest",
  backtest: {
    sharpe_ratio: 0,
    max_drawdown_pct: 0,
    win_rate_pct: 0,
    profit_factor: 0,
    date_range: {
      start: null,
      end: null,
    },
    equity_curve: [],
    trades: [],
    annual_volatility_pct: 0,
    skewness: 0,
    kurtosis: 0,
    sortino_ratio: 0,
    avg_win_usd: 0,
    avg_loss_usd: 0,
    max_consecutive_wins: 0,
    kelly_criterion_pct: 0,
    model_params: {},
  },
};

export const executionPayloadFallback: ExecutionPayloadResponse = {
  execution: {
    connectivity_endpoint: "NY4-HIST",
    connectivity_latency_ms: 1.2,
    quick_size_options: [25, 50, 75, "MAX"],
    l2_bids: [],
    l2_asks: [],
    spread: 0,
    candles: [],
    timeframe: "1d",
    positions: [],
    orders: [],
    ledger: {
      cash: 100_000,
      simulated_aum_usd: 100_000,
      holdings: {},
      history: [],
    },
    capacity: {
      aum_usd: 100_000,
      reference_ticker: "AAPL",
      sample_trade_notional_usd: 0,
      avg_daily_volume_shares: 0,
      participation_rate: 0,
      tc_bps: 5,
      slippage_bps: 0,
      total_cost_bps: 5,
      projected_annual_return_pct: 0,
      projected_sharpe: 0,
    },
    order_side: "BUY",
    order_ticker: "AAPL",
    order_quantity: 0,
    order_price: 0,
    order_algo: "VWAP",
  },
};

export const optimizerCurrentFallback: OptimizerCurrentResponse = {
  job_id: null,
  status: "READY",
  optimizer: {
    status: "READY",
    target_return_pct: 12.5,
    volatility_cap_pct: 8,
    max_asset_weight_pct: 15,
    sector_neutrality: true,
    frontier_points: [],
    frontier_curve: [],
    optimal_point: { risk_pct: 0, return_pct: 0 },
    solver_log: [],
    rebalance: [],
    turnover_rate_pct: 0,
  },
};

export const metricsSnapshotFallback: MetricsSnapshotResponse = {
  agent: {
    regime_label: "Transition",
    regime_sigma_change_pct: 0,
    alpha_signal_strength: 0,
    alpha_signal_change_pct: 0,
    rotation_label: "Balanced",
    rotation_rate_pct_per_day: 0,
    daily_brief_markdown: "Briefing unavailable.",
    suggested_command: "rebalance_portfolio(mode='hrp_meta_kelly', guardrails='strict')",
    regime_heatmap: [],
    worker_stream: [],
    tools: [],
    query_input: "",
  },
};
