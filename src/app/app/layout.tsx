import { Logo } from "@/components/brand/Logo";
import { AppNav, MobileNav } from "@/components/nav/AppNav";
import { AccountMenu } from "@/components/nav/AccountMenu";

export default function AppShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white md:grid md:grid-cols-[260px_1fr]">
      {/* Desktop sidebar */}
      <aside className="hidden flex-col border-r border-slate-200 bg-white p-6 md:flex">
        <Logo className="mb-8" />
        <AppNav />
      </aside>

      <div className="flex min-h-screen flex-col">
        {/* Mobile top bar */}
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 md:hidden">
          <div className="flex items-center gap-2">
            <MobileNav />
            <Logo className="h-7" />
          </div>
          <AccountMenu />
        </header>

        {/* Desktop top bar (account menu only, sidebar carries nav + logo) */}
        <header className="hidden items-center justify-end border-b border-slate-200 bg-white px-10 py-4 md:flex">
          <AccountMenu />
        </header>

        <main className="mx-auto w-full max-w-6xl flex-1 p-6 md:p-10">
          {children}
        </main>
      </div>
    </div>
  );
}
