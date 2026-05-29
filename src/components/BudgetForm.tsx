"use client";

import { useState } from "react";
import { Dropdown } from "primereact/dropdown";
import { InputNumber } from "primereact/inputnumber";
import { Button } from "primereact/button";
import { Card } from "primereact/card";

interface Category {
  id: number;
  name: string;
  type: string;
  icon: string | null;
  color: string | null;
}

interface BudgetItem {
  id: number;
  categoryId: number;
  weeklyAmount: number;
  category: Category;
}

interface Props {
  budgets: BudgetItem[];
  categories: Category[];
  onSave: (categoryId: number, weeklyAmount: number) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

export function BudgetForm({ budgets, categories, onSave, onDelete }: Props) {
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [amount, setAmount] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  const expenseCategories = categories.filter((c) => c.type === "EXPENSE");
  const budgetedIds = new Set(budgets.map((b) => b.categoryId));

  const categoryOptions = expenseCategories
    .filter((c) => !budgetedIds.has(c.id))
    .map((c) => ({ label: `${c.icon ?? ""} ${c.name}`.trim(), value: c.id }));

  const handleSave = async () => {
    if (!categoryId || !amount) return;
    setSaving(true);
    await onSave(categoryId, amount);
    setCategoryId(null);
    setAmount(null);
    setSaving(false);
  };

  return (
    <div className="space-y-5">
      <div className="flex gap-3 items-end flex-wrap">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-slate-700">Category</label>
          <Dropdown
            value={categoryId}
            onChange={(e) => setCategoryId(e.value)}
            options={categoryOptions}
            placeholder="Select a category"
            className="w-64"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-slate-700">Weekly Budget ($)</label>
          <InputNumber
            value={amount}
            onValueChange={(e) => setAmount(e.value ?? null)}
            min={0}
            placeholder="0.00"
            className="w-40"
            prefix="$ "
          />
        </div>
        <Button
          label="Add Budget"
          icon="pi pi-plus"
          onClick={handleSave}
          disabled={!categoryId || !amount || saving}
          loading={saving}
        />
      </div>

      {budgets.length === 0 && (
        <div className="text-center py-8 text-slate-400">
          <i className="pi pi-inbox text-4xl block mb-2" />
          <span>No budgets set yet. Add a category above.</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {budgets.map((b) => (
          <Card key={b.id} className="!p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-xl">{b.category.icon}</span>
                <div>
                  <p className="font-medium text-slate-800">{b.category.name}</p>
                  <p className="text-sm text-slate-500">
                    <i className="pi pi-calendar mr-1" />
                    ${b.weeklyAmount.toFixed(2)} / week
                  </p>
                </div>
              </div>
              <Button
                icon="pi pi-trash"
                className="p-button-rounded p-button-text p-button-danger"
                onClick={() => onDelete(b.id)}
                tooltip="Remove"
              />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
