"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Card } from "primereact/card";
import { Skeleton } from "primereact/skeleton";
import { Toast } from "primereact/toast";
import { Navigation } from "@/components/Navigation";
import { BudgetForm } from "@/components/BudgetForm";

interface Category {
  id: number; name: string; type: string;
  icon: string | null; color: string | null;
}

interface BudgetItem {
  id: number; categoryId: number; weeklyAmount: number;
  category: Category;
}

export default function BudgetPage() {
  const [budgets, setBudgets] = useState<BudgetItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const toast = useRef<Toast>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [budgetRes, catRes] = await Promise.all([
        fetch("/api/weekly-budget"),
        fetch("/api/categories"),
      ]);
      if (!budgetRes.ok) throw new Error("Failed to load budgets");
      if (!catRes.ok) throw new Error("Failed to load categories");
      setBudgets((await budgetRes.json()).budgets || []);
      setCategories((await catRes.json()).categories || []);
    } catch (err) {
      toast.current?.show({ severity: "error", summary: "Error", detail: (err as Error).message, life: 5000 });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSave = async (categoryId: number, weeklyAmount: number) => {
    try {
      const res = await fetch("/api/weekly-budget", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categoryId, weeklyAmount }),
      });
      if (!res.ok) throw new Error("Failed to save budget");
      toast.current?.show({ severity: "success", summary: "Saved", detail: "Budget updated", life: 3000 });
      fetchData();
    } catch (err) {
      toast.current?.show({ severity: "error", summary: "Error", detail: (err as Error).message });
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`/api/weekly-budget?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete budget");
      toast.current?.show({ severity: "info", summary: "Removed", detail: "Budget deleted", life: 3000 });
      fetchData();
    } catch (err) {
      toast.current?.show({ severity: "error", summary: "Error", detail: (err as Error).message });
    }
  };

  const totalBudget = budgets.reduce((s, b) => s + b.weeklyAmount, 0);

  if (loading) {
    return (
      <div>
        <Navigation />
        <div className="max-w-3xl mx-auto p-6 space-y-4">
          <Skeleton width="200px" height="2rem" />
          <Skeleton height="3rem" borderRadius="12px" />
          {[1, 2, 3].map((i) => <Skeleton key={i} height="4rem" borderRadius="12px" />)}
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navigation />
      <Toast ref={toast} />
      <main className="max-w-3xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Weekly Budget</h1>
            <p className="text-sm text-slate-500 mt-1">Set spending limits for each expense category</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-400">Total Budget</p>
            <p className="text-2xl font-bold text-slate-800">${totalBudget.toFixed(2)}</p>
          </div>
        </div>

        <Card title="Set Category Budgets">
          <BudgetForm budgets={budgets} categories={categories} onSave={handleSave} onDelete={handleDelete} />
        </Card>
      </main>
    </div>
  );
}
