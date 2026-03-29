"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Plane, Cake, PartyPopper, Briefcase, Calendar,
  Users, Clock, Check, AlertCircle,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { inviteAPI, type InvitePreview } from "@/services/api";
import { useAuthStore } from "@/stores/auth-store";
import { toast } from "sonner";

const typeIcons: Record<string, React.ElementType> = {
  trip: Plane, birthday: Cake, event: PartyPopper,
  conference: Briefcase, custom: Calendar,
};
const typeGradients: Record<string, string> = {
  trip: "from-blue-400 via-indigo-300 to-sky-200",
  birthday: "from-rose-300 via-pink-200 to-fuchsia-200",
  event: "from-violet-300 via-purple-200 to-indigo-200",
  conference: "from-slate-300 via-blue-200 to-slate-200",
  custom: "from-teal-300 via-cyan-200 to-emerald-200",
};

export default function JoinPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;
  const { isAuthenticated, hydrated, hydrate } = useAuthStore();

  const [invite, setInvite] = useState<InvitePreview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    inviteAPI
      .getPreview(token)
      .then(({ data }) => setInvite(data.invite))
      .catch((err) => {
        const msg = err.response?.data?.error || "Invalid invite link";
        setError(msg);
      })
      .finally(() => setLoading(false));
  }, [token]);

  const handleJoin = async () => {
    setJoining(true);
    try {
      const { data } = await inviteAPI.accept(token);
      if (data.alreadyMember) {
        toast.info("You're already a member of this plan");
      } else {
        toast.success("Joined successfully!");
      }
      router.push(`/plans/${data.planId}`);
    } catch {
      toast.error("Failed to join plan");
      setJoining(false);
    }
  };

  const handleAuthRedirect = (path: string) => {
    localStorage.setItem("pendingInvite", token);
    router.push(path);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-indigo-50/30 to-slate-100">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-indigo-50/30 to-slate-100">
        <Card className="w-full max-w-md mx-4 shadow-xl border-0">
          <CardContent className="p-8 text-center">
            <div className="h-14 w-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-7 w-7 text-red-500" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 mb-2">
              {error === "This invite link has expired" ? "Link Expired" : "Invalid Link"}
            </h1>
            <p className="text-sm text-slate-500 mb-6">{error}</p>
            <Link
              href="/dashboard"
              className="inline-block px-5 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition-colors"
            >
              Go to Dashboard
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const Icon = typeIcons[invite?.planType || "custom"] || Calendar;
  const gradient = typeGradients[invite?.planType || "custom"] || typeGradients.custom;
  const fmtDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-indigo-50/30 to-slate-100 p-4">
      <Card className="w-full max-w-md shadow-xl border-0 overflow-hidden">
        {/* Gradient header */}
        <div className={`h-28 bg-gradient-to-r ${gradient} flex items-end p-5`}>
          <div className="h-12 w-12 rounded-xl bg-white/30 backdrop-blur-md flex items-center justify-center">
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>

        <CardContent className="p-6">
          {/* Plan info */}
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
            You&apos;re invited to join
          </p>
          <h1 className="text-2xl font-bold text-foreground">{invite?.planName}</h1>

          {invite?.planDescription && (
            <p className="text-sm text-muted-foreground mt-2">{invite.planDescription}</p>
          )}

          <div className="flex flex-wrap items-center gap-3 mt-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {invite?.startDate ? fmtDate(invite.startDate) : ""}
              {invite?.endDate ? ` – ${fmtDate(invite.endDate)}` : ""}
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              {invite?.memberCount} member{invite?.memberCount !== 1 ? "s" : ""}
            </span>
          </div>

          <div className="mt-3 text-sm text-muted-foreground">
            Invited by <span className="font-medium text-foreground">{invite?.invitedBy}</span> as{" "}
            <span className="font-medium text-foreground capitalize">{invite?.role}</span>
          </div>

          {/* Action */}
          <div className="mt-6 space-y-3">
            {hydrated && isAuthenticated ? (
              <button
                onClick={handleJoin}
                disabled={joining}
                className="w-full h-11 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {joining ? (
                  "Joining..."
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    Join Plan
                  </>
                )}
              </button>
            ) : (
              <>
                <button
                  onClick={() => handleAuthRedirect("/login")}
                  className="w-full h-11 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition-colors"
                >
                  Sign in to join
                </button>
                <button
                  onClick={() => handleAuthRedirect("/register")}
                  className="w-full h-11 rounded-xl border border-border text-foreground text-sm font-semibold hover:bg-muted transition-colors"
                >
                  Create account to join
                </button>
              </>
            )}
          </div>

          <p className="text-center text-xs text-muted-foreground mt-4">
            Powered by <span className="font-semibold text-primary">Planova</span>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
