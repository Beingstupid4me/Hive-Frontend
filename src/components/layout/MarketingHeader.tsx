"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { siteNavItems } from "@/lib/site-nav";

export function MarketingHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-bg/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-4 sm:px-6 lg:px-12">
        <div className="flex items-center gap-6 lg:gap-12">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex size-6 items-center justify-center rounded-sm bg-primary">
              <span className="text-[11px] font-black text-text-inverse">H</span>
            </div>
            <p className="text-sm font-black uppercase tracking-[0.2em] text-text-primary">Hive Research</p>
          </Link>

          <nav className="hidden items-center gap-7 lg:flex">
            {siteNavItems.map((item) => {
              const active =
                pathname === item.href ||
                (item.href.startsWith("/terminal") && pathname.startsWith("/terminal"));

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={cn(
                    "text-[11px] font-bold uppercase tracking-[0.14em] transition-colors",
                    active ? "text-primary" : "text-text-secondary hover:text-text-primary"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          <div className="relative hidden xl:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-tertiary" />
            <input
              type="text"
              placeholder="Search research, methods, and desks..."
              className="w-72 rounded border border-border bg-surface/50 py-2 pl-9 pr-3 text-[12px] text-text-primary placeholder:text-text-tertiary focus:border-primary focus:outline-none"
            />
          </div>
          <Link
            href="/terminal/macro-desk"
            className="rounded-sm bg-primary px-4 py-2 text-[11px] font-black uppercase tracking-[0.15em] text-text-inverse transition-all hover:brightness-110 sm:px-6"
          >
            Enter Terminal
          </Link>
        </div>
      </div>
    </header>
  );
}
