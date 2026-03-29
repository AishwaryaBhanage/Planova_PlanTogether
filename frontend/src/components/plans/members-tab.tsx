"use client";

import { useState, useEffect } from "react";
import {
  Plus, UserMinus, Crown, Shield, User, Mail, Link2,
  Copy, Check, Trash2, Clock,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { planAPI, inviteAPI, type PlanMember, type InviteLinkData } from "@/services/api";
import { useAuthStore } from "@/stores/auth-store";
import { toast } from "sonner";

interface MembersTabProps {
  planId: string;
  members: PlanMember[];
  onUpdate: () => void;
}

const roleIcons: Record<string, React.ElementType> = {
  admin: Crown, member: User, viewer: Shield,
};
const roleColors: Record<string, string> = {
  admin: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
  member: "bg-secondary text-secondary-foreground",
  viewer: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
};

export default function MembersTab({ planId, members, onUpdate }: MembersTabProps) {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<"members" | "email" | "link">("members");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("member");
  const [error, setError] = useState("");
  const [inviting, setInviting] = useState(false);

  // Invite link state
  const [inviteLinks, setInviteLinks] = useState<InviteLinkData[]>([]);
  const [linkRole, setLinkRole] = useState("member");
  const [linkExpiry, setLinkExpiry] = useState("14");
  const [creatingLink, setCreatingLink] = useState(false);
  const [copiedId, setCopiedId] = useState("");

  const currentUserRole = members.find((m) => m.userId === user?.id)?.role;
  const isAdmin = currentUserRole === "admin";

  useEffect(() => {
    if (isAdmin) {
      inviteAPI.getLinks(planId).then(({ data }) => setInviteLinks(data.inviteLinks || [])).catch(() => {});
    }
  }, [planId, isAdmin]);

  const handleEmailInvite = async () => {
    if (!email.trim()) return;
    setError("");
    setInviting(true);
    try {
      await planAPI.addMember(planId, { email, role });
      setEmail("");
      setActiveTab("members");
      toast.success("Member added!");
      onUpdate();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } };
      setError(axiosErr.response?.data?.error || "Failed to invite");
    } finally {
      setInviting(false);
    }
  };

  const handleCreateLink = async () => {
    setCreatingLink(true);
    try {
      const { data } = await inviteAPI.createLink(planId, {
        role: linkRole,
        expiresInDays: linkExpiry === "never" ? undefined : parseInt(linkExpiry),
      });
      setInviteLinks((prev) => [data.inviteLink, ...prev]);
      navigator.clipboard.writeText(data.inviteLink.url);
      toast.success("Invite link created & copied!");
    } catch {
      toast.error("Failed to create link");
    } finally {
      setCreatingLink(false);
    }
  };

  const copyLink = (link: InviteLinkData) => {
    navigator.clipboard.writeText(link.url);
    setCopiedId(link.id);
    toast.success("Link copied!");
    setTimeout(() => setCopiedId(""), 2000);
  };

  const revokeLink = async (linkId: string) => {
    try {
      await inviteAPI.revokeLink(planId, linkId);
      setInviteLinks((prev) => prev.filter((l) => l.id !== linkId));
      toast.success("Link revoked");
    } catch {
      toast.error("Failed to revoke link");
    }
  };

  const handleRemove = async (userId: string, name: string) => {
    if (!confirm(`Remove ${name} from this plan?`)) return;
    try {
      await planAPI.removeMember(planId, userId);
      toast.success("Member removed");
      onUpdate();
    } catch {
      toast.error("Failed to remove member");
    }
  };

  return (
    <div className="space-y-5">
      {/* Header with action tabs */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground">Members ({members.length})</h3>
        {isAdmin && (
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setActiveTab(activeTab === "email" ? "members" : "email")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                activeTab === "email" ? "bg-primary text-primary-foreground" : "border border-border text-foreground hover:bg-muted"
              )}
            >
              <Mail className="h-3.5 w-3.5" />
              Invite by Email
            </button>
            <button
              onClick={() => setActiveTab(activeTab === "link" ? "members" : "link")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                activeTab === "link" ? "bg-primary text-primary-foreground" : "border border-border text-foreground hover:bg-muted"
              )}
            >
              <Link2 className="h-3.5 w-3.5" />
              Invite Link
            </button>
          </div>
        )}
      </div>

      {/* Email invite panel */}
      {activeTab === "email" && (
        <Card className="border-border">
          <CardContent className="p-4 space-y-3">
            <h4 className="font-medium text-foreground text-sm">Invite by Email</h4>
            {error && <div className="p-2 rounded-lg bg-red-50 text-red-600 text-sm dark:bg-red-950/50">{error}</div>}
            <div className="flex gap-2">
              <input
                placeholder="Enter email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleEmailInvite()}
                className="flex-1 h-10 px-3 rounded-lg border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="h-10 px-3 rounded-lg border border-border bg-card text-sm text-foreground"
              >
                <option value="member">Member</option>
                <option value="admin">Admin</option>
                <option value="viewer">Viewer</option>
              </select>
              <button
                onClick={handleEmailInvite}
                disabled={inviting}
                className="h-10 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 disabled:opacity-40"
              >
                {inviting ? "..." : "Invite"}
              </button>
            </div>
            <p className="text-xs text-muted-foreground">User must have a Planova account. They&apos;ll be added immediately.</p>
          </CardContent>
        </Card>
      )}

      {/* Invite link panel */}
      {activeTab === "link" && (
        <Card className="border-border">
          <CardContent className="p-4 space-y-4">
            <h4 className="font-medium text-foreground text-sm">Create Invite Link</h4>
            <div className="flex flex-wrap gap-2">
              <select
                value={linkRole}
                onChange={(e) => setLinkRole(e.target.value)}
                className="h-10 px-3 rounded-lg border border-border bg-card text-sm text-foreground"
              >
                <option value="member">Member role</option>
                <option value="viewer">Viewer role</option>
              </select>
              <select
                value={linkExpiry}
                onChange={(e) => setLinkExpiry(e.target.value)}
                className="h-10 px-3 rounded-lg border border-border bg-card text-sm text-foreground"
              >
                <option value="7">Expires in 7 days</option>
                <option value="14">Expires in 14 days</option>
                <option value="30">Expires in 30 days</option>
                <option value="90">Expires in 90 days</option>
                <option value="never">Never expires</option>
              </select>
              <button
                onClick={handleCreateLink}
                disabled={creatingLink}
                className="h-10 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 disabled:opacity-40"
              >
                {creatingLink ? "Creating..." : "Create & Copy Link"}
              </button>
            </div>
            <p className="text-xs text-muted-foreground">Anyone with this link can join the plan. Share it with people you trust.</p>

            {/* Active links */}
            {inviteLinks.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-border">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Active Links</p>
                {inviteLinks.map((link) => (
                  <div key={link.id} className="flex items-center gap-2 p-2.5 rounded-lg bg-muted/50">
                    <Link2 className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-foreground font-mono truncate">{link.url}</p>
                      <div className="flex items-center gap-2 mt-0.5 text-[11px] text-muted-foreground">
                        <span className="capitalize">{link.role}</span>
                        {link.expiresAt && (
                          <>
                            <span>·</span>
                            <span className={cn("flex items-center gap-0.5", link.expired && "text-red-500")}>
                              <Clock className="h-3 w-3" />
                              {link.expired ? "Expired" : `Expires ${new Date(link.expiresAt).toLocaleDateString()}`}
                            </span>
                          </>
                        )}
                        {!link.expiresAt && <><span>·</span><span>Never expires</span></>}
                      </div>
                    </div>
                    <button
                      onClick={() => copyLink(link)}
                      className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {copiedId === link.id ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                    </button>
                    <button
                      onClick={() => revokeLink(link.id)}
                      className="p-1.5 rounded-md hover:bg-red-50 text-muted-foreground hover:text-red-500 transition-colors dark:hover:bg-red-950/50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Members list */}
      <div className="space-y-2">
        {members.map((m) => {
          const RoleIcon = roleIcons[m.role] || User;
          return (
            <Card key={m.id} className="border-border">
              <CardContent className="p-4 flex items-center gap-4">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                    {m.user?.name?.[0]?.toUpperCase() || "?"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground text-sm">
                    {m.user?.name}
                    {m.userId === user?.id && (
                      <span className="text-muted-foreground"> (you)</span>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">{m.user?.email}</p>
                </div>
                <Badge
                  variant="secondary"
                  className={cn("text-[10px] font-semibold gap-1 border-0", roleColors[m.role])}
                >
                  <RoleIcon className="h-3 w-3" />
                  {m.role}
                </Badge>
                {isAdmin && m.userId !== user?.id && (
                  <button
                    onClick={() => handleRemove(m.userId, m.user?.name || "this member")}
                    className="p-1.5 rounded-md hover:bg-red-50 text-muted-foreground/40 hover:text-red-500 transition-colors dark:hover:bg-red-950/50"
                  >
                    <UserMinus className="h-4 w-4" />
                  </button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
