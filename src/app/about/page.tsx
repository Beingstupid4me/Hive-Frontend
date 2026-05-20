import { MarketingFooter } from "@/components/layout/MarketingFooter";
import { MarketingHeader } from "@/components/layout/MarketingHeader";
import { serverGet } from "@/lib/api/server";
import { aboutPageFallback } from "@/lib/api/fallbacks";
import type { AboutPageResponse } from "@/lib/api/types";

export default async function AboutPage() {
  let payload: AboutPageResponse = aboutPageFallback;

  try {
    payload = await serverGet<AboutPageResponse>("/about");
  } catch {
    payload = aboutPageFallback;
  }

  return (
    <div className="min-h-screen bg-bg text-text-primary">
      <MarketingHeader />

      <main className="mx-auto w-full max-w-[1440px] space-y-16 px-4 py-14 sm:px-6 lg:px-12 lg:py-20">
        <section className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="label text-primary">About Hive Research</p>
            <h1 className="mt-3 text-4xl font-black tracking-tight text-text-primary sm:text-5xl">
              {payload.about.hero.title}
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-text-secondary">
              Hive Research exists to compress decision latency without sacrificing rigor.
              We combine regime awareness, systematic signals, and execution intelligence so institutions can act with calm precision.
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-surface/40 p-8">
            <p className="label mb-4">Operating Principles</p>
            <div className="space-y-4 text-sm text-text-secondary">
              {payload.about.principles.map((principle, idx) => (
                <p key={principle}><span className="font-semibold text-text-primary">{idx + 1}.</span> {principle}</p>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-3">
          {payload.about.highlights.map((item) => (
            <article key={item.title} className="rounded-xl border border-border bg-surface p-6">
              <h2 className="text-lg font-bold text-text-primary">{item.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-text-secondary">{item.body}</p>
            </article>
          ))}
        </section>
      </main>

      <MarketingFooter />
    </div>
  );
}
