import axios from "axios";

const API_BASE_URL = "http://localhost:5001/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface LoginResponse {
  token: string;
  user: User;
  message: string;
}

export interface RegisterResponse {
  user: User;
  message: string;
}

export interface Plan {
  id: string;
  name: string;
  type: string;
  description: string;
  startDate: string;
  endDate: string | null;
  features: string[];
  createdBy: string;
  memberCount: number;
  tasksCompleted?: number;
  tasksTotal?: number;
  createdAt: string;
}

export interface PlanMember {
  id: string;
  planId: string;
  userId: string;
  role: string;
  user: User;
  createdAt: string;
}

export interface Task {
  id: string;
  planId: string;
  title: string;
  description?: string;
  status: "todo" | "in_progress" | "done";
  priority: "low" | "medium" | "high";
  assigneeId?: string;
  assignee?: User;
  dueDate?: string;
  createdAt: string;
}

export interface Expense {
  id: string;
  planId: string;
  title: string;
  amount: number;
  paidById: string;
  paidBy?: User;
  splitAmong: string[];
  createdAt: string;
}

export const authAPI = {
  register: (data: { name: string; email: string; password: string }) =>
    api.post<RegisterResponse>("/auth/register", data),
  login: (data: { email: string; password: string }) =>
    api.post<LoginResponse>("/auth/login", data),
  getProfile: () => api.get<{ user: User }>("/auth/profile"),
};

export const planAPI = {
  create: (data: {
    name: string;
    type: string;
    description?: string;
    startDate: string;
    endDate?: string;
    features: string[];
  }) => api.post<{ plan: Plan }>("/plans", data),
  list: () => api.get<{ plans: Plan[] }>("/plans"),
  get: (id: string) => api.get<{ plan: Plan; members: PlanMember[] }>(`/plans/${id}`),
  update: (id: string, data: Partial<Plan>) => api.put(`/plans/${id}`, data),
  delete: (id: string) => api.delete(`/plans/${id}`),

  // Members
  getMembers: (id: string) => api.get<{ members: PlanMember[] }>(`/plans/${id}/members`),
  addMember: (id: string, data: { email: string; role?: string }) =>
    api.post(`/plans/${id}/members`, data),
  removeMember: (id: string, userId: string) =>
    api.delete(`/plans/${id}/members/${userId}`),

  // Tasks
  getTasks: (id: string) => api.get<{ tasks: Task[] }>(`/plans/${id}/tasks`),
  createTask: (id: string, data: Partial<Task>) =>
    api.post<{ task: Task }>(`/plans/${id}/tasks`, data),
  updateTask: (id: string, taskId: string, data: Partial<Task>) =>
    api.put(`/plans/${id}/tasks/${taskId}`, data),
  deleteTask: (id: string, taskId: string) =>
    api.delete(`/plans/${id}/tasks/${taskId}`),

  // Expenses
  getExpenses: (id: string) => api.get<{ expenses: Expense[] }>(`/plans/${id}/expenses`),
  createExpense: (id: string, data: Partial<Expense>) =>
    api.post<{ expense: Expense }>(`/plans/${id}/expenses`, data),
  deleteExpense: (id: string, expenseId: string) =>
    api.delete(`/plans/${id}/expenses/${expenseId}`),

  // Activity
  getActivity: (id: string) => api.get(`/plans/${id}/activity`),
};

// Itinerary types
export interface ItineraryActivity {
  time: string;
  title: string;
  description: string;
  location: string;
  type: string;
  estimatedCost: number;
}

export interface ItineraryDay {
  id: string;
  dayNumber: number;
  date: string;
  title: string;
  activities: ItineraryActivity[];
  notes: string;
}

export interface Itinerary {
  id: string;
  status: "empty" | "ai_generated" | "accepted";
  days: ItineraryDay[];
}

export const itineraryAPI = {
  get: (planId: string) =>
    api.get<{ itinerary: Itinerary }>(`/plans/${planId}/itinerary`),
  generate: (planId: string) =>
    api.post<{ itinerary: Itinerary }>(`/plans/${planId}/itinerary/generate`),
  accept: (planId: string) =>
    api.post<{ itinerary: Itinerary }>(`/plans/${planId}/itinerary/accept`),
  decline: (planId: string) =>
    api.post<{ itinerary: Itinerary }>(`/plans/${planId}/itinerary/decline`),
  updateDay: (planId: string, dayId: string, data: Partial<ItineraryDay>) =>
    api.put<{ day: ItineraryDay }>(`/plans/${planId}/itinerary/days/${dayId}`, data),
  addDay: (planId: string, data: Partial<ItineraryDay>) =>
    api.post<{ day: ItineraryDay }>(`/plans/${planId}/itinerary/days`, data),
};

export const dashboardAPI = {
  get: () => api.get("/dashboard"),
};

export const taskAPI = {
  getMyTasks: () =>
    api.get<{ tasks: (Task & { plan?: { id: string; name: string; type: string } })[] }>("/tasks/my"),
};

export interface InvitePreview {
  planName: string;
  planType: string;
  planDescription: string;
  startDate: string;
  endDate: string | null;
  role: string;
  invitedBy: string;
  memberCount: number;
}

export interface InviteLinkData {
  id: string;
  token: string;
  role: string;
  expiresAt: string | null;
  expired?: boolean;
  url: string;
  createdBy?: string;
  createdAt: string;
}

export const inviteAPI = {
  // Public — no auth
  getPreview: (token: string) =>
    api.get<{ invite: InvitePreview }>(`/invite/${token}`),
  // Auth required
  accept: (token: string) =>
    api.post<{ message: string; planId: string; alreadyMember: boolean }>(`/invite/${token}/accept`),
  // Plan-scoped (admin)
  createLink: (planId: string, data: { role?: string; expiresInDays?: number }) =>
    api.post<{ inviteLink: InviteLinkData }>(`/plans/${planId}/invite-links`, data),
  getLinks: (planId: string) =>
    api.get<{ inviteLinks: InviteLinkData[] }>(`/plans/${planId}/invite-links`),
  revokeLink: (planId: string, linkId: string) =>
    api.delete(`/plans/${planId}/invite-links/${linkId}`),
};

export default api;
