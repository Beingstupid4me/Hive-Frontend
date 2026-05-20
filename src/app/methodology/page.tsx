import { MarketingFooter } from "@/components/layout/MarketingFooter";
import { MarketingHeader } from "@/components/layout/MarketingHeader";
import { serverGet } from "@/lib/api/server";
import { methodologyPageFallback } from "@/lib/api/fallbacks";
import type { MethodologyPageResponse } from "@/lib/api/types";

export default async function MethodologyPage() {
  let payload: MethodologyPageResponse = methodologyPageFallback;

  try {
    payload = await serverGet<MethodologyPageResponse>("/methodology");
  } catch {
    payload = methodologyPageFallback;
  }

  return (
    <div className="min-h-screen bg-bg text-text-primary">
      <MarketingHeader />

      <main className="mx-auto w-full max-w-[1440px] space-y-14 px-4 py-14 sm:px-6 lg:px-12 lg:py-20">
        <section>
          <p className="label text-primary">Methodology</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">{payload.methodology.hero.title}</h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-text-secondary">
            Our methodology is designed around one idea: decisions should be both fast and defensible.
            Each stage exposes assumptions and risk so teams can act with confidence, not guesswork.
          </p>
        </section>

        <section className="grid gap-6 md:grid-cols-2">
          {payload.methodology.stages.map((stage, idx) => (
            <article key={stage.title} className="rounded-xl border border-border bg-surface p-6">
              <p className="label mb-2">Stage {idx + 1}</p>
              <h2 className="text-xl font-bold text-text-primary">{stage.title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-text-secondary">{stage.detail}</p>
            </article>
          ))}
        </section>

        <section className="rounded-2xl border border-border bg-surface/40 p-8">
          <p className="label mb-3">Model Governance</p>
          <p className="text-sm leading-relaxed text-text-secondary">
            {payload.methodology.governance_note}
          </p>
        </section>
      </main>

      <MarketingFooter />
    </div>
  );
}
