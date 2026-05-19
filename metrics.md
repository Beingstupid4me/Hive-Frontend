# Frontend Metrics Contract (Backend Data Requirements)

## Scope
This document lists every metric/data point currently displayed in the frontend and expected from backend services. It is organized by route and shared UI areas.

## Conventions
- Number format: `font-mono tabular-nums` for all changing numeric values.
- Currency: USD unless instrument-specific quoting is provided.
- Percentages: signed where directional (`+/-`).
- Timestamps: ISO 8601 in API payloads; formatted in UI.
- Refresh strategy:
  - `stream`: sub-second to 5s.
  - `near-real-time`: 15s to 60s.
  - `batch`: minute/hour/day.

---

## 1) Global Shell Metrics (Header + Sidebar)

| Metric Key | UI Label | Type | Example | Refresh | Used In |
|---|---|---:|---|---|---|
| `system.latency_ms` | Latency | number | 14 | stream | top header badge |
| `system.clock_est` | EST clock | string/timestamp | `09:47:45 EST` | 1s | top header |
| `system.status` | System Online | enum | `ONLINE` | stream | sidebar footer |
| `alerts.unread_count` | notifications dot/count | number | 1 | near-real-time | bell icon |
| `user.initials` | user avatar initials | string | `QR` | session | header avatar |

---

## 2) Landing (`/`)

### 2.1 Hero + Protocol
| Metric Key | UI Label | Type | Example | Refresh |
|---|---|---:|---|---|
| `platform.protocol_version` | Institutional Protocol vX | string | `v4.0.2` | deploy/version |
| `platform.hero.headline` | hero heading | string | `Precision Execution for Sovereign capital.` | cms/static |
| `platform.hero.subcopy` | hero description | string | text block | cms/static |

### 2.2 Operating Snapshot Strip
| Metric Key | UI Label | Type | Example | Refresh |
|---|---|---:|---|---|
| `market.aggregate_volume_24h` | 24H Aggregate Volume | number | 4201000000 | near-real-time |
| `execution.avg_latency_ms` | Avg Execution Latency | number | 0.038 | stream |
| `alpha.signal_confidence_score` | Signal Confidence | number | 94.2 | near-real-time |
| `infrastructure.global_nodes_online` | Global Active Nodes | integer | 1024 | near-real-time |

### 2.3 Platform Surfaces Cards
| Metric Key | UI Label | Type | Example | Refresh |
|---|---|---:|---|---|
| `platform.desks[]` | desk card rows | array<{name,summary,href,status}> | 3 cards | cms/static or near-real-time |
| `platform.desks[].status` | desk status | enum | `ACTIVE` | near-real-time |

### 2.4 Decision Pipeline + Signal Tape
| Metric Key | UI Label | Type | Example | Refresh |
|---|---|---:|---|---|
| `methodology.stages[]` | pipeline stages | array<string> | 4 rows | cms/static |
| `market.signal_tape[]` | regional tape values | array<{region,value,status}> | 4 rows | near-real-time |
| `risk.guardrail_status` | guardrail state | enum | `ACTIVE` | stream |

### 2.5 Institutional Onboarding CTA
| Metric Key | UI Label | Type | Example | Refresh |
|---|---|---:|---|---|
| `platform.onboarding.headline` | CTA heading | string | text block | cms/static |
| `platform.onboarding.cta_primary_href` | primary CTA URL | string | `/contact` | cms/static |
| `platform.onboarding.cta_secondary_href` | secondary CTA URL | string | `/about` | cms/static |

---

## 3) Public Marketing Pages

### 3.1 About (`/about`)
| Metric Key | UI Label | Type | Example | Refresh |
|---|---|---:|---|---|
| `about.hero.title` | page heading | string | `Research-First Infrastructure...` | cms/static |
| `about.principles[]` | operating principles | array<string> | 4 items | cms/static |
| `about.highlights[]` | capability cards | array<{title,body}> | 3 cards | cms/static |

### 3.2 Methodology (`/methodology`)
| Metric Key | UI Label | Type | Example | Refresh |
|---|---|---:|---|---|
| `methodology.hero.title` | page heading | string | `From Data to Decision` | cms/static |
| `methodology.stages[]` | methodology stage cards | array<{title,detail}> | 4 cards | cms/static |
| `methodology.governance_note` | governance copy | string | text block | cms/static |

### 3.3 Contact (`/contact`)
| Metric Key | UI Label | Type | Example | Refresh |
|---|---|---:|---|---|
| `contact.form.submit` | submit endpoint | POST URL | `/api/contact` | on submit |
| `contact.form.success_message` | success message | string | text block | on submit |
| `contact.response_window_hours` | response SLA | number | 24 | cms/config |

