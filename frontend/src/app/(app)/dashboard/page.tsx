"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Globe,
  CheckSquare,
  Receipt,
  Users,
  Plus,
  ClipboardList,
  Wallet,
  ChevronRight,
  Clock,
  UserPlus,
  Circle,
  Plane,
  Cake,
  PartyPopper,
  Briefcase,
  Calendar,
  MapPin,
  Trash2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuthStore } from "@/stores/auth-store";
import { planAPI, dashboardAPI, type Plan } from "@/services/api";
import { toast } from "sonner";

interface DashboardData {
  activePlans: number;
  pendingTasks: number;
  unsettledExpenses: number;
  recentActivity: {
    id: string;
    user: string;
    action: string;
    target: string;
    createdAt: string;
  }[];
}

const typeConfig: Record<string, { icon: React.ElementType; border: string; iconBg: string; iconColor: string; badge: string }> = {
  trip: { icon: Plane, border: "border-l-blue-400", iconBg: "bg-blue-50 dark:bg-blue-950/50", iconColor: "text-blue-500", badge: "bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400" },
  birthday: { icon: Cake, border: "border-l-rose-400", iconBg: "bg-rose-50 dark:bg-rose-950/50", iconColor: "text-rose-500", badge: "bg-rose-50 text-rose-600 dark:bg-rose-950 dark:text-rose-400" },
  event: { icon: PartyPopper, border: "border-l-violet-400", iconBg: "bg-violet-50 dark:bg-violet-950/50", iconColor: "text-violet-500", badge: "bg-violet-50 text-violet-600 dark:bg-violet-950 dark:text-violet-400" },
  conference: { icon: Briefcase, border: "border-l-slate-400", iconBg: "bg-slate-50 dark:bg-slate-800", iconColor: "text-slate-500", badge: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400" },
  custom: { icon: Calendar, border: "border-l-teal-400", iconBg: "bg-teal-50 dark:bg-teal-950/50", iconColor: "text-teal-500", badge: "bg-teal-50 text-teal-600 dark:bg-teal-950 dark:text-teal-400" },
};

function timeAgo(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [stats, setStats] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [p, d] = await Promise.all([planAPI.list(), dashboardAPI.get()]);
        setPlans(p.data.plans || []);
        setStats(d.data);
      } catch {
        try {
          const p = await planAPI.list();
          setPlans(p.data.plans || []);
        } catch { /* */ }
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });

  const deletePlan = async (e: React.MouseEvent, planId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Delete this plan? This cannot be undone.")) return;
    try {
      await planAPI.delete(planId);
      toast.success("Plan deleted");
      setPlans((prev) => prev.filter((p) => p.id !== planId));
    } catch {
      toast.error("Failed to delete plan");
    }
  };

  const nearestPlan = plans.find((p) => {
    const d = Math.ceil((new Date(p.startDate).getTime() - Date.now()) / 86400000);
    return d > 0 && d <= 14;
  });
  const nearestDays = nearestPlan
    ? Math.ceil((new Date(nearestPlan.startDate).getTime() - Date.now()) / 86400000)
    : null;

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="h-10 w-72 bg-muted rounded-lg animate-pulse" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-muted rounded-xl animate-pulse" />)}
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-20 bg-muted rounded-xl animate-pulse" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-7">
      {/* Welcome Header — card style */}
      <Card className="border-border overflow-hidden">
        <CardContent className="p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <p className="text-sm text-muted-foreground">{today}</p>
            </div>
            <h1 className="text-3xl font-bold text-foreground">
              {greeting}, <span className="text-primary">{user?.name?.split(" ")[0]}</span>
              {hour >= 18 ? " \uD83C\uDF19" : hour >= 12 ? " \uD83D\uDC4B" : " \u2600"}
            </h1>
            {nearestPlan && nearestDays && (
              <p className="text-sm text-muted-foreground mt-1.5">
                {"✈️"} {nearestPlan.name} is in {nearestDays} day{nearestDays !== 1 ? "s" : ""}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                const link = prompt("Paste your invite link:");
                if (link) {
                  const token = link.includes("/join/") ? link.split("/join/")[1] : link;
                  if (token) window.location.href = `/join/${token.trim()}`;
                }
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors"
            >
              <UserPlus className="h-4 w-4" />
              Join a Plan
            </button>
            <Link
              href="/plans/new"
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity shadow-sm"
            >
              <Plus className="h-4 w-4" />
              New Plan
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Stats Row — gradient cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "ACTIVE PLANS", value: stats?.activePlans ?? plans.length, sub: "total plans", gradient: "from-cyan-400 via-teal-400 to-emerald-400" },
          { label: "PENDING TASKS", value: stats?.pendingTasks ?? 0, sub: "to complete", gradient: "from-blue-400 via-indigo-400 to-violet-400" },
          { label: "TOTAL EXPENSES", value: `$${stats?.unsettledExpenses || 0}`, sub: "across plans", gradient: "from-amber-300 via-orange-300 to-rose-300" },
          { label: "COLLABORATORS", value: plans.reduce((s, p) => s + (p.memberCount || 1), 0), sub: "across plans", gradient: "from-pink-400 via-fuchsia-400 to-purple-400" },
        ].map((stat) => (
          <div
            key={stat.label}
            className={`rounded-xl bg-gradient-to-r ${stat.gradient} p-4 flex items-center justify-between shadow-sm`}
          >
            <div>
              <p className="text-[10px] font-semibold text-white/70 uppercase tracking-wider">
                {stat.label}
              </p>
              <p className="text-xs text-white/60 mt-0.5">{stat.sub}</p>
            </div>
            <p className="text-2xl font-bold text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions — with arrow */}
      <div>
        <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-3">
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: "Create Plan", desc: "Start something new", icon: Plus, href: "/plans/new", color: "bg-indigo-50 text-indigo-500 dark:bg-indigo-950/50 dark:text-indigo-400" },
            { label: "Add Expense", desc: "Track a shared cost", icon: Receipt, href: "/expenses", color: "bg-amber-50 text-amber-500 dark:bg-amber-950/50 dark:text-amber-400" },
            { label: "View Tasks", desc: "See what's pending", icon: ClipboardList, href: "/tasks", color: "bg-emerald-50 text-emerald-500 dark:bg-emerald-950/50 dark:text-emerald-400" },
            { label: "Invite Friends", desc: "Grow your group", icon: UserPlus, href: "/settings", color: "bg-rose-50 text-rose-500 dark:bg-rose-950/50 dark:text-rose-400" },
          ].map((a) => (
            <Link key={a.label} href={a.href}>
              <Card className="border-border hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer h-full">
                <CardContent className="p-3.5 flex items-center gap-3">
                  <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${a.color}`}>
                    <a.icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">{a.label}</p>
                    <p className="text-[11px] text-muted-foreground">{a.desc}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground/30 shrink-0" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Active Plans — with count badge */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-foreground">Active Plans</h2>
            <span className="h-5 min-w-5 flex items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-[11px] font-bold px-1.5 dark:bg-emerald-950 dark:text-emerald-400">
              {plans.length}
            </span>
          </div>
          <Link href="/plans" className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            View all <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {plans.slice(0, 6).map((plan) => {
            const config = typeConfig[plan.type] || typeConfig.custom;
            const daysLeft = Math.ceil((new Date(plan.startDate).getTime() - Date.now()) / 86400000);
            const fmtDate = (d: string) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

            return (
              <Link key={plan.id} href={`/plans/${plan.id}`}>
                <Card className={`border-border border-l-4 ${config.border} hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group`}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${config.iconBg}`}>
                        <config.icon className={`h-5 w-5 ${config.iconColor}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="font-bold text-foreground group-hover:text-primary transition-colors text-sm truncate">
                            {plan.name}
                          </h3>
                          <div className="flex items-center gap-1.5 shrink-0">
                            {daysLeft > 0 && (
                              <span className="text-[11px] font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded-full flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {daysLeft}d
                              </span>
                            )}
                            <button
                              onClick={(e) => deletePlan(e, plan.id)}
                              className="p-1 rounded-md opacity-0 group-hover:opacity-100 hover:bg-red-50 text-muted-foreground/40 hover:text-red-500 transition-all dark:hover:bg-red-950/50"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 mt-1.5 text-[12px] text-muted-foreground">
                          <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold ${config.badge}`}>
                            {plan.type.charAt(0).toUpperCase() + plan.type.slice(1)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {fmtDate(plan.startDate).replace(`, ${new Date().getFullYear()}`, "")}
                            {plan.endDate ? ` – ${fmtDate(plan.endDate).replace(`, ${new Date().getFullYear()}`, "")}` : ""}
                          </span>
                          {plan.type === "trip" && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3 text-rose-400" />
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <div className="flex -space-x-1.5">
                            {Array.from({ length: Math.min(plan.memberCount || 1, 3) }).map((_, i) => {
                              const colors = ["bg-emerald-500", "bg-rose-400", "bg-indigo-400"];
                              const letters = ["A", "B", "C"];
                              return (
                                <div key={i} className={`h-5 w-5 rounded-full ${colors[i]} border-2 border-card flex items-center justify-center`}>
                                  <span className="text-[8px] font-bold text-white">{letters[i]}</span>
                                </div>
                              );
                            })}
                          </div>
                          {(plan.memberCount || 0) > 1 && (
                            <span className="text-[11px] text-muted-foreground">{plan.memberCount} members</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}

          {/* Create card — same height as plan cards */}
          <Link href="/plans/new">
            <Card className="border-dashed border-2 border-border hover:border-primary/40 hover:bg-muted/30 transition-all cursor-pointer h-full">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
                  <Plus className="h-5 w-5 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium text-muted-foreground">Create a new plan</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>

      {/* Bottom 3-column row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Tasks Due Soon */}
        <Card className="border-border">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">Tasks Due Soon</h3>
              <Link href="/tasks" className="text-xs font-medium text-muted-foreground hover:text-foreground flex items-center gap-0.5">
                All <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
            {(stats?.pendingTasks || 0) > 0 ? (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  {stats?.pendingTasks} tasks pending across your plans
                </p>
                <Link href="/tasks" className="inline-flex items-center text-sm font-medium text-primary hover:underline">
                  View all tasks <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
                </Link>
              </div>
            ) : (
              <div className="flex flex-col items-center py-6 text-center">
                <CheckSquare className="h-8 w-8 text-muted-foreground/30 mb-2" />
                <p className="text-sm font-medium text-foreground">All caught up!</p>
                <p className="text-xs text-muted-foreground">No pending tasks</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Expense Summary */}
        <Card className="border-border">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">Expense Summary</h3>
              <Link href="/expenses" className="text-xs font-medium text-muted-foreground hover:text-foreground flex items-center gap-0.5">
                View <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
            {(stats?.unsettledExpenses || 0) > 0 ? (
              <div className="space-y-2">
                <p className="text-2xl font-bold text-foreground">${stats?.unsettledExpenses}</p>
                <p className="text-sm text-muted-foreground">unsettled balance</p>
              </div>
            ) : (
              <div className="flex flex-col items-center py-6 text-center">
                <Receipt className="h-8 w-8 text-muted-foreground/30 mb-2" />
                <p className="text-sm font-medium text-foreground">All settled up!</p>
                <p className="text-xs text-muted-foreground">No outstanding balances</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="border-border">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">Recent Activity</h3>
              <Link href="/activity" className="text-xs font-medium text-muted-foreground hover:text-foreground flex items-center gap-0.5">
                All <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
            {(stats?.recentActivity?.length || 0) > 0 ? (
              <div className="space-y-3">
                {stats!.recentActivity.slice(0, 5).map((a) => (
                  <div key={a.id} className="flex items-start gap-2.5">
                    <Avatar className="h-7 w-7 mt-0.5 shrink-0">
                      <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-semibold">
                        {a.user?.[0]?.toUpperCase() || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-sm leading-snug">
                        <span className="font-medium text-foreground">{a.user}</span>{" "}
                        <span className="text-muted-foreground">{a.action}</span>{" "}
                        <span className="font-medium text-foreground">{a.target}</span>
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{timeAgo(a.createdAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center py-6 text-center">
                <Circle className="h-8 w-8 text-muted-foreground/30 mb-2" />
                <p className="text-sm font-medium text-foreground">No activity yet</p>
                <p className="text-xs text-muted-foreground">Create a plan to get started</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
