import { Card } from "primereact/card";

interface WeeklySummaryCardProps {
  totalIncome: number;
  totalExpense: number;
  netSavings: number;
}

export function WeeklySummaryCard({ totalIncome, totalExpense, netSavings }: WeeklySummaryCardProps) {
  const fmt = (n: number) =>
    new Intl.NumberFormat("en-NZ", { style: "currency", currency: "NZD" }).format(n);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="summary-card-income">
        <div className="flex items-center gap-3">
          <i className="pi pi-arrow-up text-green-600 text-xl" />
          <div>
            <p className="text-sm font-medium text-green-700 uppercase tracking-wide">Income</p>
            <p className="text-2xl font-bold text-green-800 mt-1">{fmt(totalIncome)}</p>
          </div>
        </div>
      </Card>
      <Card className="summary-card-expense">
        <div className="flex items-center gap-3">
          <i className="pi pi-arrow-down text-red-600 text-xl" />
          <div>
            <p className="text-sm font-medium text-red-700 uppercase tracking-wide">Expenses</p>
            <p className="text-2xl font-bold text-red-800 mt-1">{fmt(totalExpense)}</p>
          </div>
        </div>
      </Card>
      <Card className="summary-card-savings">
        <div className="flex items-center gap-3">
          <i className={`pi ${netSavings >= 0 ? "pi-save" : "pi-exclamation-triangle"} text-blue-600 text-xl`} />
          <div>
            <p className={`text-sm font-medium uppercase tracking-wide ${netSavings >= 0 ? "text-blue-700" : "text-orange-700"}`}>
              {netSavings >= 0 ? "Savings" : "Overspend"}
            </p>
            <p className={`text-2xl font-bold mt-1 ${netSavings >= 0 ? "text-blue-800" : "text-orange-800"}`}>
              {fmt(Math.abs(netSavings))}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
