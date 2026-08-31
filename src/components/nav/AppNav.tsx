"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShieldCheck,
  Users,
  FileText,
  ListChecks,
  ClipboardList,
  Menu,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/brand/Logo";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/app/overview", label: "Overview", icon: LayoutDashboard },
  { href: "/app/protection", label: "Business Protection", icon: ShieldCheck },
  { href: "/app/people", label: "People & Benefits", icon: Users },
  { href: "/app/documents", label: "Documents", icon: FileText },
  { href: "/app/recommendations", label: "Recommendations", icon: ListChecks },
  { href: "/app/quotes", label: "Quotes & Requests", icon: ClipboardList },
];

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-0.5">
      {NAV_ITEMS.map((item) => {
        const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-lg border-l-2 px-3 py-2.5 text-sm font-medium transition-colors",
              isActive
                ? "border-electric bg-electric/5 text-midnight"
                : "border-transparent text-muted-ink hover:bg-line/40 hover:text-midnight"
            )}
          >
            <Icon
              className={cn(
                "h-4 w-4 shrink-0",
                isActive ? "text-electric" : "text-muted-ink"
              )}
            />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

/** Desktop sidebar navigation. */
export function AppNav() {
  return <NavLinks />;
}

/** Mobile nav: hamburger trigger opening a Sheet drawer with the same links. */
export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Open navigation">
          <Menu className="h-5 w-5 text-muted-ink" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 border-line bg-white">
        <SheetHeader>
          <SheetTitle asChild>
            <Logo className="h-7" />
          </SheetTitle>
        </SheetHeader>
        <div className="mt-6">
          <NavLinks onNavigate={() => setOpen(false)} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
