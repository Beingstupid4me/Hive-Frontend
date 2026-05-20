import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "success" | "danger" | "warning" | "info" | "long" | "short" | "neutral";

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-primary/10 text-primary border-primary/20",
  success: "bg-gain/10 text-gain border-gain/20",
  danger: "bg-loss/10 text-loss border-loss/20",
  warning: "bg-gold/10 text-gold border-gold/20",
  info: "bg-cyan/10 text-cyan border-cyan/20",
  long: "bg-gain/10 text-gain border-gain/20",
  short: "bg-magenta/10 text-magenta border-magenta/20",
  neutral: "bg-surface-hover text-text-secondary border-border",
};

export function Badge({ variant = "default", children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border text-mono",
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

interface SignalBadgeProps {
  signal: "BUY" | "SELL" | "HOLD";
  confidence?: number;
  className?: string;
}

export function SignalBadge({ signal, confidence, className }: SignalBadgeProps) {
  const variant = signal === "BUY" ? "long" : signal === "SELL" ? "short" : "neutral";
  return (
    <Badge variant={variant} className={className}>
      {signal}
      {confidence !== undefined && <span className="ml-1 opacity-70">{(confidence * 100).toFixed(0)}%</span>}
    </Badge>
  );
}
