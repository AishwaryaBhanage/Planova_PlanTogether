import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface SummaryWidgetProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  subtitle?: string;
  accentColor?: string;
  href?: string;
  actionLabel?: string;
}

export default function SummaryWidget({
  label,
  value,
  icon: Icon,
  subtitle,
  accentColor = "bg-violet-50 text-violet-600",
}: SummaryWidgetProps) {
  const [bgColor, textColor] = accentColor.split(" ");

  return (
    <Card className="hover:shadow-md transition-all border-border group">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold text-foreground">{value}</p>
            {subtitle && (
              <p className={cn("text-xs font-medium", textColor || "text-muted-foreground")}>
                {subtitle}
              </p>
            )}
          </div>
          <div
            className={cn(
              "h-11 w-11 rounded-xl flex items-center justify-center shrink-0",
              bgColor || "bg-secondary"
            )}
          >
            <Icon className={cn("h-5 w-5", textColor || "text-primary")} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
