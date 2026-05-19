# Remaining Work Register

## Snapshot
This register reflects the current UI state after the latest information architecture pass.
The home hero was preserved, post-hero sections were redesigned, generic page routes were added,
and an explicit in-progress path now covers unfinished surfaces.

## Completed In Latest Iteration
- Home page now keeps the existing hero while replacing the remaining content with multiple structured sections.
- Footer is now expanded into a longer multi-column institutional-style layout.
- Header/IA separation is implemented:
  - Marketing + terminal header use generic links (`Terminal`, `Execute`, `Methodology`, `About Us`, `Contact`).
  - Terminal sidebar keeps desk-level links (`Macro Desk`, `Alpha Factory`, `Risk Desk`, etc.).
- Added top-level pages:
  - `/about`
  - `/methodology`
  - `/contact`
  - `/execute`
- Added reusable in-progress route and state:
  - `/in-progress`
  - `/terminal/settings` now resolves to an in-progress surface instead of a dead route.
- Added custom `not-found` page (`/404` handling via `src/app/not-found.tsx`).
- Updated documentation baselines:
  - `metrics.md` updated for current landing/public page structure.
  - `remaining.md` refreshed (this file).

---

## Open Pending Items

### 1) Backend Data Wiring (High)
- Status: pending
- Scope: most screens still render static/mock values.
- Needed:
  - Implement API integration by route using the contracts in `metrics.md`.
  - Add loading, retry, and failure states.

### 2) Action Wiring (High)
- Status: pending
- Scope: interactive controls are mostly visual-only.
- Examples:
  - Contact submit action is not wired.
  - Execution order actions are not connected.
  - Solver/backtest/agent controls are not connected.

### 3) Streaming + Realtime Infrastructure (High)
- Status: pending
- Scope: no production stream layer for logs/order book/system telemetry.
- Needed:
  - WebSocket/SSE channels.
  - Reconnect/backoff and stale-data handling.

### 4) Authentication and Entitlements (High)
- Status: pending
- Scope: terminal pages are still publicly accessible.
- Needed:
  - Auth guard.
  - Role/desk-level permissions.

### 5) Search and Notifications (Medium)
- Status: pending
- Scope:
  - Header search fields are not wired.
  - Notification bell has no data source/panel.

### 6) Mobile Terminal Navigation (Medium)
- Status: pending
- Scope: terminal sidebar has no dedicated drawer flow for small screens.
- Needed:
  - Mobile nav trigger in header.
  - Drawer with active route state.

### 7) Accessibility and Test Coverage (Medium)
- Status: pending
- Scope:
  - Additional aria labels and keyboard flow validation needed.
  - No broad automated UI/regression suite yet.

### 8) Settings and Placeholder Routes Completion (Medium)
- Status: pending
- Scope: `/in-progress`, `/execute` detail areas, and `/terminal/settings` need full production implementations.

---

## Suggested Next Execution Order
1. Wire backend contracts for Macro Desk + Execution first.
2. Implement core actions (order submit, backtest run, contact endpoint).
3. Add auth/entitlements for terminal routes.
4. Add realtime stream transport and resilience logic.
5. Close placeholders (`/terminal/settings`, `/execute` deep workflows) and add tests.
