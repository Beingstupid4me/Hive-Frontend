"use client";

import { cn, formatPercentage, getValueColor } from "@/lib/utils";
import { motion } from "framer-motion";

interface StatCardProps {
  label: string;
  value: string;
  change?: number;
  changeLabel?: string;
  icon?: React.ReactNode;
  className?: string;
  delay?: number;
}

export function StatCard({ label, value, change, changeLabel, icon, className, delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0, 0, 0.2, 1] }}
      className={cn(
        "rounded-xl border border-border bg-surface p-5 transition-all duration-200 hover:border-border-accent",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="label mb-2">{label}</p>
          <p className="text-2xl font-bold text-text-primary text-mono">{value}</p>
          {change !== undefined && (
            <p className={cn("text-xs text-mono mt-1", getValueColor(change))}>
              {formatPercentage(change)}
              {changeLabel && <span className="text-text-tertiary ml-1">{changeLabel}</span>}
            </p>
          )}
        </div>
        {icon && (
          <div className="text-text-tertiary">{icon}</div>
        )}
      </div>
    </motion.div>
  );
}
