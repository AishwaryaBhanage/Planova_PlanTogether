"use client";

import { Wallet } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function BalancesPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-foreground">Balances</h1>
      <p className="text-sm text-muted-foreground mt-0.5 mb-6">
        See who owes whom across all your plans
      </p>

      <Card className="border-border">
        <CardContent className="flex flex-col items-center py-16 text-center">
          <div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
            <Wallet className="h-7 w-7 text-muted-foreground/40" />
          </div>
          <p className="font-semibold text-foreground">All settled up!</p>
          <p className="text-sm text-muted-foreground mt-1 max-w-xs">
            No outstanding balances. Add expenses in your plans to start tracking.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
