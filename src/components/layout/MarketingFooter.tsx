import Link from "next/link";
import { footerCompanyLinks, footerLegalLinks, footerPlatformLinks } from "@/lib/site-nav";

export function MarketingFooter() {
  return (
    <footer className="border-t border-border bg-surface/25">
      <div className="mx-auto grid max-w-[1440px] gap-10 px-4 py-12 sm:px-6 lg:grid-cols-12 lg:px-12 lg:py-16">
        <div className="space-y-4 lg:col-span-4">
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-sm bg-primary">
              <span className="text-[11px] font-black text-text-inverse">H</span>
            </div>
            <span className="text-sm font-black uppercase tracking-[0.18em] text-text-primary">Hive Research</span>
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-text-secondary">
            Institutional research and execution intelligence built for teams that operate under real market pressure.
            Calm surfaces, precise signals, and disciplined decision support.
          </p>
          <div className="flex items-center gap-2 rounded-lg border border-border bg-bg/40 p-2">
            <input
              type="email"
              placeholder="Institutional email"
              className="h-10 flex-1 rounded border border-transparent bg-transparent px-3 text-sm text-text-primary placeholder:text-text-tertiary focus:border-border focus:outline-none"
            />
            <button className="h-10 rounded bg-primary px-4 text-[11px] font-black uppercase tracking-[0.14em] text-text-inverse">
              Subscribe
            </button>
          </div>
        </div>

        <div className="lg:col-span-2">
          <p className="label mb-4">Company</p>
          <div className="space-y-2.5">
            {footerCompanyLinks.map((item) => (
              <Link key={item.label} href={item.href} className="block text-sm text-text-secondary transition-colors hover:text-text-primary">
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="lg:col-span-3">
          <p className="label mb-4">Platform</p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
            {footerPlatformLinks.map((item) => (
              <Link key={item.label} href={item.href} className="text-sm text-text-secondary transition-colors hover:text-text-primary">
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="lg:col-span-3">
          <p className="label mb-4">Legal & Support</p>
          <div className="space-y-2.5">
            {footerLegalLinks.map((item) => (
              <Link key={item.label} href={item.href} className="block text-sm text-text-secondary transition-colors hover:text-text-primary">
                {item.label}
              </Link>
            ))}
            <Link href="/in-progress" className="block text-sm text-text-secondary transition-colors hover:text-text-primary">
              Documentation
            </Link>
          </div>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="mx-auto flex max-w-[1440px] flex-col items-start justify-between gap-3 px-4 py-5 sm:flex-row sm:items-center sm:px-6 lg:px-12">
          <p className="text-[11px] text-text-tertiary text-mono">
            © 2026 Hive Research Institutional Group. All rights reserved.
          </p>
          <p className="text-[11px] text-text-tertiary text-mono">
            Built for institutional use only.
          </p>
        </div>
      </div>
    </footer>
  );
}
