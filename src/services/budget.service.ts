import { prisma } from "@/lib/prisma";
import { getWeekRange } from "@/lib/date-utils";

export class BudgetService {
  async setWeeklyBudget(categoryId: number, weeklyAmount: number, startDate?: Date): Promise<void> {
    const start = startDate || new Date();
    const amountCents = Math.round(weeklyAmount * 100);
    await prisma.budget.upsert({
      where: { categoryId },
      create: { categoryId, weeklyAmount: amountCents, startDate: start },
      update: { weeklyAmount: amountCents },
    });
  }

  async getBudgets() {
    const budgets = await prisma.budget.findMany({
      include: { category: true },
      orderBy: { category: { name: "asc" } },
    });
    return budgets.map((b) => ({
      ...b,
      weeklyAmount: Math.round(b.weeklyAmount) / 100,
    }));
  }

  async getBudgetComparison(date?: Date) {
    const { start, end } = getWeekRange(date);

    const budgets = await prisma.budget.findMany({
      include: { category: true },
    });

    const expenses = await prisma.transaction.groupBy({
      by: ["categoryId"],
      where: {
        date: { gte: start, lte: end },
        amount: { lt: 0 },
        type: { not: "Transfer" },
        categoryId: { not: null },
      },
      _sum: { amount: true },
    });

    const expenseMap = new Map(
      expenses.map((e) => [e.categoryId, Math.abs(e._sum.amount ?? 0)])
    );

    return budgets.map((b) => {
      const spentCents = expenseMap.get(b.categoryId) ?? 0;
      return {
        categoryName: b.category.name,
        categoryId: b.categoryId,
        budgeted: Math.round(b.weeklyAmount) / 100,
        spent: Math.round(spentCents) / 100,
        remaining: (b.weeklyAmount - spentCents) / 100,
      };
    });
  }

  async deleteBudget(id: number): Promise<void> {
    await prisma.budget.delete({ where: { id } });
  }
}

export const budgetService = new BudgetService();
