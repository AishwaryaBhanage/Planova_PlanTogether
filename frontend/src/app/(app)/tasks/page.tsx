"use client";

import { useEffect, useState } from "react";
import { Plus, CheckSquare, CheckCircle2, Circle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { taskAPI, planAPI, type Task, type Plan } from "@/services/api";
import { toast } from "sonner";

type TaskWithPlan = Task & { plan?: { id: string; name: string; type: string } };

const filterTabs = ["Pending", "Completed", "All"];

const priorityBadge: Record<string, string> = {
  high: "bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400",
  medium: "bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400",
  low: "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
};

export default function TasksPage() {
  const [tasks, setTasks] = useState<TaskWithPlan[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("Pending");
  const [quickTask, setQuickTask] = useState("");
  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [adding, setAdding] = useState(false);

  const fetchTasks = async () => {
    try {
      const [taskRes, planRes] = await Promise.all([
        taskAPI.getMyTasks(),
        planAPI.list(),
      ]);
      setTasks(taskRes.data.tasks || []);
      const p = planRes.data.plans || [];
      setPlans(p);
      if (p.length > 0 && !selectedPlanId) {
        setSelectedPlanId(p[0].id);
      }
    } catch {
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const addTask = async () => {
    if (!quickTask.trim()) return;
    if (!selectedPlanId) {
      toast.error("Create a plan first to add tasks");
      return;
    }
    setAdding(true);
    try {
      await planAPI.createTask(selectedPlanId, {
        title: quickTask.trim(),
        status: "todo",
        priority: "medium",
      });
      setQuickTask("");
      toast.success("Task added!");
      fetchTasks();
    } catch {
      toast.error("Failed to add task");
    } finally {
      setAdding(false);
    }
  };

  const toggleTask = async (task: TaskWithPlan) => {
    const newStatus = task.status === "done" ? "todo" : "done";
    try {
      await planAPI.updateTask(task.planId, task.id, { status: newStatus });
      toast.success(newStatus === "done" ? "Task completed!" : "Task reopened");
      fetchTasks();
    } catch {
      toast.error("Failed to update task");
    }
  };

  const pending = tasks.filter((t) => t.status !== "done");
  const completed = tasks.filter((t) => t.status === "done");
  const filtered =
    activeFilter === "Pending"
      ? pending
      : activeFilter === "Completed"
      ? completed
      : tasks;

  const fmtDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto space-y-3">
        <div className="h-8 w-40 bg-muted rounded animate-pulse" />
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-16 bg-muted rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-foreground">My Tasks</h1>
      <p className="text-sm text-muted-foreground mt-0.5 mb-6">
        {pending.length} pending · {completed.length} completed
      </p>

      {/* Quick Add */}
      <div className="flex items-center gap-2 mb-5">
        {plans.length > 1 && (
          <select
            value={selectedPlanId}
            onChange={(e) => setSelectedPlanId(e.target.value)}
            className="h-11 px-3 rounded-xl border border-border bg-card text-sm text-foreground shrink-0 max-w-[140px] truncate"
          >
            {plans.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        )}
        <div className="flex-1 flex items-center gap-2 h-11 px-4 rounded-xl border border-border bg-card text-sm">
          <Plus className="h-4 w-4 text-muted-foreground shrink-0" />
          <input
            type="text"
            placeholder="Add a task quickly... press Enter to save"
            value={quickTask}
            onChange={(e) => setQuickTask(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") addTask();
            }}
            className="flex-1 bg-transparent outline-none placeholder:text-muted-foreground text-foreground"
          />
        </div>
        <button
          onClick={addTask}
          disabled={adding || !quickTask.trim()}
          className="h-11 px-5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-40"
        >
          {adding ? "..." : "Add"}
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-1 mb-5">
        {filterTabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveFilter(tab)}
            className={cn(
              "px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors",
              activeFilter === tab
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted"
            )}
          >
            {tab}
            {tab === "Pending" && (
              <span className="ml-1.5 text-xs">{pending.length}</span>
            )}
            {tab === "Completed" && completed.length > 0 && (
              <span className="ml-1.5 text-xs">{completed.length}</span>
            )}
          </button>
        ))}
      </div>

      {/* Task list */}
      {filtered.length > 0 ? (
        <div className="space-y-2">
          {filtered.map((task) => (
            <Card
              key={task.id}
              className={cn(
                "border-border hover:shadow-sm transition-all",
                task.status === "done" && "opacity-50"
              )}
            >
              <CardContent className="p-4 flex items-center gap-4">
                <button
                  onClick={() => toggleTask(task)}
                  className="shrink-0 transition-transform hover:scale-110"
                >
                  {task.status === "done" ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  ) : (
                    <Circle className="h-5 w-5 text-muted-foreground/40 hover:text-primary transition-colors" />
                  )}
                </button>
                <div className="flex-1 min-w-0">
                  <p
                    className={cn(
                      "text-sm font-medium transition-all",
                      task.status === "done"
                        ? "line-through text-muted-foreground"
                        : "text-foreground"
                    )}
                  >
                    {task.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    {task.plan && (
                      <span className="text-xs text-muted-foreground">
                        {task.plan.name}
                      </span>
                    )}
                    <Badge
                      variant="secondary"
                      className={cn(
                        "text-[10px] font-semibold px-1.5 py-0 h-4 border-0",
                        priorityBadge[task.priority]
                      )}
                    >
                      {task.priority === "high"
                        ? "High"
                        : task.priority === "medium"
                        ? "Med"
                        : "Low"}
                    </Badge>
                  </div>
                </div>
                {task.dueDate && (
                  <span className="text-xs text-muted-foreground shrink-0">
                    {fmtDate(task.dueDate)}
                  </span>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-border">
          <CardContent className="flex flex-col items-center py-16 text-center">
            <div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
              <CheckSquare className="h-7 w-7 text-muted-foreground/40" />
            </div>
            <p className="font-semibold text-foreground">
              {activeFilter === "Pending"
                ? "All caught up!"
                : activeFilter === "Completed"
                ? "No completed tasks"
                : "No tasks yet"}
            </p>
            <p className="text-sm text-muted-foreground mt-1 max-w-xs">
              {activeFilter === "Pending"
                ? "No pending tasks. Nice work!"
                : activeFilter === "Completed"
                ? "Complete some tasks and they'll show here."
                : "Use the input above to add your first task."}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
