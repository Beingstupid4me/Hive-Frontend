import Link from "next/link";
import { Activity, ArrowUpRight, Gauge, Radar, ShieldCheck, Sparkles } from "lucide-react";
import { MarketingFooter } from "@/components/layout/MarketingFooter";
import { MarketingHeader } from "@/components/layout/MarketingHeader";
import { serverGet } from "@/lib/api/server";
import { landingOverviewFallback } from "@/lib/api/fallbacks";
import type { LandingOverviewResponse } from "@/lib/api/types";
import { formatCompactNumber } from "@/lib/utils";

const deskIconMap: Record<string, typeof Radar> = {
  "Macro Regime": Radar,
  "Alpha Factory": Sparkles,
  "Risk Portfolio": ShieldCheck,
  "Execution Desk": Gauge,
};

export default async function Home() {
  let overview: LandingOverviewResponse = landingOverviewFallback;

  try {
    overview = await serverGet<LandingOverviewResponse>("/landing/overview");
  } catch {
    overview = landingOverviewFallback;
  }

  const operatingStats = [
    {
      label: "24H Aggregate Volume",
      value: `$${formatCompactNumber(overview.market.aggregate_volume_24h)}`,
      tone: "text-gain",
    },
    {
      label: "Avg Execution Latency",
      value: `${overview.execution.avg_latency_ms.toFixed(3)} ms`,
      tone: "text-primary",
    },
    {
      label: "Signal Confidence",
      value: `${overview.alpha.signal_confidence_score.toFixed(1)} / 100`,
      tone: "text-gain",
    },
    {
      label: "Global Active Nodes",
      value: overview.infrastructure.global_nodes_online.toLocaleString(),
      tone: "text-text-secondary",
    },
  ];

  const deskCards = overview.platform.desks.slice(0, 3).map((desk) => ({
    title: desk.name,
    detail: desk.summary,
    href: desk.href,
    icon: deskIconMap[desk.name] ?? Activity,
  }));

  const methodologyStages = overview.methodology.stages;
  const signalTape = overview.market.signal_tape;
  const heroParts = overview.platform.hero.headline.split(" for ");
  const hasHeroSplit = heroParts.length > 1;
  const heroLead = heroParts[0] ?? overview.platform.hero.headline;
  const heroTail = heroParts.slice(1).join(" for ");

  return (
    <div className="min-h-screen bg-bg text-text-primary">
      <MarketingHeader />

      <main className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-12">
        <section className="grid items-center gap-10 py-12 lg:grid-cols-2 lg:gap-16 lg:py-20">
          <div className="flex flex-col gap-7">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-surface/40 px-3 py-1">
              <span className="size-1.5 animate-pulse rounded-full bg-primary" />
              <span className="text-[10px] uppercase tracking-[0.2em] text-text-tertiary text-mono">
                Institutional Protocol {overview.platform.protocol_version}
              </span>
            </div>

            <div className="space-y-4">
              <h1 className="text-5xl font-light leading-[1.05] tracking-tight text-text-primary md:text-6xl lg:text-7xl">
                {hasHeroSplit ? (
                  <>
                    {heroLead}
                    <br />
                    for
                    <br />
                    <span className="font-serif italic text-primary">
                      {heroTail}
                    </span>
                  </>
                ) : (
                  overview.platform.hero.headline
                )}
              </h1>
              <p className="max-w-xl text-base font-light leading-relaxed text-text-secondary md:text-xl">
                {overview.platform.hero.subcopy}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/terminal/macro-desk"
                className="inline-flex h-12 min-w-[210px] items-center justify-center rounded-sm bg-primary px-6 text-[11px] font-black uppercase tracking-[0.15em] text-text-inverse transition-transform hover:scale-[1.02]"
              >
                Initialize Terminal
              </Link>
              <Link
                href="/methodology"
                className="inline-flex h-12 min-w-[210px] items-center justify-center rounded-sm border border-border bg-transparent px-6 text-[11px] font-black uppercase tracking-[0.15em] text-text-primary transition-colors hover:bg-surface-hover"
              >
                View Methodology
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 rounded-full bg-primary/10 blur-3xl" />
            <div className="relative overflow-hidden rounded-xl border border-border bg-surface/30 p-4 backdrop-blur-md">
              <div className="mb-4 flex items-center justify-between border-b border-border px-1 pb-3">
                <div className="flex gap-1.5">
                  <span className="size-2 rounded-full bg-surface-hover" />
                  <span className="size-2 rounded-full bg-surface-hover" />
                  <span className="size-2 rounded-full bg-surface-hover" />
                </div>
                <span className="text-[9px] uppercase tracking-[0.2em] text-text-tertiary text-mono">
                  Global Liquidity Heatmap
                </span>
              </div>
              <div className="h-[290px] rounded border border-border bg-gradient-to-br from-surface via-bg to-bg p-4">
                <div className="relative h-full overflow-hidden rounded border border-border bg-surface/30">
                  <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(var(--accent-primary)_0.8px,transparent_0.8px)] [background-size:22px_22px]" />
                  <svg
                    viewBox="0 0 600 220"
                    className="absolute bottom-2 left-2 right-2 h-[75%] w-[96%]"
                    preserveAspectRatio="none"
                  >
                    <defs>
                      <linearGradient id="heroChartGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--accent-primary)" stopOpacity="0.35" />
                        <stop offset="100%" stopColor="var(--accent-primary)" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M0 170 C 80 140, 140 190, 210 145 C 280 105, 320 180, 380 130 C 450 75, 520 90, 600 35 L 600 220 L 0 220 Z"
                      fill="url(#heroChartGrad)"
                    />
                    <path
                      d="M0 170 C 80 140, 140 190, 210 145 C 280 105, 320 180, 380 130 C 450 75, 520 90, 600 35"
                      fill="none"
                      stroke="var(--accent-primary)"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border border-border bg-surface/20">
          <div className="grid divide-y divide-border sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4">
            {operatingStats.map((stat) => (
              <article key={stat.label} className="space-y-2 p-6">
                <p className="text-[10px] uppercase tracking-[0.2em] text-text-tertiary text-mono">{stat.label}</p>
                <p className={`text-3xl font-light tracking-tight text-mono ${stat.tone}`}>{stat.value}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="py-20">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <p className="label text-primary">Platform Surfaces</p>
              <h2 className="mt-2 text-3xl font-light tracking-tight text-text-primary sm:text-4xl">
                Built as Specialized Desks, Not Generic Dashboards
              </h2>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {deskCards.map((card) => {
              const Icon = card.icon;
              return (
                <article key={card.title} className="rounded-xl border border-border bg-surface p-6">
                  <Icon className="size-5 text-primary" />
                  <h3 className="mt-4 text-xl font-bold text-text-primary">{card.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-text-secondary">{card.detail}</p>
                  <Link
                    href={card.href}
                    className="mt-5 inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.14em] text-primary"
                  >
                    Open Desk <ArrowUpRight className="size-3.5" />
                  </Link>
                </article>
              );
            })}
          </div>
        </section>

        <section className="grid gap-6 border-y border-border py-20 lg:grid-cols-[1.2fr_1fr]">
          <div className="space-y-5">
            <p className="label text-primary">Decision Pipeline</p>
            <h2 className="text-3xl font-light tracking-tight sm:text-4xl">A Disciplined Loop From Signal to Execution</h2>
            <p className="max-w-2xl text-sm leading-relaxed text-text-secondary">
              Hive Research workflows are designed to make decision quality observable.
              Every stage exposes assumptions, confidence, and risk posture before capital is routed.
            </p>

            <div className="space-y-4">
              {methodologyStages.map((stage, idx) => (
                <div key={stage} className="flex gap-3 rounded-lg border border-border bg-surface/40 p-4">
                  <span className="mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">
                    {idx + 1}
                  </span>
                  <p className="text-sm text-text-secondary">{stage}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4 rounded-xl border border-border bg-surface/35 p-6">
            <div className="flex items-center justify-between">
              <p className="label">Signal Tape</p>
              <Activity className="size-4 text-primary" />
            </div>
            {signalTape.map((row) => (
              <div key={row.region} className="flex items-center justify-between border-b border-border/70 py-3 text-sm last:border-b-0">
                <span className="text-text-secondary text-mono">{row.region}</span>
                <div className="text-right">
                  <p className="text-text-primary text-mono">{row.value > 0 ? "+" : ""}{row.value.toFixed(2)}</p>
                  <p className="text-[11px] text-text-tertiary">{row.status}</p>
                </div>
              </div>
            ))}
            <div className="rounded-lg border border-border bg-bg/50 p-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-4 text-primary" />
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-text-primary">Risk Guardrails Active</p>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-text-secondary">
                Guardrail state: <span className="font-bold text-text-primary">{overview.risk.guardrail_status}</span>.
                Constraint checks are enforced pre-trade for concentration, liquidity profile, and drawdown thresholds.
              </p>
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="rounded-2xl border border-border bg-surface/35 p-8 sm:p-10 lg:p-12">
            <p className="label text-primary">Institutional Onboarding</p>
            <h2 className="mt-3 text-3xl font-light tracking-tight sm:text-4xl">
              {overview.platform.onboarding.headline}
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-text-secondary">
              Start with a focused desk rollout, integrate your mandate constraints, and expand to a full
              research-to-execution pipeline with governance and monitoring included.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href={overview.platform.onboarding.cta_primary_href}
                className="inline-flex h-11 items-center justify-center rounded-lg bg-primary px-5 text-[11px] font-black uppercase tracking-[0.14em] text-text-inverse"
              >
                Request Access
              </Link>
              <Link
                href={overview.platform.onboarding.cta_secondary_href}
                className="inline-flex h-11 items-center justify-center rounded-lg border border-border px-5 text-[11px] font-black uppercase tracking-[0.14em] text-text-primary"
              >
                Learn More
              </Link>
            </div>
          </div>
        </section>
      </main>

      <MarketingFooter />
    </div>
  );
}
