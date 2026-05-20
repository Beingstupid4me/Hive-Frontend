import Link from "next/link";
import { InProgressState } from "@/components/features/InProgressState";
import { MarketingFooter } from "@/components/layout/MarketingFooter";
import { MarketingHeader } from "@/components/layout/MarketingHeader";
import { serverGet } from "@/lib/api/server";
import { executePageFallback } from "@/lib/api/fallbacks";
import type { ExecutePageResponse } from "@/lib/api/types";

export default async function ExecutePage() {
  let payload: ExecutePageResponse = executePageFallback;

  try {
    payload = await serverGet<ExecutePageResponse>("/execute");
  } catch {
    payload = executePageFallback;
  }

  return (
    <div className="min-h-screen bg-bg text-text-primary">
      <MarketingHeader />
      <main className="mx-auto w-full max-w-[1440px] px-4 py-14 sm:px-6 lg:px-12 lg:py-20">
        <section className="mb-10 rounded-2xl border border-border bg-surface/35 p-8">
          <p className="label text-primary">Execution Overview</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">Institutional Execution Workflows</h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-text-secondary">
            Execution orchestration is currently available inside the terminal execution desk.
            This standalone page is being expanded with policy templates and venue configuration guides.
          </p>
          <Link
            href="/terminal/execution"
            className="mt-6 inline-flex h-11 items-center justify-center rounded-lg bg-primary px-5 text-[11px] font-black uppercase tracking-[0.14em] text-text-inverse"
          >
            Open Execution Desk
          </Link>
        </section>

        <InProgressState
          title={payload.placeholder.title}
          description={payload.placeholder.description}
        />
      </main>
      <MarketingFooter />
    </div>
  );
}
