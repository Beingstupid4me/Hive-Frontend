export function LiveIndicator() {
  return (
    <span className="relative flex h-2 w-2">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gain opacity-75" />
      <span className="relative inline-flex rounded-full h-2 w-2 bg-gain" />
    </span>
  );
}

export function StatusDot({ status }: { status: "online" | "warning" | "error" | "idle" }) {
  const colors = {
    online: "bg-gain",
    warning: "bg-gold",
    error: "bg-loss",
    idle: "bg-text-tertiary",
  };
  return <span className={`inline-block h-2 w-2 rounded-full ${colors[status]}`} />;
}
