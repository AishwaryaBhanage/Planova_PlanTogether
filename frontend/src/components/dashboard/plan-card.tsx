import {
  Plane,
  Cake,
  PartyPopper,
  Calendar,
  Briefcase,
  Users,
  Clock,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const typeConfig: Record<
  string,
  { icon: React.ElementType; color: string; bg: string; badgeClass: string }
> = {
  trip: { icon: Plane, color: "text-blue-600", bg: "bg-blue-50", badgeClass: "bg-blue-50 text-blue-700 border-blue-200" },
  birthday: { icon: Cake, color: "text-pink-600", bg: "bg-pink-50", badgeClass: "bg-pink-50 text-pink-700 border-pink-200" },
  event: { icon: PartyPopper, color: "text-amber-600", bg: "bg-amber-50", badgeClass: "bg-amber-50 text-amber-700 border-amber-200" },
  conference: { icon: Briefcase, color: "text-indigo-600", bg: "bg-indigo-50", badgeClass: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  custom: { icon: Calendar, color: "text-violet-600", bg: "bg-violet-50", badgeClass: "bg-violet-50 text-violet-700 border-violet-200" },
};

interface PlanCardProps {
  name: string;
  type: string;
  date: string;
  memberCount: number;
  tasksCompleted: number;
  tasksTotal: number;
  startDate?: string;
}

export default function PlanCard({
  name,
  type,
  date,
  memberCount,
  tasksCompleted,
  tasksTotal,
  startDate,
}: PlanCardProps) {
  const config = typeConfig[type] || typeConfig.custom;
  const Icon = config.icon;
  const progress = tasksTotal > 0 ? (tasksCompleted / tasksTotal) * 100 : 0;

  // Countdown
  let daysLeft: number | null = null;
  if (startDate) {
    const diff = Math.ceil(
      (new Date(startDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    if (diff > 0) daysLeft = diff;
  }

  return (
    <Card className="hover:shadow-md transition-all hover:-translate-y-0.5 cursor-pointer border-border group">
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div
            className={cn(
              "h-10 w-10 rounded-lg flex items-center justify-center",
              config.bg
            )}
          >
            <Icon className={cn("h-5 w-5", config.color)} />
          </div>
          <div className="flex items-center gap-2">
            {daysLeft !== null && (
              <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                <Clock className="h-3 w-3" />
                {daysLeft}d
              </div>
            )}
            <Badge
              variant="outline"
              className={cn("text-xs capitalize border", config.badgeClass)}
            >
              {type}
            </Badge>
          </div>
        </div>

        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors leading-tight">
          {name}
        </h3>
        <p className="text-sm text-muted-foreground mt-1">{date}</p>

        {/* Progress bar */}
        {tasksTotal > 0 && (
          <div className="mt-3.5">
            <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
              <span>
                {tasksCompleted}/{tasksTotal} tasks
              </span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-500",
                  progress === 100 ? "bg-emerald-500" : "bg-primary"
                )}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center gap-3 mt-3.5 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            {memberCount} members
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
