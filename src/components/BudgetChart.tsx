"use client";

import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";

interface BudgetComparisonItem {
  categoryName: string;
  budgeted: number;
  spent: number;
  remaining: number;
}

interface Props {
  data: BudgetComparisonItem[];
}

export function BudgetChart({ data }: Props) {
  const chartData = data.map((d) => ({
    name: d.categoryName,
    Budget: d.budgeted,
    Spent: d.spent,
  }));

  if (data.length === 0) {
    return <div className="text-center py-8 text-slate-400"><i className="pi pi-chart-bar text-3xl block mb-2" />No budget data to display</div>;
  }

  return (
    <div className="chart-container">
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={chartData} barCategoryGap="20%">
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Bar dataKey="Budget" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          <Bar dataKey="Spent" fill="#ef4444" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
