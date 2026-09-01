"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Briefcase,
  ShieldCheck,
  Lightbulb,
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
  /**
   * Subtle extra weight for the Protection Portfolio item — it's the hero
   * product (see .superpowers/sdd/portfolio-phase-i.md), so it gets a touch
   * more visual presence in an otherwise restrained, uncrowded sidebar.
   * Deliberately just a font-weight/color nudge, not a badge or a second
   * treatment — the sidebar itself stays understated PI/D&O chrome.
   */
  emphasize?: boolean;
}

/**
 * Hierarchy: Portfolio (what I have) -> Risk Assessment (how protected) ->
 * Insights (what needs attention) -> action (Recommendations/Documents/
 * Requests). Routes/logic are unchanged from the pre-I7 nav; only order,
 * labels and icons for the Protection Portfolio, Risk Assessment (was
 * "Business Protection") and Requests (was "Quotes & Requests") items.
 */
export const NAV_ITEMS: NavItem[] = [
  { href: "/app/overview", label: "Overview", icon: LayoutDashboard },
  { href: "/app/portfolio", label: "Protection Portfolio", icon: Briefcase, emphasize: true },
  { href: "/app/protection", label: "Risk Assessment", icon: ShieldCheck },
  { href: "/app/insights", label: "Insights", icon: Lightbulb },
  { href: "/app/people", label: "People & Benefits", icon: Users },
  { href: "/app/recommendations", label: "Recommendations", icon: ListChecks },
  { href: "/app/documents", label: "Documents", icon: FileText },
  { href: "/app/quotes", label: "Requests", icon: ClipboardList },
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
              "flex items-center gap-3 rounded-lg border-l-2 px-3 py-2.5 text-sm transition-colors",
              item.emphasize ? "font-semibold" : "font-medium",
              isActive
                ? "border-electric bg-electric/5 text-midnight"
                : item.emphasize
                ? "border-transparent text-ink hover:bg-line/40 hover:text-midnight"
                : "border-transparent text-muted-ink hover:bg-line/40 hover:text-midnight"
            )}
          >
            <Icon
              className={cn(
                "h-4 w-4 shrink-0",
                isActive ? "text-electric" : item.emphasize ? "text-royal" : "text-muted-ink"
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
