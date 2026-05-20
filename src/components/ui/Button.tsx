"use client";

import { cn } from "@/lib/utils";
import { forwardRef } from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", isLoading, className, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          "inline-flex items-center justify-center font-bold uppercase tracking-wider transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-bg disabled:opacity-50 disabled:cursor-not-allowed",
          size === "sm" && "px-3 py-1.5 text-[10px] rounded",
          size === "md" && "px-5 py-2.5 text-xs rounded-lg",
          size === "lg" && "px-8 py-3.5 text-sm rounded-lg",
          variant === "primary" && "bg-primary text-text-inverse hover:bg-primary-hover glow-sm hover:glow-md active:scale-[0.98]",
          variant === "secondary" && "border border-border bg-transparent text-text-primary hover:bg-surface-hover active:scale-[0.98]",
          variant === "ghost" && "bg-transparent text-text-secondary hover:text-text-primary hover:bg-surface-hover",
          variant === "danger" && "bg-loss/10 text-loss border border-loss/20 hover:bg-loss/20 active:scale-[0.98]",
          className
        )}
        {...props}
      >
        {isLoading ? (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        ) : null}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