### 3.4 Execute (`/execute`) and In-Progress (`/in-progress`)
| Metric Key | UI Label | Type | Example | Refresh |
|---|---|---:|---|---|
| `execute.status` | execute page status | enum | `IN_PROGRESS` | deploy/config |
| `placeholder.title` | placeholder title | string | `This Page Is In Progress` | cms/static |
| `placeholder.description` | placeholder copy | string | text block | cms/static |

---

## 4) Macro Desk (`/terminal/macro-desk`)

### 4.1 Summary Cards
| Metric Key | UI Label | Type | Example | Refresh |
|---|---|---:|---|---|
| `regime.current_state` | Current Regime | enum | `LOW_VOL_BULL` | near-real-time |
| `regime.confidence` | Confidence | number (0-1) | 0.89 | near-real-time |
| `macro.volatility_index` | Volatility Index | number | 14.28 | near-real-time |
| `macro.volatility_change_pct` | Volatility delta | number | -2.1 | near-real-time |
| `macro.liquidity_score` | Liquidity Score | number | 89.4 | near-real-time |
| `macro.liquidity_change_pct` | Liquidity delta | number | 5.2 | near-real-time |
| `macro.correlation_skew` | Correlation Skew | number | 0.12 | near-real-time |

### 4.2 Market Weather + Probabilities
| Metric Key | UI Label | Type | Example | Refresh |
|---|---|---:|---|---|
| `regime.state_probabilities` | Bull/Bear/Sideways/Transition | object | `{LOW_VOL_BULL:0.821,...}` | near-real-time |
| `regime.weather_label` | weather text | string | `Low Vol Bull` | near-real-time |

### 4.3 HMM Time-Series
| Metric Key | UI Label | Type | Example | Refresh |
|---|---|---:|---|---|
| `regime.history` | stacked probability series | array<{date,bull_prob,bear_prob,neutral_prob,price}> | 90 rows | near-real-time |

### 4.4 Latent/Cross-Asset/Log
| Metric Key | UI Label | Type | Example | Refresh |
|---|---|---:|---|---|
| `macro.latent_factors[]` | Greek Skew, Gamma, Tail Risk, Carry | array<{name,value}> | `0.45` | near-real-time |
| `macro.cross_asset_context[]` | DXY/SPX/GOLD/VIX | array<{asset,value}> | `SPX:+0.91` | near-real-time |
| `regime.transition_events[]` | transition log lines | array<{ts,event,detail,severity}> | log rows | stream |
| `regime.transition_matrix` | full matrix | record<from,to,prob> | 4x4 | near-real-time |

---

## 5) Alpha Factory (`/terminal/alpha-factory`)

### 5.1 Header/Meta
| Metric Key | UI Label | Type | Example | Refresh |
|---|---|---:|---|---|
| `alpha.model_version` | model version | string | `LightGBM v4.2` | deploy |
| `alpha.model_confidence_pct` | Model Confidence | number | 88.4 | near-real-time |
| `alpha.decay_bps_per_hr` | Alpha Decay | number | 0.12 | near-real-time |

### 5.2 Ranked Decile Table
| Metric Key | UI Label | Type | Example | Refresh |
|---|---|---:|---|---|
| `alpha.rankings[]` | row payload | array<object> | see fields below | near-real-time |
| `alpha.rankings[].rank` | Rank | integer | 1 | near-real-time |
| `alpha.rankings[].ticker` | Ticker | string | `NVDA.OQ` | near-real-time |
| `alpha.rankings[].company` | Company | string | `Nvidia Corp` | batch/near-real-time |
| `alpha.rankings[].alpha_score` | Alpha Score | number | 2.482 | near-real-time |
| `alpha.rankings[].volatility_30d` | Vol 30D | number | 24.2 | near-real-time |
| `alpha.rankings[].shap_drivers` | top SHAP labels | string[] | `[Mom,Vol,Quality]` | batch/near-real-time |
| `alpha.rankings[].action` | action class | enum | `TOP_LONG` | near-real-time |

### 5.3 Feature/Log/Footer Stats
| Metric Key | UI Label | Type | Example | Refresh |
|---|---|---:|---|---|
| `alpha.feature_importance[]` | Feature Importance bars | array<{name,importance}> | 8 rows | batch or every model run |
| `alpha.execution_log[]` | log lines | array<{ts,action,detail,severity}> | rows | stream |
| `alpha.long_portfolio_return_pct` | Long Portfolio | number | 12.4 | near-real-time |
| `alpha.short_portfolio_return_pct` | Short Portfolio | number | -8.1 | near-real-time |
| `alpha.information_ratio` | Information Ratio | number | 1.84 | near-real-time |
| `alpha.system_health_score` | health bar segments | number | 0-1 or 0-4 | stream |
| `alpha.batch_id` | processing batch id | string | `#9421` | stream |

---

## 6) Risk Desk (`/terminal/risk-desk`)

