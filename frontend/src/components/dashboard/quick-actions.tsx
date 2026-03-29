"use client";

import Link from "next/link";
import { Plus, Receipt, ListTodo, Wallet } from "lucide-react";

const actions = [
  { label: "Create Plan", icon: Plus, href: "/plans/new", color: "bg-violet-50 text-violet-600 hover:bg-violet-100" },
  { label: "Add Expense", icon: Receipt, href: "/plans/new", color: "bg-blue-50 text-blue-600 hover:bg-blue-100" },
  { label: "View Tasks", icon: ListTodo, href: "/tasks", color: "bg-amber-50 text-amber-600 hover:bg-amber-100" },
  { label: "Settle Up", icon: Wallet, href: "/balances", color: "bg-emerald-50 text-emerald-600 hover:bg-emerald-100" },
];

export default function QuickActions() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {actions.map((action) => (
        <Link
          key={action.label}
          href={action.href}
          className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${action.color}`}
        >
          <action.icon className="h-4 w-4" />
          {action.label}
        </Link>
      ))}
    </div>
  );
}
