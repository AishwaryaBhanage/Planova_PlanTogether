"use client";

import { useEffect, useRef } from "react";
import { Bell, Sparkles, Users, Receipt } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useNotificationStore } from "@/stores/notification-store";

function timeAgo(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

const iconMap: Record<string, { icon: React.ElementType; bg: string }> = {
  created: { icon: Sparkles, bg: "bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400" },
  invited: { icon: Users, bg: "bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400" },
  added: { icon: Receipt, bg: "bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400" },
  completed: { icon: Sparkles, bg: "bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400" },
};

export default function InboxPage() {
  const { activities, loading, lastReadAt, fetchAndCount, markAllRead } = useNotificationStore();
  const prevLastReadAt = useRef(lastReadAt);

  useEffect(() => {
    // Capture the lastReadAt before we mark as read, so we can show dots for items that were unread
    prevLastReadAt.current = lastReadAt;
    fetchAndCount().then(() => {
      markAllRead();
    });
  }, []);

  const getIcon = (action: string) => {
    for (const key of Object.keys(iconMap)) {
      if (action.includes(key)) return iconMap[key];
    }
    return { icon: Bell, bg: "bg-muted text-muted-foreground" };
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-foreground">Inbox</h1>
      <p className="text-sm text-muted-foreground mt-0.5 mb-6">
        Notifications, invites, and updates
      </p>

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => <div key={i} className="h-20 bg-muted rounded-xl animate-pulse" />)}
        </div>
      ) : activities.length > 0 ? (
        <div className="space-y-2">
          {activities.map((a) => {
            const { icon: Icon, bg } = getIcon(a.action);
            const isUnread = !prevLastReadAt.current || new Date(a.createdAt) > new Date(prevLastReadAt.current);
            return (
              <Card key={a.id} className="border-border hover:shadow-sm transition-shadow">
                <CardContent className="p-4 flex items-start gap-4">
                  {isUnread ? (
                    <div className="h-2 w-2 rounded-full bg-primary mt-4 shrink-0" />
                  ) : (
                    <div className="w-2 shrink-0" />
                  )}
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${bg}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">
                      {a.user} {a.action} {a.target}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">{timeAgo(a.createdAt)}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="border-border">
          <CardContent className="flex flex-col items-center py-16 text-center">
            <div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
              <Bell className="h-7 w-7 text-muted-foreground/40" />
            </div>
            <p className="font-semibold text-foreground">All caught up!</p>
            <p className="text-sm text-muted-foreground mt-1 max-w-xs">
              You have no new notifications. Activity from your plans will appear here.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
