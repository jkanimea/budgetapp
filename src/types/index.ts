export interface CsvTransaction {
  Type: string;
  Details: string;
  Particulars: string;
  Code: string;
  Reference: string;
  Amount: string;
  Date: string;
  ForeignCurrencyAmount: string;
  ConversionCharge: string;
}

export interface ParsedTransaction {
  type: string;
  details: string;
  particulars: string;
  code: string;
  reference: string;
  amount: number;
  date: Date;
  foreignCurrencyAmount: number | null;
  conversionCharge: number | null;
}

export interface TransactionCategory {
  id: number;
  name: string;
  type: string;
  icon: string | null;
  color: string | null;
}

export interface TransactionWithCategory {
  id: number;
  type: string;
  details: string | null;
  particulars: string | null;
  code: string | null;
  reference: string | null;
  amount: number;
  date: Date;
  foreignCurrencyAmount: number | null;
  conversionCharge: number | null;
  category: TransactionCategory | null;
}

export interface WeeklySummary {
  weekStart: string;
  weekEnd: string;
  totalIncome: number;
  totalExpense: number;
  netSavings: number;
  categoryBreakdown: { categoryName: string; amount: number; percentage: number }[];
}

export interface DashboardData {
  currentWeek: WeeklySummary;
  weeklyHistory: WeeklySummary[];
  topExpenses: { categoryName: string; amount: number; percentage: number }[];
  totalIncome: number;
  totalExpense: number;
  totalSavings: number;
  budgetComparison: { categoryName: string; budgeted: number; spent: number; remaining: number }[];
}
