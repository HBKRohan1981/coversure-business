import Link from "next/link";
import { Logo } from "@/components/brand/Logo";

/**
 * Internal admin/ops chrome (Screen 15+). Deliberately distinct from the
 * customer-facing app shell (src/app/app/layout.tsx): a dark utility header
 * instead of the light sidebar, no customer nav, and a visible
 * "Internal / demo" indicator so it reads as an internal tool, not a
 * customer surface.
 */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-app-bg">
      <header className="border-b border-white/10 bg-midnight">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <Logo variant="reverse" className="h-6" />
            <span className="hidden text-sm font-medium text-white/70 sm:inline">
              — SME Pipeline
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="rounded-full border border-white/20 bg-white/10 px-2.5 py-0.5 text-xs font-medium uppercase tracking-wide text-white/80">
              Internal / demo
            </span>
            <Link
              href="/app/overview"
              className="text-xs font-medium text-white/60 transition-colors hover:text-white"
            >
              Exit to customer app
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
        {children}
      </main>
    </div>
  );
}