### 6.1 Top Metrics
| Metric Key | UI Label | Type | Example | Refresh |
|---|---|---:|---|---|
| `risk.total_exposure_usd` | Total Exposure | number | 420691200 | near-real-time |
| `risk.total_exposure_change_pct` | exposure change | number | 2.4 | near-real-time |
| `risk.diversification_ratio` | Diversification Ratio | number | 0.84 | near-real-time |
| `risk.diversification_change` | diversification delta | number | 0.15 | near-real-time |
| `risk.cluster_count` | Cluster Count | integer | 6 | near-real-time |
| `risk.expected_volatility_pct` | Expected Volatility | number | 14.2 | near-real-time |
| `risk.system_status` | System Status | enum/string | `STABLE` | stream |

### 6.2 Cluster Risk Allocation
| Metric Key | UI Label | Type | Example | Refresh |
|---|---|---:|---|---|
| `risk.clusters[]` | cluster payload | array<object> | 6 rows | near-real-time |
| `risk.clusters[].cluster_id` | cluster id | string | `C-01` | near-real-time |
| `risk.clusters[].label` | sector label | string | `TECH` | near-real-time |
| `risk.clusters[].weight` | portfolio weight | number (0-1) | 0.202 | near-real-time |
| `risk.clusters[].risk_contribution` | risk contribution | number (0-1) | 0.0825 | near-real-time |
| `risk.clusters[].assets` | member assets | string[] | `[NVDA,AMD,MSFT]` | near-real-time |

### 6.3 Active Orders
| Metric Key | UI Label | Type | Example | Refresh |
|---|---|---:|---|---|
| `risk.active_orders[]` | active risk orders | array<{ticker,side,shares,price,status}> | rows | stream |

---

## 7) Fin-OSS Agent (`/terminal/agent`)

### 7.1 Summary Cards
| Metric Key | UI Label | Type | Example | Refresh |
|---|---|---:|---|---|
| `agent.regime_label` | Current Regime (HMM) | string | `High Volatility` | near-real-time |
| `agent.regime_sigma_change_pct` | sigma change | number | 15.2 | near-real-time |
| `agent.alpha_signal_strength` | Alpha Signal Strength | number | 0.842 | near-real-time |
| `agent.alpha_signal_change_pct` | signal change | number | -2.1 | near-real-time |
| `agent.rotation_label` | Rotation Index label | string | `Aggressive` | near-real-time |
| `agent.rotation_rate_pct_per_day` | rotation rate | number | 12.5 | near-real-time |

### 7.2 Briefing/Reasoning/Logs
| Metric Key | UI Label | Type | Example | Refresh |
|---|---|---:|---|---|
| `agent.daily_brief_markdown` | Daily Quantitative Brief | string | paragraph text | batch daily + on demand |
| `agent.suggested_command` | suggested execution command | string | `rebalance_portfolio(...)` | on generation |
| `agent.regime_heatmap` | heatmap grid values | array<{x,y,intensity,state}> | 12x6 cells | near-real-time |
| `agent.worker_stream[]` | terminal worker logs | array<{ts,level,message}> | rows | stream |
| `agent.tools[]` | tool buttons/availability | array<{tool,enabled}> | list | session/config |
| `agent.query_input` | user query text | string | free text | on submit |

---

## 8) Backtest Engine (`/terminal/backtest`)

### 8.1 KPI Strip
| Metric Key | UI Label | Type | Example | Refresh |
|---|---|---:|---|---|
| `backtest.sharpe_ratio` | Sharpe Ratio | number | 2.84 | per run |
| `backtest.max_drawdown_pct` | Max Drawdown | number | -4.12 | per run |
| `backtest.win_rate_pct` | Win Rate | number | 64.2 | per run |
| `backtest.profit_factor` | Profit Factor | number | 1.92 | per run |
| `backtest.date_range` | test date range | object | start/end | per run |

### 8.2 Equity Curve + Trades
| Metric Key | UI Label | Type | Example | Refresh |
|---|---|---:|---|---|
| `backtest.equity_curve[]` | strategy/benchmark series | array<{date,strategy,benchmark}> | 252 points | per run |
| `backtest.trades[]` | simulation log rows | array<{date,ticker,model_version,signal,entry,exit,pnl_pct,contribution_bps}> | rows | per run |

### 8.3 Risk/Stats/Params Panel
| Metric Key | UI Label | Type | Example | Refresh |
|---|---|---:|---|---|
| `backtest.annual_volatility_pct` | Vol (Ann.) | number | 14.2 | per run |
| `backtest.skewness` | Skewness | number | 0.42 | per run |
| `backtest.kurtosis` | Kurtosis | number | 3.12 | per run |
| `backtest.sortino_ratio` | Sortino Ratio | number | 3.15 | per run |
| `backtest.avg_win_usd` | Avg Win | number | 1245.00 | per run |
| `backtest.avg_loss_usd` | Avg Loss | number | -542.10 | per run |
| `backtest.max_consecutive_wins` | Max Consec. Wins | integer | 8 | per run |
| `backtest.kelly_criterion_pct` | Kelly Criterion | number | 18.4 | per run |
| `backtest.model_params` | model parameter block | object/string | optimizer, lr, lookback | per run |

