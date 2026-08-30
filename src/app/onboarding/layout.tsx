import { Logo } from "@/components/brand/Logo";
import { Progress } from "@/components/ui/progress";

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header className="border-b border-slate-200/70 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between px-6 py-4">
          <Logo />
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-slate-500">Step 1 of 3</span>
            <Progress value={33} className="h-1.5 w-24" />
          </div>
        </div>
      </header>

      <main className="flex flex-1 justify-center px-6 py-12 md:py-16">
        <div className="w-full max-w-xl">{children}</div>
      </main>
    </div>
  );
}
