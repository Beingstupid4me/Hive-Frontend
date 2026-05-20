"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { Search, Bell, Sun, Moon } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { LiveIndicator } from "@/components/ui/StatusIndicator";
import { siteNavItems } from "@/lib/site-nav";
import { useApiResource } from "@/lib/hooks/useApiResource";
import { useWebSocket } from "@/lib/hooks/useWebSocket";
import { systemStatusFallback } from "@/lib/api/fallbacks";
import type { SystemStatusResponse } from "@/lib/api/types";

export function Header() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [latencyMs, setLatencyMs] = useState<number>(systemStatusFallback.system.latency_ms);
  const pathname = usePathname();
  const { data: shell } = useApiResource<SystemStatusResponse>("/system/status", {
    initialData: systemStatusFallback,
    refreshMs: 8_000,
  });

  const handleLatencyMessage = useCallback((payload: Record<string, unknown>) => {
    const clientTs = Number(payload.client_ts ?? 0);
    if (!Number.isFinite(clientTs) || clientTs <= 0) {
      return;
    }
    const measured = Math.max(1, Math.round(performance.now() - clientTs));
    setLatencyMs(measured);
  }, []);

  const heartbeatPayload = useCallback(() => ({ client_ts: performance.now() }), []);

  const wsStatus = useWebSocket<Record<string, unknown>, { client_ts: number }>("/api/system/ping", {
    heartbeatMs: 1000,
    getHeartbeatPayload: heartbeatPayload,
    onMessage: handleLatencyMessage,
  });

  const displayLatency = useMemo(
    () => (wsStatus.connected ? latencyMs : shell.system.latency_ms),
    [latencyMs, shell.system.latency_ms, wsStatus.connected],
  );

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.classList.toggle("dark", next === "dark");
    document.documentElement.classList.toggle("light", next === "light");
  }

  function isActiveLink(label: string, href: string) {
    if (label === "Terminal") {
      return pathname.startsWith("/terminal") && !pathname.startsWith("/terminal/execution");
    }

    if (label === "Execute") {
      return pathname === "/execute" || pathname.startsWith("/terminal/execution");
    }

    return pathname === href;
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 border-b border-border bg-surface/80 backdrop-blur-xl">
      <div className="flex items-center justify-between h-full px-6">
        {/* Left */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-text-inverse font-black text-sm">H</span>
            </div>
            <span className="text-lg font-bold text-text-primary tracking-tight">Hive Research</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {siteNavItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  "px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors",
                  isActiveLink(item.label, item.href)
                    ? "text-primary"
                    : "text-text-secondary hover:text-text-primary"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Right */}
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-hover text-text-tertiary text-xs">
            <LiveIndicator />
            <span className="text-mono">System Latency: {displayLatency}ms</span>
          </div>

          <div className="relative hidden lg:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
            <input
              type="text"
              placeholder="Search signals, tickers, logs…"
              className="w-64 pl-9 pr-3 py-2 rounded-lg border border-border bg-transparent text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-surface-hover transition-colors"
          >
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <button className="relative p-2 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-surface-hover transition-colors">
            <Bell className="w-4 h-4" />
            {shell.alerts.unread_count > 0 ? (
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-loss" />
            ) : null}
          </button>

          <span className="text-[10px] text-text-tertiary text-mono hidden lg:block">
            {shell.system.clock_est}
          </span>

          <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
            <span className="text-xs font-bold text-primary">{shell.user.initials}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
