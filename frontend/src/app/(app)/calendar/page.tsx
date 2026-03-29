"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Clock, MapPin, Plane, Cake, PartyPopper, Briefcase, Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { planAPI, type Plan } from "@/services/api";

const typeConfig: Record<string, { icon: React.ElementType; badge: string; border: string }> = {
  trip: { icon: Plane, badge: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300", border: "border-l-blue-500" },
  birthday: { icon: Cake, badge: "bg-pink-50 text-pink-700 dark:bg-pink-950 dark:text-pink-300", border: "border-l-pink-500" },
  event: { icon: PartyPopper, badge: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300", border: "border-l-amber-500" },
  conference: { icon: Briefcase, badge: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300", border: "border-l-slate-500" },
  custom: { icon: Calendar, badge: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300", border: "border-l-emerald-500" },
};

export default function CalendarPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    planAPI.list().then(({ data }) => setPlans(data.plans || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const upcoming = plans.filter((p) => new Date(p.startDate).getTime() > Date.now()).sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  const past = plans.filter((p) => new Date(p.startDate).getTime() <= Date.now()).sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());

  const fmtFull = (d: string) => new Date(d).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto space-y-4">
        <div className="h-8 w-40 bg-muted rounded animate-pulse" />
        {[...Array(3)].map((_, i) => <div key={i} className="h-20 bg-muted rounded-xl animate-pulse" />)}
      </div>
    );
  }

  const PlanRow = ({ plan }: { plan: Plan }) => {
    const config = typeConfig[plan.type] || typeConfig.custom;
    const dt = new Date(plan.startDate);
    const daysLeft = Math.ceil((dt.getTime() - Date.now()) / 86400000);

    return (
      <Link href={`/plans/${plan.id}`}>
        <div className={`flex items-center gap-5 px-5 py-4 hover:bg-muted/50 transition-colors border-b border-border last:border-0 border-l-4 ${config.border}`}>
          <div className="text-center w-14 shrink-0">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase">
              {dt.toLocaleDateString("en-US", { month: "short" })}
            </p>
            <p className="text-2xl font-bold text-foreground leading-tight">{dt.getDate()}</p>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-foreground">{plan.name}</span>
              <Badge variant="secondary" className={`text-[10px] font-semibold border-0 ${config.badge}`}>
                <config.icon className="h-3 w-3 mr-0.5" />
                {plan.type.charAt(0).toUpperCase() + plan.type.slice(1)}
              </Badge>
            </div>
            <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {fmtFull(plan.startDate)}{plan.endDate ? ` – ${fmtFull(plan.endDate)}` : ""}
              </span>
            </div>
          </div>
          {daysLeft > 0 && (
            <div className="text-right shrink-0">
              <p className="text-lg font-bold text-primary">{daysLeft}d</p>
              <p className="text-[10px] text-muted-foreground">to go</p>
            </div>
          )}
        </div>
      </Link>
    );
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-foreground">Calendar</h1>
      <p className="text-sm text-muted-foreground mt-0.5 mb-6">All your plans on a timeline</p>

      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">Upcoming</h3>
            <Badge variant="secondary" className="text-[10px] h-5 px-1.5">{upcoming.length}</Badge>
          </div>
          <Card className="border-border overflow-hidden">
            {upcoming.length > 0 ? (
              upcoming.map((p) => <PlanRow key={p.id} plan={p} />)
            ) : (
              <CardContent className="py-10 text-center text-sm text-muted-foreground">No upcoming plans yet.</CardContent>
            )}
          </Card>
        </div>

        <div>
          <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-3">Past</h3>
          <Card className="border-border overflow-hidden">
            {past.length > 0 ? (
              past.map((p) => <PlanRow key={p.id} plan={p} />)
            ) : (
              <CardContent className="py-10 text-center text-sm text-muted-foreground">No past plans yet.</CardContent>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
