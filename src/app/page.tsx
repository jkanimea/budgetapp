"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Card } from "primereact/card";
import { Skeleton } from "primereact/skeleton";
import { Toast } from "primereact/toast";
import { Navigation } from "@/components/Navigation";
import { WeeklySummaryCard } from "@/components/WeeklySummaryCard";
import { WeeklyTrendChart } from "@/components/WeeklyTrendChart";
import { ExpensePieChart } from "@/components/ExpensePieChart";
import { BudgetChart } from "@/components/BudgetChart";

interface DashboardData {
  currentWeek: {
    weekStart: string;
    weekEnd: string;
    totalIncome: number;
    totalExpense: number;
    netSavings: number;
    categoryBreakdown: { categoryName: string; amount: number; percentage: number }[];
  };
  weeklyHistory: {
    weekStart: string; weekEnd: string;
    totalIncome: number; totalExpense: number; netSavings: number;
  }[];
  topExpenses: { categoryName: string; amount: number; percentage: number }[];
  totalIncome: number; totalExpense: number; totalSavings: number;
  budgetComparison: { categoryName: string; budgeted: number; spent: number; remaining: number }[];
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const toast = useRef<Toast>(null);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/dashboard");
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const d = await res.json();
      if (!d.data) throw new Error("Invalid response from server");
      setData(d.data);
    } catch (err) {
      const msg = (err as Error).message;
      setError(msg);
      toast.current?.show({ severity: "error", summary: "Error", detail: msg, life: 5000 });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDashboard(); }, [fetchDashboard]);

  const fmt = (n: number) =>
    new Intl.NumberFormat("en-NZ", { style: "currency", currency: "NZD" }).format(n);

  if (error && !data) {
    return (
      <div>
        <Navigation />
        <Toast ref={toast} />
        <main className="max-w-7xl mx-auto p-6">
          <Card className="text-center py-8">
            <i className="pi pi-exclamation-triangle text-4xl text-red-400 block mb-3" />
            <p className="text-lg font-medium text-slate-700 mb-2">Failed to load dashboard</p>
            <p className="text-sm text-slate-500 mb-4">{error}</p>
            <button onClick={fetchDashboard} className="text-blue-600 hover:text-blue-800 text-sm font-medium underline">
              Try again
            </button>
          </Card>
        </main>
      </div>
    );
  }

  if (loading || !data) {
    return (
      <div>
        <Navigation />
        <div className="max-w-7xl mx-auto p-6 space-y-5">
          <Skeleton width="200px" height="2rem" />
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => <Skeleton key={i} height="100px" borderRadius="12px" />)}
          </div>
          <Skeleton height="280px" borderRadius="12px" />
          <Skeleton height="280px" borderRadius="12px" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navigation />
      <Toast ref={toast} />
      <main className="max-w-7xl mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">
            {data.currentWeek.weekStart} &mdash; {data.currentWeek.weekEnd}
          </p>
        </div>

        <WeeklySummaryCard
          totalIncome={data.currentWeek.totalIncome}
          totalExpense={data.currentWeek.totalExpense}
          netSavings={data.currentWeek.netSavings}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card title="Weekly Trends (12 weeks)">
            <WeeklyTrendChart data={data.weeklyHistory} />
          </Card>
          <Card title="Expense Breakdown">
            <ExpensePieChart data={data.currentWeek.categoryBreakdown} />
          </Card>
        </div>

        <Card title="Budget vs Actual">
          <BudgetChart data={data.budgetComparison} />
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card title="Top Expenses This Week">
            <div className="space-y-3">
              {data.topExpenses.map((e, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-medium text-slate-500">
                      {i + 1}
                    </span>
                    <span className="text-slate-700">{e.categoryName}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-slate-400">{e.percentage}%</span>
                    <span className="font-medium text-slate-800">{fmt(e.amount)}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card title="All-time Summary">
            <div className="space-y-4">
              {[
                { label: "Income", value: data.totalIncome, cls: "text-green-600" },
                { label: "Expenses", value: data.totalExpense, cls: "text-red-600" },
                { label: "Savings", value: data.totalSavings, cls: data.totalSavings >= 0 ? "text-blue-600" : "text-orange-600" },
              ].map((s) => (
                <div key={s.label} className="flex justify-between items-center py-2 border-b border-slate-100 last:border-0">
                  <span className="text-slate-600">{s.label}</span>
                  <span className={`text-lg font-bold ${s.cls}`}>{fmt(Math.abs(s.value))}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
