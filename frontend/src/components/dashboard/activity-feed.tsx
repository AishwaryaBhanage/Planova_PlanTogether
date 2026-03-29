import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface ActivityItem {
  id: string;
  user: string;
  action: string;
  target: string;
  createdAt: string;
}

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = Math.floor((now - then) / 1000);

  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
  if (diff < 172800) return "yesterday";
  return `${Math.floor(diff / 86400)} days ago`;
}

interface ActivityFeedProps {
  activities: ActivityItem[];
}

export default function ActivityFeed({ activities }: ActivityFeedProps) {
  if (activities.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-6">
        No activity yet. Create a plan to get started!
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {activities.map((item) => (
        <div key={item.id} className="flex items-start gap-3">
          <Avatar className="h-8 w-8 mt-0.5">
            <AvatarFallback className="bg-secondary text-primary text-xs">
              {item.user?.[0]?.toUpperCase() || "?"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm">
              <span className="font-medium text-foreground">{item.user}</span>{" "}
              <span className="text-muted-foreground">{item.action}</span>{" "}
              <span className="font-medium text-foreground">{item.target}</span>
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {timeAgo(item.createdAt)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
