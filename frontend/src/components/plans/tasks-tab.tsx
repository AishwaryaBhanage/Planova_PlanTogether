"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  GripVertical,
  Trash2,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { planAPI, type Task, type PlanMember } from "@/services/api";

interface TasksTabProps {
  planId: string;
  members: PlanMember[];
}

const columns = [
  { id: "todo" as const, label: "To Do", color: "bg-slate-100" },
  { id: "in_progress" as const, label: "In Progress", color: "bg-amber-50" },
  { id: "done" as const, label: "Done", color: "bg-emerald-50" },
];

const priorityColors: Record<string, string> = {
  high: "bg-red-100 text-red-700",
  medium: "bg-amber-100 text-amber-700",
  low: "bg-slate-100 text-slate-600",
};

export default function TasksTab({ planId, members }: TasksTabProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    priority: "medium" as "low" | "medium" | "high",
    assigneeId: "",
    dueDate: "",
  });

  const fetchTasks = async () => {
    try {
      const { data } = await planAPI.getTasks(planId);
      setTasks(data.tasks || []);
    } catch {
      // Tasks endpoint might not exist yet — show empty state
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [planId]);

  const handleAddTask = async () => {
    if (!newTask.title.trim()) return;
    try {
      await planAPI.createTask(planId, {
        title: newTask.title,
        priority: newTask.priority,
        assigneeId: newTask.assigneeId || undefined,
        dueDate: newTask.dueDate || undefined,
        status: "todo",
      });
      setNewTask({ title: "", priority: "medium", assigneeId: "", dueDate: "" });
      setShowAdd(false);
      fetchTasks();
    } catch {
      // Silently fail for now
    }
  };

  const handleStatusChange = async (task: Task, newStatus: Task["status"]) => {
    try {
      await planAPI.updateTask(planId, task.id, { status: newStatus });
      fetchTasks();
    } catch {
      // Silently fail
    }
  };

  const handleDelete = async (taskId: string) => {
    try {
      await planAPI.deleteTask(planId, taskId);
      fetchTasks();
    } catch {
      // Silently fail
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-6 w-6 animate-spin rounded-full border-3 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Add Task */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground">
          Tasks ({tasks.length})
        </h3>
        <Button size="sm" onClick={() => setShowAdd(!showAdd)}>
          <Plus className="h-4 w-4 mr-1" />
          Add Task
        </Button>
      </div>

      {showAdd && (
        <Card>
          <CardContent className="p-4 space-y-3">
            <Input
              placeholder="Task title"
              value={newTask.title}
              onChange={(e) =>
                setNewTask({ ...newTask, title: e.target.value })
              }
              onKeyDown={(e) => e.key === "Enter" && handleAddTask()}
            />
            <div className="flex flex-wrap gap-3">
              <select
                value={newTask.priority}
                onChange={(e) =>
                  setNewTask({
                    ...newTask,
                    priority: e.target.value as "low" | "medium" | "high",
                  })
                }
                className="text-sm border border-border rounded-lg px-3 py-1.5 bg-white"
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>
              <select
                value={newTask.assigneeId}
                onChange={(e) =>
                  setNewTask({ ...newTask, assigneeId: e.target.value })
                }
                className="text-sm border border-border rounded-lg px-3 py-1.5 bg-white"
              >
                <option value="">Unassigned</option>
                {members.map((m) => (
                  <option key={m.userId} value={m.userId}>
                    {m.user?.name}
                  </option>
                ))}
              </select>
              <Input
                type="date"
                value={newTask.dueDate}
                onChange={(e) =>
                  setNewTask({ ...newTask, dueDate: e.target.value })
                }
                className="w-auto"
              />
              <Button size="sm" onClick={handleAddTask}>
                Add
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowAdd(false)}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {columns.map((col) => {
          const colTasks = tasks.filter((t) => t.status === col.id);
          return (
            <div key={col.id} className="space-y-2">
              <div
                className={cn(
                  "px-3 py-2 rounded-lg flex items-center justify-between",
                  col.color
                )}
              >
                <span className="text-sm font-semibold text-foreground">
                  {col.label}
                </span>
                <span className="text-xs text-muted-foreground">
                  {colTasks.length}
                </span>
              </div>
              <div className="space-y-2 min-h-[100px]">
                {colTasks.map((task) => (
                  <Card
                    key={task.id}
                    className="group hover:shadow-md transition-shadow"
                  >
                    <CardContent className="p-3">
                      <div className="flex items-start gap-2">
                        <GripVertical className="h-4 w-4 text-muted-foreground/30 mt-0.5 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground">
                            {task.title}
                          </p>
                          <div className="flex items-center gap-2 mt-2 flex-wrap">
                            <Badge
                              variant="secondary"
                              className={cn(
                                "text-xs",
                                priorityColors[task.priority]
                              )}
                            >
                              {task.priority}
                            </Badge>
                            {task.assignee && (
                              <div className="flex items-center gap-1">
                                <Avatar className="h-5 w-5">
                                  <AvatarFallback className="text-[10px] bg-secondary text-primary">
                                    {task.assignee.name?.[0]}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-xs text-muted-foreground">
                                  {task.assignee.name?.split(" ")[0]}
                                </span>
                              </div>
                            )}
                            {task.dueDate && (
                              <span className="text-xs text-muted-foreground">
                                {task.dueDate}
                              </span>
                            )}
                          </div>
                          {/* Status change + delete */}
                          <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="relative">
                              <select
                                value={task.status}
                                onChange={(e) =>
                                  handleStatusChange(
                                    task,
                                    e.target.value as Task["status"]
                                  )
                                }
                                className="text-xs border border-border rounded px-2 py-1 bg-white appearance-none pr-6"
                              >
                                <option value="todo">To Do</option>
                                <option value="in_progress">In Progress</option>
                                <option value="done">Done</option>
                              </select>
                              <ChevronDown className="h-3 w-3 absolute right-1.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                            </div>
                            <button
                              onClick={() => handleDelete(task.id)}
                              className="p-1 hover:bg-red-50 rounded text-muted-foreground hover:text-red-500 transition-colors"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {colTasks.length === 0 && (
                  <div className="text-center py-6 text-xs text-muted-foreground border border-dashed border-border rounded-lg">
                    No tasks
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
