"use client";

import { useEffect, useState } from "react";
import { Activity } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { dashboardAPI } from "@/services/api";

function timeAgo(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function ActivityPage() {
  const [activities, setActivities] = useState<{ id: string; user: string; action: string; target: string; createdAt: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardAPI.get()
      .then(({ data }) => setActivities(data.recentActivity || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-foreground">Activity</h1>
      <p className="text-sm text-muted-foreground mt-0.5 mb-6">
        Everything happening across your plans
      </p>

      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => <div key={i} className="h-16 bg-muted rounded-xl animate-pulse" />)}
        </div>
      ) : activities.length > 0 ? (
        <Card className="border-border">
          <CardContent className="p-5 space-y-4">
            {activities.map((a) => (
              <div key={a.id} className="flex items-start gap-3">
                <Avatar className="h-8 w-8 mt-0.5 shrink-0">
                  <AvatarFallback className="bg-primary/10 text-primary text-[11px] font-semibold">
                    {a.user?.[0]?.toUpperCase() || "?"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm">
                    <span className="font-medium text-foreground">{a.user}</span>{" "}
                    <span className="text-muted-foreground">{a.action}</span>{" "}
                    <span className="font-medium text-foreground">{a.target}</span>
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{timeAgo(a.createdAt)}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : (
        <Card className="border-border">
          <CardContent className="flex flex-col items-center py-16 text-center">
            <div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
              <Activity className="h-7 w-7 text-muted-foreground/40" />
            </div>
            <p className="font-semibold text-foreground">No activity yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Create a plan and start collaborating
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
