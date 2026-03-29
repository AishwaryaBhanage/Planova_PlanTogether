import { create } from "zustand";
import { dashboardAPI } from "@/services/api";

interface NotificationState {
  unreadCount: number;
  lastReadAt: string | null;
  activities: { id: string; user: string; action: string; target: string; createdAt: string }[];
  loading: boolean;
  fetchAndCount: () => Promise<void>;
  markAllRead: () => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  unreadCount: 0,
  lastReadAt: typeof window !== "undefined" ? localStorage.getItem("notif_lastReadAt") : null,
  activities: [],
  loading: false,

  fetchAndCount: async () => {
    set({ loading: true });
    try {
      const { data } = await dashboardAPI.get();
      const activities = data.recentActivity || [];
      const lastReadAt = get().lastReadAt;
      const unreadCount = lastReadAt
        ? activities.filter((a: { createdAt: string }) => new Date(a.createdAt) > new Date(lastReadAt)).length
        : activities.length;
      set({ activities, unreadCount, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  markAllRead: () => {
    const now = new Date().toISOString();
    localStorage.setItem("notif_lastReadAt", now);
    set({ lastReadAt: now, unreadCount: 0 });
  },
}));
