"use client";

import { Receipt, Plus, Plane, Home, UtensilsCrossed, Ticket, ShoppingBag, MoreHorizontal } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const stats = [
  { label: "TOTAL SPENT", value: "$0", icon: Receipt, color: "bg-indigo-50 text-indigo-600" },
  { label: "YOU OWE", value: "$0", sub: "unsettled", icon: Receipt, color: "bg-rose-50 text-rose-600" },
  { label: "EXPENSES", value: "0", sub: "total entries", icon: Receipt, color: "bg-emerald-50 text-emerald-600" },
  { label: "PLANS", value: "0", sub: "with expenses", icon: Receipt, color: "bg-amber-50 text-amber-600" },
];

export default function ExpensesPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Expenses</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Track and split costs across all your plans
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity shadow-sm">
          <Plus className="h-4 w-4" />
          Add Expense
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((s) => (
          <Card key={s.label} className="border-border">
            <CardContent className="p-4 flex items-start gap-3">
              <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${s.color}`}>
                <s.icon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{s.label}</p>
                <p className="text-xl font-bold text-foreground leading-tight">{s.value}</p>
                {s.sub && <p className="text-[11px] text-muted-foreground">{s.sub}</p>}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Expense list — empty state */}
      <Card className="border-border">
        <CardContent className="flex flex-col items-center py-16 text-center">
          <div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
            <Receipt className="h-7 w-7 text-muted-foreground/40" />
          </div>
          <p className="font-semibold text-foreground">No expenses yet</p>
          <p className="text-sm text-muted-foreground mt-1 max-w-xs">
            Expenses from your plans will appear here. Add expenses within a plan to start tracking.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
