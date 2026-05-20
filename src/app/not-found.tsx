import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-bg px-4 py-16 text-text-primary sm:px-6 lg:px-12">
      <div className="mx-auto flex w-full max-w-3xl flex-col items-center rounded-2xl border border-border bg-surface/40 p-10 text-center">
        <p className="label text-primary">404</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight">Page Not Found</h1>
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-text-secondary">
          The page you requested does not exist or has moved. Use the links below to continue through Hive Research.
        </p>

        <div className="mt-8 grid w-full gap-3 sm:grid-cols-2">
          <Link
            href="/"
            className="inline-flex h-11 items-center justify-center rounded-lg border border-border text-sm font-semibold text-text-secondary transition-colors hover:border-border-accent hover:text-text-primary"
          >
            Back to Home
          </Link>
          <Link
            href="/terminal/macro-desk"
            className="inline-flex h-11 items-center justify-center rounded-lg bg-primary text-[11px] font-black uppercase tracking-[0.14em] text-text-inverse transition-opacity hover:opacity-90"
          >
            Open Terminal
          </Link>
        </div>
      </div>
    </div>
  );
}
