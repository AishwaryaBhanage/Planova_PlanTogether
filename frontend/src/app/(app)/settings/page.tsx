"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, User, Palette, Bell, Sun, Moon, Link2, Copy, Check } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import { useThemeStore } from "@/stores/theme-store";
import { toast } from "sonner";

export default function SettingsPage() {
  const { user, logout } = useAuthStore();
  const { theme, setTheme } = useThemeStore();
  const router = useRouter();

  const [notifications, setNotifications] = useState({
    planUpdates: true,
    taskAssignments: true,
    expenseChanges: true,
    memberInvites: true,
  });
  const [copied, setCopied] = useState(false);

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  const referralLink = `https://planova.app/join?ref=${user?.id?.slice(0, 8) || "abc123"}`;

  const copyReferral = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast.success("Referral link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSignOut = () => {
    logout();
    router.push("/login");
  };

  const toggleNotif = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Manage your account and preferences
        </p>
      </div>

      {/* Profile */}
      <Card className="border-border">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center">
              <User className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Profile</h3>
              <p className="text-xs text-muted-foreground">Your personal information</p>
            </div>
          </div>

          <div className="flex items-center gap-4 mb-6">
            <div className="relative">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="bg-primary text-primary-foreground text-lg font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full bg-emerald-500 border-2 border-card" />
            </div>
            <div>
              <p className="font-semibold text-foreground text-lg">{user?.name}</p>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
              <Badge variant="secondary" className="mt-1 text-[10px] font-semibold bg-primary/10 text-primary border-0">
                Admin
              </Badge>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Full Name</label>
              <input
                type="text"
                value={user?.name || ""}
                readOnly
                className="w-full mt-1.5 h-10 px-3 rounded-lg border border-border bg-muted/30 text-sm text-foreground"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Email</label>
              <input
                type="email"
                value={user?.email || ""}
                readOnly
                className="w-full mt-1.5 h-10 px-3 rounded-lg border border-border bg-muted/30 text-sm text-muted-foreground"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card className="border-border">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center">
              <Palette className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Appearance</h3>
              <p className="text-xs text-muted-foreground">Customize the look and feel</p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Color theme</p>
              <p className="text-xs text-muted-foreground">Currently using {theme} mode</p>
            </div>
            <div className="flex items-center rounded-xl border border-border overflow-hidden">
              <button
                onClick={() => setTheme("light")}
                className={cn(
                  "flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium transition-colors",
                  theme === "light" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
                )}
              >
                <Sun className="h-3.5 w-3.5" />
                Light
              </button>
              <button
                onClick={() => setTheme("dark")}
                className={cn(
                  "flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium transition-colors",
                  theme === "dark" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
                )}
              >
                <Moon className="h-3.5 w-3.5" />
                Dark
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card className="border-border">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center">
              <Bell className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Notifications</h3>
              <p className="text-xs text-muted-foreground">Choose what you&apos;re notified about</p>
            </div>
          </div>

          <div className="space-y-4">
            {[
              { key: "planUpdates" as const, label: "Plan updates" },
              { key: "taskAssignments" as const, label: "Task assignments" },
              { key: "expenseChanges" as const, label: "Expense changes" },
              { key: "memberInvites" as const, label: "Member invites" },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between">
                <span className="text-sm text-foreground">{item.label}</span>
                <button
                  onClick={() => toggleNotif(item.key)}
                  className={cn(
                    "relative h-6 w-11 rounded-full transition-colors",
                    notifications[item.key] ? "bg-primary" : "bg-muted-foreground/30"
                  )}
                >
                  <div
                    className={cn(
                      "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform",
                      notifications[item.key] ? "translate-x-5.5" : "translate-x-0.5"
                    )}
                  />
                </button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Referral Link */}
      <Card className="border-border">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center">
              <Link2 className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Referral Link</h3>
              <p className="text-xs text-muted-foreground">Invite people to join Planova</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={referralLink}
              readOnly
              className="flex-1 h-10 px-3 rounded-lg border border-border bg-muted/30 text-sm text-muted-foreground truncate"
            />
            <button
              onClick={copyReferral}
              className="h-10 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-1.5"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Account */}
      <Card className="border-border">
        <CardContent className="p-6">
          <h3 className="font-semibold text-foreground mb-1">Account</h3>
          <p className="text-sm text-muted-foreground mb-4">Manage your session and data</p>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Sign out</p>
              <p className="text-xs text-muted-foreground">You&apos;ll need to sign in again to access your plans</p>
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-red-200 text-red-600 text-sm font-medium hover:bg-red-50 transition-colors dark:border-red-900 dark:hover:bg-red-950/50"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
