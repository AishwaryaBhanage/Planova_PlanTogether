"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid, Globe, CalendarRange, Bell, CheckSquare, Receipt, Settings, Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";

const allNav = [
  { href: "/dashboard", label: "Home", icon: LayoutGrid },
  { href: "/plans", label: "Plans", icon: Globe },
  { href: "/calendar", label: "Calendar", icon: CalendarRange },
  { href: "/inbox", label: "Inbox", icon: Bell },
  { href: "/tasks", label: "My Tasks", icon: CheckSquare },
  { href: "/expenses", label: "Expenses", icon: Receipt },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function MobileSidebar() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="h-16 flex items-center gap-2.5 px-5 border-b border-border">
        <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
          <span className="text-white text-sm font-bold">P</span>
        </div>
        <span className="text-[17px] font-bold text-foreground">Planova</span>
      </div>
      <div className="px-3 pt-4 pb-3">
        <Link
          href="/plans/new"
          className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold"
        >
          <Plus className="h-4 w-4" />
          New Plan
        </Link>
      </div>
      <nav className="flex-1 px-3 space-y-0.5">
        {allNav.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground/70 hover:bg-muted"
              )}
            >
              <item.icon className="h-[18px] w-[18px]" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
