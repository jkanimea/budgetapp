"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface BreakdownItem {
  categoryName: string;
  amount: number;
  percentage: number;
}

interface Props {
  data: BreakdownItem[];
}

const COLORS = [
  "#ef4444", "#f97316", "#eab308", "#22c55e", "#3b82f6",
  "#8b5cf6", "#ec4899", "#14b8a6", "#f43f5e", "#6366f1",
];

export function ExpensePieChart({ data }: Props) {
  const chartData = data.map((d) => ({ name: d.categoryName, value: d.amount }));

  if (data.length === 0) {
    return <div className="text-center py-8 text-slate-400"><i className="pi pi-chart-pie text-3xl block mb-2" />No expense data this week</div>;
  }

  return (
    <div className="chart-container">
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%" cy="50%"
            innerRadius={60} outerRadius={90}
            paddingAngle={3}
            dataKey="value"
          >
            {chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