---

## 9) Trade Execution (`/terminal/execution`)

### 9.1 Connectivity + Order Entry
| Metric Key | UI Label | Type | Example | Refresh |
|---|---|---:|---|---|
| `execution.connectivity_endpoint` | data center endpoint | string | `NY4-PROD` | stream |
| `execution.connectivity_latency_ms` | endpoint latency | number | 0.4 | stream |
| `execution.order_side` | Buy/Sell | enum | `BUY` | user state |
| `execution.order_ticker` | ticker | string | `NVDA` | user state |
| `execution.order_quantity` | quantity | number | 2500 | user state |
| `execution.order_price` | price | number | 784.22 | user state/live |
| `execution.order_algo` | algo | enum | `VWAP` | user state |
| `execution.quick_size_options[]` | quick size presets | array<number/string> | 25/50/75/MAX | config |

### 9.2 Order Book + Chart + Positions
| Metric Key | UI Label | Type | Example | Refresh |
|---|---|---:|---|---|
| `execution.l2_bids[]` | L2 bid rows | array<{price,size}> | rows | stream |
| `execution.l2_asks[]` | L2 ask rows | array<{price,size}> | rows | stream |
| `execution.spread` | spread value | number | 0.02 | stream |
| `execution.candles[]` | OHLCV series | array<{time,open,high,low,close,volume}> | 60 bars | stream |
| `execution.timeframe` | selected timeframe | enum | `1m` | user state |
| `execution.positions[]` | active positions rows | array<{instrument,side,size,entry_price,mark_price,unrealized_pnl}> | rows | stream |
| `execution.orders[]` | execution log rows | array<{id,timestamp,ticker,side,quantity,price,status,route}> | rows | stream |

---

## 10) Portfolio Optimization (`/terminal/portfolio`)

### 10.1 Solver Inputs
| Metric Key | UI Label | Type | Example | Refresh |
|---|---|---:|---|---|
| `optimizer.target_return_pct` | Target Return | number | 12.50 | user input |
| `optimizer.volatility_cap_pct` | Volatility Cap | number | 8.00 | user input |
| `optimizer.max_asset_weight_pct` | Max Asset Weight | number | 15.0 | user input |
| `optimizer.sector_neutrality` | Sector Neutrality | boolean | true | user input |
| `optimizer.status` | Solver Ready/Running | enum | `READY` | stream |

### 10.2 Frontier + Rebalance
| Metric Key | UI Label | Type | Example | Refresh |
|---|---|---:|---|---|
| `optimizer.frontier_points[]` | scatter points | array<{risk_pct,return_pct}> | N points | per run |
| `optimizer.frontier_curve[]` | efficient frontier line | array<{risk_pct,return_pct}> | N points | per run |
| `optimizer.optimal_point` | highlighted solution | {risk_pct,return_pct} | `{13,13}` | per run |
| `optimizer.solver_log[]` | solver iterations | array<{ts?,message,level}> | lines | stream during solve |
| `optimizer.rebalance[]` | rebalance table rows | array<{asset,ticker,current_pct,optimized_pct,delta}> | rows | per run |
| `optimizer.turnover_rate_pct` | Turnover Rate | number | 14.2 | per run |

---

## 11) Shared Domain Contracts Already Present in Frontend Types
The backend can align directly to these existing interfaces:
- `RegimeData`
- `AlphaRanking`
- `HRPData`
- `BacktestMetrics`
- `BacktestTrade`
- `Order`
- `Position`
- `OptimizedAllocation`

File: `src/types/index.ts`

---

## 12) Suggested API Grouping
- `GET /api/system/status` -> shell metrics
- `GET /api/landing/overview` -> landing pulse + stack
- `GET /api/macro/regime` and `GET /api/macro/history`
- `GET /api/alpha/rankings`, `GET /api/alpha/features`, `GET /api/alpha/logs`
- `GET /api/risk/summary`, `GET /api/risk/clusters`, `GET /api/risk/orders`
- `GET /api/agent/brief`, `GET /api/agent/stream`, `POST /api/agent/query`
- `GET /api/backtest/:runId`
- `GET /api/execution/book`, `GET /api/execution/candles`, `GET /api/execution/positions`, `GET /api/execution/orders`, `POST /api/execution/order`
- `POST /api/optimizer/solve`, `GET /api/optimizer/:jobId`

This list is aligned to what is currently rendered and can be implemented incrementally route-by-route.
