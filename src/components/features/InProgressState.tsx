import Link from "next/link";

interface InProgressStateProps {
  title: string;
  description: string;
}

export function InProgressState({ title, description }: InProgressStateProps) {
  return (
    <div className="mx-auto w-full max-w-3xl rounded-2xl border border-border bg-surface/50 p-8 sm:p-10">
      <p className="label mb-3 text-primary">In Progress</p>
      <h1 className="text-3xl font-black tracking-tight text-text-primary">{title}</h1>
      <p className="mt-3 text-sm leading-relaxed text-text-secondary">{description}</p>

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        <Link
          href="/"
          className="inline-flex h-11 items-center justify-center rounded-lg border border-border text-sm font-semibold text-text-secondary transition-colors hover:border-border-accent hover:text-text-primary"
        >
          Back to Home
        </Link>
        <Link
          href="/terminal/macro-desk"
          className="inline-flex h-11 items-center justify-center rounded-lg bg-primary text-sm font-bold uppercase tracking-[0.12em] text-text-inverse transition-opacity hover:opacity-90"
        >
          Open Terminal
        </Link>
      </div>
    </div>
  );
}
