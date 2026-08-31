import { Logo } from "@/components/brand/Logo";
import { AppNav, MobileNav } from "@/components/nav/AppNav";
import { AccountMenu } from "@/components/nav/AccountMenu";

export default function AppShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-app-bg md:grid md:grid-cols-[260px_1fr]">
      {/* Desktop sidebar — understated, same visual family as the header */}
      <aside className="hidden flex-col border-r border-line bg-white md:flex">
        <div className="flex h-16 items-center border-b border-line px-6">
          <Logo />
        </div>
        <nav className="flex-1 overflow-y-auto px-4 py-6">
          <AppNav />
        </nav>
      </aside>

      <div className="flex min-h-screen flex-col">
        {/* Understated sticky top bar: mobile carries logo + drawer trigger, desktop just the account menu */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-line bg-white/94 px-4 backdrop-blur-md md:justify-end md:px-8">
          <div className="flex items-center gap-2 md:hidden">
            <MobileNav />
            <Logo className="h-7" />
          </div>
          <AccountMenu />
        </header>

        <main className="mx-auto w-full max-w-6xl flex-1 p-6 md:p-10">
          {children}
        </main>
      </div>
    </div>
  );
}
