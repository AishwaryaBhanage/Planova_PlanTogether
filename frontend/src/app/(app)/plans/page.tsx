"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Search, LayoutGrid, List, Clock, Users, Plane, Cake, PartyPopper, Briefcase, Calendar, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { planAPI, type Plan } from "@/services/api";

const filters = ["All", "Active", "Upcoming", "Completed", "Draft"];

const typeConfig: Record<string, { icon: React.ElementType; gradient: string; badgeText: string }> = {
  trip: { icon: Plane, gradient: "from-blue-400 via-indigo-300 to-sky-200", badgeText: "text-blue-700" },
  birthday: { icon: Cake, gradient: "from-rose-300 via-pink-200 to-fuchsia-200", badgeText: "text-rose-700" },
  event: { icon: PartyPopper, gradient: "from-violet-300 via-purple-200 to-indigo-200", badgeText: "text-violet-700" },
  conference: { icon: Briefcase, gradient: "from-slate-300 via-blue-200 to-slate-200", badgeText: "text-slate-700" },
  custom: { icon: Calendar, gradient: "from-teal-300 via-cyan-200 to-emerald-200", badgeText: "text-teal-700" },
};

export default function PlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("All");
  const [search, setSearch] = useState("");

  useEffect(() => {
    planAPI.list().then(({ data }) => setPlans(data.plans || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const filtered = plans.filter((p) => {
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const fmtDate = (d: string) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Plans</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{plans.length} plans total</p>
        </div>
        <Link href="/plans/new" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity shadow-sm">
          <Plus className="h-4 w-4" />
          New Plan
        </Link>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search plans..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-9 pl-9 pr-4 rounded-lg border border-border bg-white text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40"
          />
        </div>
        <div className="flex items-center gap-1">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
                activeFilter === f ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
              )}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1 border border-border rounded-lg p-0.5">
          <button className="p-1.5 rounded bg-primary text-primary-foreground"><LayoutGrid className="h-4 w-4" /></button>
          <button className="p-1.5 rounded text-muted-foreground hover:bg-muted"><List className="h-4 w-4" /></button>
        </div>
      </div>

      {/* Plans Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <div key={i} className="h-52 bg-muted rounded-xl animate-pulse" />)}
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((plan) => {
            const config = typeConfig[plan.type] || typeConfig.custom;
            const daysLeft = Math.ceil((new Date(plan.startDate).getTime() - Date.now()) / 86400000);
            return (
              <Link key={plan.id} href={`/plans/${plan.id}`}>
                <Card className="overflow-hidden rounded-2xl border-border shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-200 cursor-pointer group">
                  <div className={`h-24 bg-gradient-to-r ${config.gradient} relative`}>
                    {daysLeft > 0 && (
                      <div className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/30 backdrop-blur-md text-[12px] font-semibold text-white shadow-sm">
                        <Clock className="h-3.5 w-3.5" />
                        {daysLeft <= 7 ? `${daysLeft}d away` : fmtDate(plan.startDate).split(",")[0].replace(` ${new Date().getFullYear()}`, "")}
                      </div>
                    )}
                    <div className="absolute bottom-3 left-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/30 backdrop-blur-md text-[12px] font-bold shadow-sm ${config.badgeText}`}>
                        <config.icon className="h-3.5 w-3.5" />
                        {plan.type.charAt(0).toUpperCase() + plan.type.slice(1)}
                      </span>
                    </div>
                  </div>
                  <CardContent className="p-4 space-y-2">
                    <h3 className="font-bold text-foreground group-hover:text-primary transition-colors text-[15px]">{plan.name}</h3>
                    <div className="flex items-center gap-4 text-[12px] text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {fmtDate(plan.startDate).replace(`, ${new Date().getFullYear()}`, "")}
                        {plan.endDate ? ` – ${fmtDate(plan.endDate).replace(`, ${new Date().getFullYear()}`, "")}` : ""}
                      </span>
                      {plan.type === "trip" && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5 text-rose-400" />
                          {plan.name}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-1.5">
                        {Array.from({ length: Math.min(plan.memberCount || 1, 3) }).map((_, i) => {
                          const colors = ["bg-emerald-500", "bg-rose-400", "bg-indigo-400"];
                          const letters = ["A", "B", "C"];
                          return (
                            <div key={i} className={`h-6 w-6 rounded-full ${colors[i]} border-2 border-card flex items-center justify-center`}>
                              <span className="text-[9px] font-bold text-white">{letters[i]}</span>
                            </div>
                          );
                        })}
                      </div>
                      {(plan.memberCount || 0) > 1 && (
                        <span className="text-[12px] text-muted-foreground">{plan.memberCount} members</span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20">
          <Calendar className="h-12 w-12 mx-auto mb-3 text-muted-foreground/30" />
          <p className="font-medium text-foreground">No plans found</p>
          <p className="text-sm text-muted-foreground mt-1">Create your first plan to get started</p>
        </div>
      )}
    </div>
  );
}
