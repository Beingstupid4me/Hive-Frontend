import { cn } from "@/lib/utils";
import { forwardRef } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: React.ReactNode;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, icon, error, className, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && <label className="label">{label}</label>}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary">{icon}</div>
          )}
          <input
            ref={ref}
            className={cn(
              "w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-text-primary text-mono placeholder:text-text-tertiary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors",
              icon && "pl-10",
              error && "border-loss focus:border-loss focus:ring-loss/30",
              className
            )}
            {...props}
          />
        </div>
        {error && <p className="text-xs text-loss">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
