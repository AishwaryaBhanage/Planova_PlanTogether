"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Receipt, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { planAPI, type Expense, type PlanMember } from "@/services/api";

interface ExpensesTabProps {
  planId: string;
  members: PlanMember[];
}

export default function ExpensesTab({ planId, members }: ExpensesTabProps) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newExpense, setNewExpense] = useState({
    title: "",
    amount: "",
    paidById: "",
    splitAmong: [] as string[],
  });

  const fetchExpenses = async () => {
    try {
      const { data } = await planAPI.getExpenses(planId);
      setExpenses(data.expenses || []);
    } catch {
      setExpenses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [planId]);

  const toggleSplitMember = (userId: string) => {
    setNewExpense((prev) => ({
      ...prev,
      splitAmong: prev.splitAmong.includes(userId)
        ? prev.splitAmong.filter((id) => id !== userId)
        : [...prev.splitAmong, userId],
    }));
  };

  const handleAdd = async () => {
    if (!newExpense.title || !newExpense.amount || !newExpense.paidById) return;
    const splitList =
      newExpense.splitAmong.length > 0
        ? newExpense.splitAmong
        : members.map((m) => m.userId);

    try {
      await planAPI.createExpense(planId, {
        title: newExpense.title,
        amount: parseFloat(newExpense.amount),
        paidById: newExpense.paidById,
        splitAmong: splitList,
      });
      setNewExpense({ title: "", amount: "", paidById: "", splitAmong: [] });
      setShowAdd(false);
      fetchExpenses();
    } catch {
      // Silently fail
    }
  };

  const handleDelete = async (expenseId: string) => {
    try {
      await planAPI.deleteExpense(planId, expenseId);
      fetchExpenses();
    } catch {
      // Silently fail
    }
  };

  // Calculate balances
  const balances: Record<string, number> = {};
  members.forEach((m) => (balances[m.userId] = 0));

  expenses.forEach((exp) => {
    const splitCount = exp.splitAmong?.length || members.length;
    const perPerson = exp.amount / splitCount;
    if (balances[exp.paidById] !== undefined) {
      balances[exp.paidById] += exp.amount - perPerson;
    }
    (exp.splitAmong || []).forEach((uid) => {
      if (uid !== exp.paidById && balances[uid] !== undefined) {
        balances[uid] -= perPerson;
      }
    });
  });

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  const getMemberName = (userId: string) => {
    return members.find((m) => m.userId === userId)?.user?.name || "Unknown";
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-6 w-6 animate-spin rounded-full border-3 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-foreground">Expenses</h3>
          <p className="text-sm text-muted-foreground">
            Total: ${totalExpenses.toFixed(2)}
          </p>
        </div>
        <Button size="sm" onClick={() => setShowAdd(!showAdd)}>
          <Plus className="h-4 w-4 mr-1" />
          Add Expense
        </Button>
      </div>

      {/* Add Expense Form */}
      {showAdd && (
        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Description</Label>
                <Input
                  placeholder="e.g. Dinner, Hotel"
                  value={newExpense.title}
                  onChange={(e) =>
                    setNewExpense({ ...newExpense, title: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Amount ($)</Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={newExpense.amount}
                  onChange={(e) =>
                    setNewExpense({ ...newExpense, amount: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Paid by</Label>
              <select
                value={newExpense.paidById}
                onChange={(e) =>
                  setNewExpense({ ...newExpense, paidById: e.target.value })
                }
                className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-white"
              >
                <option value="">Select who paid</option>
                {members.map((m) => (
                  <option key={m.userId} value={m.userId}>
                    {m.user?.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">
                Split among (leave empty for all)
              </Label>
              <div className="flex flex-wrap gap-2">
                {members.map((m) => (
                  <button
                    key={m.userId}
                    onClick={() => toggleSplitMember(m.userId)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      newExpense.splitAmong.includes(m.userId)
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    }`}
                  >
                    {m.user?.name?.split(" ")[0]}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleAdd}>
                Add Expense
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

      {/* Balances */}
      {expenses.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <h4 className="text-sm font-semibold text-foreground mb-3">
              Balances
            </h4>
            <div className="space-y-2">
              {Object.entries(balances).map(([userId, amount]) => (
                <div
                  key={userId}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-foreground">
                    {getMemberName(userId)}
                  </span>
                  <span
                    className={
                      amount >= 0 ? "text-emerald-600 font-medium" : "text-red-500 font-medium"
                    }
                  >
                    {amount >= 0
                      ? `gets back $${amount.toFixed(2)}`
                      : `owes $${Math.abs(amount).toFixed(2)}`}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Expense List */}
      <div className="space-y-3">
        {expenses.map((exp) => (
          <Card key={exp.id} className="group">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                <Receipt className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground text-sm">
                  {exp.title}
                </p>
                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                  <span>Paid by {getMemberName(exp.paidById)}</span>
                  <ArrowRight className="h-3 w-3" />
                  <span>
                    Split {exp.splitAmong?.length || members.length} ways
                  </span>
                </div>
              </div>
              <p className="font-bold text-foreground">${exp.amount.toFixed(2)}</p>
              <button
                onClick={() => handleDelete(exp.id)}
                className="p-1.5 hover:bg-red-50 rounded opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-red-500"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </CardContent>
          </Card>
        ))}
        {expenses.length === 0 && (
          <div className="text-center py-12 border border-dashed border-border rounded-xl">
            <Receipt className="h-10 w-10 mx-auto mb-2 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">No expenses yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              Add your first expense to start tracking splits
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
