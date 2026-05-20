"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, BarChart3, Shield, Bot, FlaskConical,
  Crosshair, PieChart, Settings, ChevronLeft, ChevronRight
} from "lucide-react";
import { useState } from "react";
import { LiveIndicator } from "@/components/ui/StatusIndicator";
import { useApiResource } from "@/lib/hooks/useApiResource";
import { systemStatusFallback } from "@/lib/api/fallbacks";
import type { SystemStatusResponse } from "@/lib/api/types";

const navItems = [
  { label: "Macro Desk", href: "/terminal/macro-desk", icon: LayoutDashboard },
  { label: "Alpha Factory", href: "/terminal/alpha-factory", icon: BarChart3 },
  { label: "Risk Desk", href: "/terminal/risk-desk", icon: Shield },
  { label: "Fin-OSS Agent", href: "/terminal/agent", icon: Bot },
  { label: "Backtest", href: "/terminal/backtest", icon: FlaskConical },
  { label: "Execution", href: "/terminal/execution", icon: Crosshair },
  { label: "Portfolio", href: "/terminal/portfolio", icon: PieChart },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const { data: shell } = useApiResource<SystemStatusResponse>("/system/status", {
    initialData: systemStatusFallback,
    refreshMs: 2000,
  });

  return (
    <aside
      className={cn(
        "fixed left-0 top-16 bottom-0 z-40 flex flex-col border-r border-border bg-surface transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo area */}
      <div className={cn("flex items-center gap-3 px-4 py-5 border-b border-border", collapsed && "justify-center")}>
        <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
          <span className="text-primary font-bold text-mono text-sm">H</span>
        </div>
        {!collapsed && (
          <div>
            <p className="text-sm font-bold text-text-primary">Hive Research</p>
            <p className="text-[10px] text-primary uppercase tracking-widest text-mono">Institutional Terminal</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150",
                collapsed && "justify-center px-0",
                isActive
                  ? "bg-primary/10 text-primary border border-primary/20"
                  : "text-text-secondary hover:text-text-primary hover:bg-surface-hover"
              )}
            >
              <Icon className="w-[18px] h-[18px] flex-shrink-0" />
              {!collapsed && <span className="font-medium">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 pb-4 space-y-2">
        {!collapsed && (
          <Link
            href="/terminal/settings"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors"
          >
            <Settings className="w-[18px] h-[18px]" />
            <span>Settings</span>
          </Link>
        )}
        <div className={cn("flex items-center gap-2 px-3 py-2", collapsed && "justify-center")}>
          <LiveIndicator />
          {!collapsed && <span className="text-[10px] text-text-tertiary text-mono">System {shell.system.status}</span>}
        </div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center py-2 text-text-tertiary hover:text-text-primary transition-colors"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
    </aside>
  );
}
