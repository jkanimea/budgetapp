import { describe, it, expect, beforeEach, vi } from "vitest";
import { mockPrisma } from "../mocks/prisma";
import { BudgetService } from "@/services/budget.service";

const service = new BudgetService();

describe("BudgetService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a new budget", async () => {
    mockPrisma.budget.upsert.mockResolvedValue({ id: 1, categoryId: 1, weeklyAmount: 5000, startDate: new Date() });

    await service.setWeeklyBudget(1, 50.00);
    expect(mockPrisma.budget.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { categoryId: 1 },
        create: expect.objectContaining({ categoryId: 1, weeklyAmount: 5000 }),
      })
    );
  });

  it("updates existing budget", async () => {
    mockPrisma.budget.upsert.mockResolvedValue({ id: 1, categoryId: 1, weeklyAmount: 7500, startDate: new Date() });

    await service.setWeeklyBudget(1, 75.00);
    expect(mockPrisma.budget.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { categoryId: 1 },
        update: expect.objectContaining({ weeklyAmount: 7500 }),
      })
    );
  });

  it("handles float precision (49.99 becomes 4999 cents)", async () => {
    mockPrisma.budget.upsert.mockResolvedValue({ id: 1, categoryId: 1, weeklyAmount: 4999, startDate: new Date() });

    await service.setWeeklyBudget(1, 49.99);
    expect(mockPrisma.budget.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        create: expect.objectContaining({ weeklyAmount: 4999 }),
      })
    );
  });

  it("getBudgets converts cents to dollars", async () => {
    mockPrisma.budget.findMany.mockResolvedValue([
      { id: 1, categoryId: 1, weeklyAmount: 5000, startDate: new Date(), createdAt: new Date(), updatedAt: new Date(), category: { id: 1, name: "Groceries", type: "EXPENSE", icon: null, color: null } },
    ]);

    const result = await service.getBudgets();
    expect(result[0].weeklyAmount).toBe(50.00);
  });

  it("getBudgets orders by category name alphabetically", async () => {
    mockPrisma.budget.findMany.mockResolvedValue([
      { id: 2, categoryId: 2, weeklyAmount: 3000, startDate: new Date(), createdAt: new Date(), updatedAt: new Date(), category: { id: 2, name: "Fuel", type: "EXPENSE", icon: null, color: null } },
      { id: 1, categoryId: 1, weeklyAmount: 5000, startDate: new Date(), createdAt: new Date(), updatedAt: new Date(), category: { id: 1, name: "Groceries", type: "EXPENSE", icon: null, color: null } },
    ]);

    const result = await service.getBudgets();
    const args = mockPrisma.budget.findMany.mock.calls[0][0];
    expect(args.orderBy).toEqual({ category: { name: "asc" } });
  });

  it("getBudgetComparison returns under budget when spent < budgeted", async () => {
    mockPrisma.budget.findMany.mockResolvedValue([
      { id: 1, categoryId: 1, weeklyAmount: 5000, startDate: new Date(), category: { id: 1, name: "Groceries", type: "EXPENSE", icon: null, color: null } },
    ]);
    mockPrisma.transaction.groupBy.mockResolvedValue([
      { categoryId: 1, _sum: { amount: -2500 } },
    ]);

    const result = await service.getBudgetComparison();
    expect(result[0].remaining).toBeGreaterThan(0);
  });

  it("getBudgetComparison returns over budget when spent > budgeted", async () => {
    mockPrisma.budget.findMany.mockResolvedValue([
      { id: 1, categoryId: 1, weeklyAmount: 5000, startDate: new Date(), category: { id: 1, name: "Groceries", type: "EXPENSE", icon: null, color: null } },
    ]);
    mockPrisma.transaction.groupBy.mockResolvedValue([
      { categoryId: 1, _sum: { amount: -7500 } },
    ]);

    const result = await service.getBudgetComparison();
    expect(result[0].remaining).toBeLessThan(0);
  });

  it("getBudgetComparison excludes Transfer transactions from spent", async () => {
    mockPrisma.budget.findMany.mockResolvedValue([
      { id: 1, categoryId: 1, weeklyAmount: 5000, startDate: new Date(), category: { id: 1, name: "Groceries", type: "EXPENSE", icon: null, color: null } },
    ]);
    mockPrisma.transaction.groupBy.mockResolvedValue([]);

    await service.getBudgetComparison();
    const args = mockPrisma.transaction.groupBy.mock.calls[0][0];
    expect(args.where.type).toEqual({ not: "Transfer" });
  });

  it("getBudgetComparison returns zero spent when no transactions", async () => {
    mockPrisma.budget.findMany.mockResolvedValue([
      { id: 1, categoryId: 1, weeklyAmount: 5000, startDate: new Date(), category: { id: 1, name: "Groceries", type: "EXPENSE", icon: null, color: null } },
    ]);
    mockPrisma.transaction.groupBy.mockResolvedValue([]);

    const result = await service.getBudgetComparison();
    expect(result[0].spent).toBe(0);
    expect(result[0].remaining).toBe(50.00);
  });

  it("deleteBudget calls prisma.budget.delete with correct id", async () => {
    mockPrisma.budget.delete.mockResolvedValue({ id: 1 });

    await service.deleteBudget(1);
    expect(mockPrisma.budget.delete).toHaveBeenCalledWith({ where: { id: 1 } });
  });
});
