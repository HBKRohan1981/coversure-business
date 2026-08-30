"use client";

import { useRouter } from "next/navigation";
import { RotateCcw, ChevronDown } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSession } from "@/lib/store";

const ACCOUNT_NAME = "ABC Manufacturing";

export function AccountMenu() {
  const router = useRouter();
  const resetDemo = useSession((s) => s.resetDemo);

  function handleResetDemo() {
    resetDemo();
    router.push("/");
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-medium text-slate-700 outline-none transition-colors hover:bg-slate-100 focus-visible:ring-1 focus-visible:ring-ring">
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-midnight text-xs font-semibold text-white">
            AM
          </AvatarFallback>
        </Avatar>
        <span className="hidden sm:inline">{ACCOUNT_NAME}</span>
        <ChevronDown className="h-4 w-4 text-slate-400" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>{ACCOUNT_NAME}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleResetDemo}>
          <RotateCcw className="h-4 w-4" />
          Reset demo
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
