"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { useThemeStore } from "@/stores/theme-store";
import Sidebar from "@/components/layout/sidebar";
import TopNav from "@/components/layout/topnav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, hydrated, hydrate } = useAuthStore();
  const { hydrate: hydrateTheme } = useThemeStore();
  const router = useRouter();

  useEffect(() => {
    hydrate();
    hydrateTheme();
    // Clear stale pending invite if user is already logged in
    localStorage.removeItem("pendingInvite");
  }, [hydrate, hydrateTheme]);

  useEffect(() => {
    if (hydrated && !isAuthenticated) {
      router.push("/login");
    }
  }, [hydrated, isAuthenticated, router]);

  if (!hydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNav />
        <main className="flex-1 overflow-y-auto bg-background p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
