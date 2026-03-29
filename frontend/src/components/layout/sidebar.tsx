"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid, Globe, CalendarRange, Bell, CheckSquare, Receipt,
  Settings, Plus, Moon, Sun,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useThemeStore } from "@/stores/theme-store";
import { useNotificationStore } from "@/stores/notification-store";

const primaryNavItems = [
  { href: "/dashboard", label: "Home", icon: LayoutGrid },
  { href: "/plans", label: "Plans", icon: Globe },
  { href: "/calendar", label: "Calendar", icon: CalendarRange },
  { href: "/inbox", label: "Inbox", icon: Bell },
];

const manageNav = [
  { href: "/tasks", label: "My Tasks", icon: CheckSquare },
  { href: "/expenses", label: "Expenses", icon: Receipt },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useThemeStore();
  const { unreadCount, fetchAndCount } = useNotificationStore();

  useEffect(() => {
    fetchAndCount();
  }, []);

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  const primaryNav = primaryNavItems.map((item) =>
    item.href === "/inbox" ? { ...item, badge: unreadCount } : item
  );

  const navLink = (item: { href: string; label: string; icon: React.ElementType; badge?: number }) => (
    <Link
      key={item.href}
      href={item.href}
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] font-medium transition-all duration-150",
        isActive(item.href)
          ? "bg-primary text-primary-foreground shadow-sm"
          : "text-foreground/60 hover:bg-muted hover:text-foreground"
      )}
    >
      <item.icon className="h-[18px] w-[18px] shrink-0" />
      <span className="flex-1">{item.label}</span>
      {item.badge ? (
        <span className="h-5 min-w-5 flex items-center justify-center rounded-full bg-red-500 text-white text-[11px] font-bold px-1">
          {item.badge}
        </span>
      ) : null}
    </Link>
  );

  return (
    <aside className="hidden md:flex flex-col w-[220px] border-r border-border bg-card shrink-0">
      {/* Logo */}
      <div className="h-16 flex items-center gap-2.5 px-5 border-b border-border">
        <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
          <svg viewBox="0 0 24 24" className="h-4 w-4 text-primary-foreground" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L12 22" />
            <path d="M12 2L20 10" />
            <path d="M12 2L4 10" />
            <circle cx="12" cy="5" r="1.5" fill="currentColor" stroke="none" />
          </svg>
        </div>
        <div>
          <span className="text-[16px] font-bold text-foreground tracking-tight leading-none">Planova</span>
          <p className="text-[9px] font-semibold text-primary uppercase tracking-[0.12em] leading-none mt-0.5">Collaborative Planning</p>
        </div>
      </div>

      {/* New Plan CTA */}
      <div className="px-3 pt-4 pb-3">
        <Link
          href="/plans/new"
          className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity shadow-sm"
        >
          <Plus className="h-4 w-4" />
          New Plan
        </Link>
      </div>

      {/* Primary Nav */}
      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
        {primaryNav.map(navLink)}

        <div className="pt-5 pb-1">
          <span className="px-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.15em]">
            Manage
          </span>
        </div>
        {manageNav.map(navLink)}
      </nav>

      {/* Bottom — Dark mode + Settings */}
      <div className="px-3 pb-4 pt-2 border-t border-border mt-auto space-y-0.5">
        <button
          onClick={toggleTheme}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] font-medium text-foreground/60 hover:bg-muted hover:text-foreground transition-colors w-full"
        >
          {theme === "dark" ? (
            <Sun className="h-[18px] w-[18px] shrink-0" />
          ) : (
            <Moon className="h-[18px] w-[18px] shrink-0" />
          )}
          <span>{theme === "dark" ? "Light mode" : "Dark mode"}</span>
        </button>
        {navLink({ href: "/settings", label: "Settings", icon: Settings })}
      </div>
    </aside>
  );
}
