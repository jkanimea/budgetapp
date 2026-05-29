import { prisma } from "@/lib/prisma";
import { subWeeks, startOfWeek, endOfWeek, format } from "@/lib/date-utils";
import { WeeklySummary, DashboardData } from "@/types";
import { budgetService } from "./budget.service";

function centsToDollars(cents: number): number {
  return Math.round(cents) / 100;
}

export class DashboardService {
  async getWeeklySummaries(date?: Date, weeksBack: number = 12): Promise<WeeklySummary[]> {
    const endDate = date || new Date();
    const startDate = subWeeks(endDate, weeksBack - 1);

    const transactions = await prisma.transaction.findMany({
      where: {
        date: { gte: startDate, lte: endDate },
      },
      include: { category: true },
      orderBy: { date: "asc" },
    });

    const weekMap = new Map<string, { incomes: number[]; expenses: Map<string, number[]> }>();

    for (const tx of transactions) {
      if (tx.type === "Transfer") continue;

      const weekKey = format(startOfWeek(tx.date, { weekStartsOn: 1 }), "yyyy-MM-dd");
      if (!weekMap.has(weekKey)) {
        weekMap.set(weekKey, { incomes: [], expenses: new Map() });
      }

      const week = weekMap.get(weekKey)!;
      if (tx.amount > 0) {
        week.incomes.push(tx.amount);
      } else {
        const catName = tx.category?.name || "Uncategorized";
        if (!week.expenses.has(catName)) week.expenses.set(catName, []);
        week.expenses.get(catName)!.push(Math.abs(tx.amount));
      }
    }

    const summaries: WeeklySummary[] = [];
    for (let i = weeksBack - 1; i >= 0; i--) {
      const weekDate = subWeeks(endDate, i);
      const weekKey = format(startOfWeek(weekDate, { weekStartsOn: 1 }), "yyyy-MM-dd");
      const weekEnd = format(endOfWeek(weekDate, { weekStartsOn: 1 }), "yyyy-MM-dd");

      const data = weekMap.get(weekKey);

      if (data) {
        const totalIncome = centsToDollars(data.incomes.reduce((s, v) => s + v, 0));
        const totalExpenseCents = Array.from(data.expenses.values())
          .flat().reduce((s, v) => s + v, 0);
        const totalExpense = centsToDollars(totalExpenseCents);

        const categoryBreakdown = Array.from(data.expenses.entries())
          .map(([categoryName, amounts]) => {
            const amt = centsToDollars(amounts.reduce((s, v) => s + v, 0));
            return { categoryName, amount: amt, percentage: 0 };
          })
          .sort((a, b) => b.amount - a.amount);

        const total = categoryBreakdown.reduce((s, c) => s + c.amount, 0) || 1;
        for (const c of categoryBreakdown) {
          c.percentage = Math.round((c.amount / total) * 100 * 10) / 10;
        }

        summaries.push({
          weekStart: weekKey,
          weekEnd,
          totalIncome,
          totalExpense,
          netSavings: totalIncome - totalExpense,
          categoryBreakdown,
        });
      } else {
        summaries.push({
          weekStart: weekKey,
          weekEnd,
          totalIncome: 0, totalExpense: 0, netSavings: 0, categoryBreakdown: [],
        });
      }
    }

    return summaries;
  }

  async getWeeklySummary(date?: Date): Promise<WeeklySummary> {
    const summaries = await this.getWeeklySummaries(date, 1);
    return summaries[summaries.length - 1];
  }

  async getDashboardData(weeksBack: number = 12): Promise<DashboardData> {
    const weeklyHistory = await this.getWeeklySummaries(undefined, weeksBack);
    const currentWeek = weeklyHistory[weeklyHistory.length - 1];

    const aggIncome = await prisma.transaction.aggregate({
      _sum: { amount: true },
      where: { amount: { gt: 0 }, type: { not: "Transfer" } },
    });
    const aggExpense = await prisma.transaction.aggregate({
      _sum: { amount: true },
      where: { amount: { lt: 0 }, type: { not: "Transfer" } },
    });

    const totalIncome = centsToDollars(aggIncome._sum.amount ?? 0);
    const totalExpense = centsToDollars(Math.abs(aggExpense._sum.amount ?? 0));

    const budgetComparison = await budgetService.getBudgetComparison();

    return {
      currentWeek,
      weeklyHistory,
      topExpenses: currentWeek.categoryBreakdown.slice(0, 5),
      totalIncome,
      totalExpense,
      totalSavings: totalIncome - totalExpense,
      budgetComparison,
    };
  }
}

export const dashboardService = new DashboardService();
