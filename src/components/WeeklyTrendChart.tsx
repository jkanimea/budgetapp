"use client";

import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from "recharts";

interface WeeklySummary {
  weekStart: string;
  weekEnd: string;
  totalIncome: number;
  totalExpense: number;
  netSavings: number;
}

interface Props {
  data: WeeklySummary[];
}

export function WeeklyTrendChart({ data }: Props) {
  const chartData = data.map((w) => ({
    week: new Date(w.weekStart).toLocaleDateString("en-NZ", { month: "short", day: "numeric" }),
    Income: w.totalIncome,
    Expenses: w.totalExpense,
    Savings: w.netSavings,
  }));

  if (data.length === 0) {
    return <div className="text-center py-8 text-slate-400"><i className="pi pi-chart-line text-3xl block mb-2" />No weekly data to display</div>;
  }

  return (
    <div className="chart-container">
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="week" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="Income" stroke="#22c55e" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="Expenses" stroke="#ef4444" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="Savings" stroke="#3b82f6" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
