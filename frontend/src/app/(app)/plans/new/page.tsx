"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plane, Cake, Star, Briefcase, Gift, Calendar,
  ArrowLeft, ArrowRight, Check,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { planAPI } from "@/services/api";
import { toast } from "sonner";

const planTypes = [
  { id: "trip", label: "Trip", desc: "Vacation, travel, road trip", icon: Plane },
  { id: "birthday", label: "Birthday", desc: "Party planning & celebration", icon: Cake },
  { id: "surprise", label: "Surprise", desc: "Secret planning for someone", icon: Star },
  { id: "conference", label: "Conference", desc: "Work events & meetings", icon: Briefcase },
  { id: "gift", label: "Group Gift", desc: "Collect & organize gifts", icon: Gift },
  { id: "custom", label: "Custom", desc: "Any other type of plan", icon: Calendar },
];

const STEPS = ["Type", "Details", "Invite"];

export default function NewPlanPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    type: "",
    name: "",
    description: "",
    startDate: "",
    endDate: "",
    inviteEmails: "",
  });

  const canContinue = () => {
    if (step === 0) return !!form.type;
    if (step === 1) return !!form.name && !!form.startDate;
    return true;
  };

  const handleCreate = async () => {
    setCreating(true);
    setError("");
    try {
      const { data } = await planAPI.create({
        name: form.name,
        type: form.type === "surprise" || form.type === "gift" ? "custom" : form.type,
        description: form.description || undefined,
        startDate: form.startDate,
        endDate: form.endDate || undefined,
        features: ["tasks", "expenses", "itinerary"],
      });

      // Invite members by email (best-effort, don't block)
      if (form.inviteEmails.trim()) {
        const emails = form.inviteEmails.split(",").map((e) => e.trim()).filter(Boolean);
        for (const email of emails) {
          try {
            await planAPI.addMember(data.plan.id, { email, role: "member" });
          } catch {
            // Skip failed invites silently
          }
        }
        if (emails.length > 0) toast.success(`Plan created! Invited ${emails.length} member(s)`);
        else toast.success("Plan created!");
      } else {
        toast.success("Plan created!");
      }

      router.push(`/plans/${data.plan.id}`);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } };
      setError(axiosErr.response?.data?.error || "Failed to create plan");
      setCreating(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-10rem)] flex items-center justify-center">
      <div className="w-full max-w-xl">
        <Card className="border-border shadow-lg">
          <CardContent className="p-8">
            {/* Header */}
            <div className="flex items-center gap-3 mb-2">
              <button
                onClick={() => (step === 0 ? router.back() : setStep(step - 1))}
                className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-foreground">Create a New Plan</h1>
                <p className="text-sm text-muted-foreground">
                  Step {step + 1} of {STEPS.length} — {STEPS[step]}
                </p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="flex gap-1.5 mb-8 mt-4">
              {STEPS.map((label, i) => (
                <div key={label} className="flex-1">
                  <div
                    className={cn(
                      "h-1 rounded-full transition-colors",
                      i <= step ? "bg-primary" : "bg-muted"
                    )}
                  />
                  <p
                    className={cn(
                      "text-[11px] mt-1.5 font-medium",
                      i <= step ? "text-primary" : "text-muted-foreground"
                    )}
                  >
                    {label}
                  </p>
                </div>
              ))}
            </div>

            {/* Step 0: Type */}
            {step === 0 && (
              <div>
                <h2 className="text-lg font-bold text-foreground mb-1">What are you planning?</h2>
                <p className="text-sm text-muted-foreground mb-5">Choose a category to get started.</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {planTypes.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setForm({ ...form, type: type.id })}
                      className={cn(
                        "flex flex-col items-start p-4 rounded-xl border-2 transition-all text-left",
                        form.type === type.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-muted-foreground/30 hover:shadow-sm"
                      )}
                    >
                      <type.icon className={cn("h-6 w-6 mb-2.5", form.type === type.id ? "text-primary" : "text-foreground/50")} />
                      <p className="text-sm font-semibold text-foreground">{type.label}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5 leading-tight">{type.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 1: Details */}
            {step === 1 && (
              <div className="space-y-4">
                <h2 className="text-lg font-bold text-foreground mb-1">Plan details</h2>
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1.5">Plan Name</label>
                  <input
                    placeholder="e.g. Goa Trip 2026"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full h-11 px-4 rounded-xl border border-border bg-muted/30 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1.5">Description (optional)</label>
                  <input
                    placeholder="What's this plan about?"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full h-11 px-4 rounded-xl border border-border bg-muted/30 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium text-foreground block mb-1.5">Start Date</label>
                    <input
                      type="date"
                      value={form.startDate}
                      onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                      className="w-full h-11 px-4 rounded-xl border border-border bg-muted/30 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground block mb-1.5">End Date</label>
                    <input
                      type="date"
                      value={form.endDate}
                      onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                      className="w-full h-11 px-4 rounded-xl border border-border bg-muted/30 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Invite */}
            {step === 2 && (
              <div className="space-y-4">
                <h2 className="text-lg font-bold text-foreground mb-1">Invite members</h2>
                <p className="text-sm text-muted-foreground">Add people to your plan. You can also do this later.</p>
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1.5">Email addresses</label>
                  <textarea
                    placeholder="Enter emails, separated by commas"
                    value={form.inviteEmails}
                    onChange={(e) => setForm({ ...form, inviteEmails: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-muted/30 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 resize-none"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Or share an invite link after the plan is created.
                </p>
              </div>
            )}

            {error && (
              <div className="mt-4 p-3 rounded-xl bg-red-50 text-red-600 text-sm text-center dark:bg-red-950/30">
                {error}
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8">
              <button
                onClick={() => (step === 0 ? router.back() : setStep(step - 1))}
                className="px-4 py-2.5 rounded-xl border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors"
              >
                Back
              </button>

              {step < STEPS.length - 1 ? (
                <button
                  onClick={() => setStep(step + 1)}
                  disabled={!canContinue()}
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-40"
                >
                  Continue
                  <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  onClick={handleCreate}
                  disabled={creating}
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-40"
                >
                  {creating ? "Creating..." : "Create Plan"}
                  {!creating && <Check className="h-4 w-4" />}
                </button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
