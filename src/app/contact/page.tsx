import { MarketingFooter } from "@/components/layout/MarketingFooter";
import { MarketingHeader } from "@/components/layout/MarketingHeader";
import { ContactForm } from "@/components/features/ContactForm";
import { serverGet } from "@/lib/api/server";
import { contactMetaFallback } from "@/lib/api/fallbacks";
import type { ContactMetaResponse } from "@/lib/api/types";

export default async function ContactPage() {
  let payload: ContactMetaResponse = contactMetaFallback;

  try {
    payload = await serverGet<ContactMetaResponse>("/contact");
  } catch {
    payload = contactMetaFallback;
  }

  return (
    <div className="min-h-screen bg-bg text-text-primary">
      <MarketingHeader />

      <main className="mx-auto w-full max-w-[1440px] space-y-12 px-4 py-14 sm:px-6 lg:px-12 lg:py-20">
        <section>
          <p className="label text-primary">Contact</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">Speak With the Research Desk</h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-text-secondary">
            If you are evaluating institutional deployment, tell us about your mandate and operating constraints.
            We will respond with the right workflow and implementation path.
          </p>
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          <ContactForm
            submitPath={payload.contact.form.submit}
            successMessage={payload.contact.form.success_message}
          />

          <aside className="space-y-4 rounded-xl border border-border bg-surface/40 p-6">
            <div>
              <p className="label mb-1">General</p>
              <p className="text-sm text-text-secondary">research@hiveresearch.ai</p>
            </div>
            <div>
              <p className="label mb-1">Institutional Onboarding</p>
              <p className="text-sm text-text-secondary">onboarding@hiveresearch.ai</p>
            </div>
            <div>
              <p className="label mb-1">Response Window</p>
              <p className="text-sm text-text-secondary">Typically within {payload.contact.response_window_hours} hours</p>
            </div>
          </aside>
        </section>
      </main>

      <MarketingFooter />
    </div>
  );
}
