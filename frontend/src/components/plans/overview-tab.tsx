"use client";

import { CalendarDays, Users, ListTodo, DollarSign } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { Plan, PlanMember } from "@/services/api";

interface OverviewTabProps {
  plan: Plan;
  members: PlanMember[];
}

export default function OverviewTab({ plan, members }: OverviewTabProps) {
  const daysUntil = Math.ceil(
    (new Date(plan.startDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <CalendarDays className="h-5 w-5 text-primary mx-auto mb-1" />
            <p className="text-2xl font-bold text-foreground">
              {daysUntil > 0 ? daysUntil : 0}
            </p>
            <p className="text-xs text-muted-foreground">
              {daysUntil > 0 ? "days to go" : "started"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="h-5 w-5 text-primary mx-auto mb-1" />
            <p className="text-2xl font-bold text-foreground">
              {members.length}
            </p>
            <p className="text-xs text-muted-foreground">members</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <ListTodo className="h-5 w-5 text-primary mx-auto mb-1" />
            <p className="text-2xl font-bold text-foreground">
              {plan.tasksCompleted || 0}/{plan.tasksTotal || 0}
            </p>
            <p className="text-xs text-muted-foreground">tasks done</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <DollarSign className="h-5 w-5 text-primary mx-auto mb-1" />
            <p className="text-2xl font-bold text-foreground">$0</p>
            <p className="text-xs text-muted-foreground">total expenses</p>
          </CardContent>
        </Card>
      </div>

      {/* Members preview */}
      <Card>
        <CardContent className="p-5">
          <h3 className="font-semibold text-foreground mb-3">Members</h3>
          <div className="flex flex-wrap gap-3">
            {members.map((m) => (
              <div key={m.id} className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-secondary text-primary text-xs">
                    {m.user?.name?.[0]?.toUpperCase() || "?"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{m.user?.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {m.role}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Features enabled */}
      <Card>
        <CardContent className="p-5">
          <h3 className="font-semibold text-foreground mb-3">
            Enabled Features
          </h3>
          <div className="flex flex-wrap gap-2">
            {plan.features?.map((f) => (
              <span
                key={f}
                className="px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-sm font-medium capitalize"
              >
                {f}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
