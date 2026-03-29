"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Plane, Cake, PartyPopper, Calendar, Briefcase, Users, ListTodo,
  DollarSign, MapPin, Settings, Clock, Gift, ArrowLeft, CheckSquare, Receipt, Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { planAPI, type Plan, type PlanMember } from "@/services/api";
import { toast } from "sonner";
import OverviewTab from "@/components/plans/overview-tab";
import TasksTab from "@/components/plans/tasks-tab";
import ExpensesTab from "@/components/plans/expenses-tab";
import MembersTab from "@/components/plans/members-tab";
import ItineraryTab from "@/components/plans/itinerary-tab";

const typeConfig: Record<string, { icon: React.ElementType; gradient: string; badge: string }> = {
  trip: { icon: Plane, gradient: "from-blue-400/20 via-indigo-300/15 to-sky-200/10", badge: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300" },
  birthday: { icon: Cake, gradient: "from-rose-400/20 via-pink-300/15 to-red-200/10", badge: "bg-pink-50 text-pink-700 dark:bg-pink-950 dark:text-pink-300" },
  event: { icon: PartyPopper, gradient: "from-fuchsia-400/20 via-purple-300/15 to-violet-200/10", badge: "bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300" },
  conference: { icon: Briefcase, gradient: "from-cyan-400/20 via-teal-300/15 to-emerald-200/10", badge: "bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-300" },
  custom: { icon: Calendar, gradient: "from-indigo-400/20 via-blue-300/15 to-cyan-200/10", badge: "bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300" },
};

const tabs = [
  { id: "overview", label: "Overview", icon: Calendar },
  { id: "itinerary", label: "Itinerary", icon: MapPin },
  { id: "tasks", label: "Tasks", icon: ListTodo },
  { id: "expenses", label: "Expenses", icon: DollarSign },
  { id: "members", label: "Members", icon: Users },
];

export default function PlanDetailPage() {
  const params = useParams();
  const planId = params.id as string;
  const router = useRouter();
  const [plan, setPlan] = useState<Plan | null>(null);
  const [members, setMembers] = useState<PlanMember[]>([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchPlan = async () => {
    try {
      const { data } = await planAPI.get(planId);
      setPlan(data.plan);
      // Members come from plan.planMembers or data.members depending on backend
      const memberList = data.members || (data.plan as any)?.planMembers || [];
      setMembers(memberList);
    } catch {
      setError("Failed to load plan");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPlan(); }, [planId]);

  if (loading) {
    return (
      <div className="space-y-4 -m-6">
        <div className="h-52 bg-muted animate-pulse" />
        <div className="px-6 space-y-4">
          <div className="h-10 w-96 bg-muted rounded-lg animate-pulse" />
          <div className="h-64 bg-muted rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (error || !plan) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-muted-foreground">{error || "Plan not found"}</p>
      </div>
    );
  }

  const config = typeConfig[plan.type] || typeConfig.custom;
  const daysLeft = Math.ceil((new Date(plan.startDate).getTime() - Date.now()) / 86400000);
  const progress = (plan.tasksTotal || 0) > 0 ? Math.round(((plan.tasksCompleted || 0) / plan.tasksTotal!) * 100) : 0;
  const fmtDate = (d: string) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  const handleDeletePlan = async () => {
    if (!confirm("Delete this plan and all its tasks, expenses, and members? This cannot be undone.")) return;
    try {
      await planAPI.delete(planId);
      toast.success("Plan deleted");
      router.push("/dashboard");
    } catch {
      toast.error("Failed to delete plan");
    }
  };

  const visibleTabs = tabs.filter(
    (t) => t.id === "overview" || t.id === "members" || plan.features?.includes(t.id)
  );

  return (
    <div className="-m-6">
      {/* Full-width Hero */}
      <div className={`bg-gradient-to-br ${config.gradient} relative`}>
        <div className="max-w-5xl mx-auto px-6 pt-5 pb-6">
          {/* Back link + delete */}
          <div className="flex items-center justify-between mb-6">
          <Link
            href="/plans"
            className="inline-flex items-center gap-1.5 text-sm text-foreground/60 hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Plans
          </Link>
          <button
            onClick={handleDeletePlan}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 transition-colors dark:hover:bg-red-950/50"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </button>
          </div>

          {/* Type badge */}
          <div className="mb-2">
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold ${config.badge}`}>
              <config.icon className="h-3.5 w-3.5" />
              {plan.type.charAt(0).toUpperCase() + plan.type.slice(1)}
            </span>
          </div>

          {/* Plan name */}
          <h1 className="text-2xl font-bold text-foreground">{plan.name}</h1>

          {/* Meta row */}
          <div className="flex items-center gap-4 mt-2 text-sm text-foreground/60">
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {fmtDate(plan.startDate)}{plan.endDate ? ` – ${fmtDate(plan.endDate)}` : ""}
            </span>
          </div>

          {plan.description && (
            <p className="text-sm text-foreground/60 mt-2 max-w-xl">{plan.description}</p>
          )}
        </div>

        {/* Stats bar */}
        <div className="border-t border-black/5">
          <div className="max-w-5xl mx-auto px-6 py-3 flex flex-wrap items-center gap-6">
            {[
              { label: "Countdown", value: daysLeft > 0 ? `${daysLeft} days away` : "Started", icon: Clock },
              { label: "Progress", value: `${progress}%`, icon: CheckSquare },
              { label: "Expenses", value: "$0", icon: Receipt },
              { label: "Members", value: String(plan.memberCount || members.length), icon: Users },
            ].map((s) => (
              <div key={s.label} className="flex items-center gap-2">
                <s.icon className="h-4 w-4 text-foreground/40" />
                <div>
                  <p className="text-[10px] font-medium text-foreground/50 uppercase tracking-wider">{s.label}</p>
                  <p className="text-sm font-bold text-foreground">{s.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-border bg-white sticky top-16 z-10">
        <div className="max-w-5xl mx-auto px-6">
          <nav className="flex gap-0.5 -mb-px overflow-x-auto">
            {visibleTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
                  activeTab === tab.id
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-5xl mx-auto px-6 py-6">
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card className="border-border">
                <CardContent className="p-5">
                  <h3 className="font-semibold text-foreground mb-2">About this plan</h3>
                  <p className="text-sm text-muted-foreground">
                    {plan.description || "No description added yet."}
                  </p>
                </CardContent>
              </Card>
            </div>
            <div>
              <Card className="border-border">
                <CardContent className="p-5">
                  <h3 className="font-semibold text-foreground mb-4">Quick Stats</h3>
                  <div className="space-y-3">
                    {[
                      { icon: CheckSquare, label: "Total Tasks", value: String(plan.tasksTotal || 0) },
                      { icon: Receipt, label: "Total Expenses", value: "$0" },
                      { icon: Users, label: "Members", value: String(plan.memberCount || members.length) },
                    ].map((s) => (
                      <div key={s.label} className="flex items-center justify-between">
                        <span className="flex items-center gap-2 text-sm text-muted-foreground">
                          <s.icon className="h-4 w-4" />
                          {s.label}
                        </span>
                        <span className="text-sm font-bold text-foreground">{s.value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
        {activeTab === "tasks" && <TasksTab planId={planId} members={members} />}
        {activeTab === "expenses" && <ExpensesTab planId={planId} members={members} />}
        {activeTab === "itinerary" && <ItineraryTab planId={planId} members={members} />}
        {activeTab === "members" && <MembersTab planId={planId} members={members} onUpdate={fetchPlan} />}
      </div>
    </div>
  );
}
