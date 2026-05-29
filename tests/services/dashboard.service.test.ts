import { describe, it, expect, beforeEach, vi } from "vitest";
import { mockPrisma } from "../mocks/prisma";
import { DashboardService } from "@/services/dashboard.service";

const service = new DashboardService();

describe("DashboardService", () => {
  const mockCategory = { id: 1, name: "Groceries", type: "EXPENSE", icon: null, color: null };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("getWeeklySummaries returns 12 weeks", async () => {
    mockPrisma.transaction.findMany.mockResolvedValue([]);

    const result = await service.getWeeklySummaries(new Date("2024-03-15"), 12);
    expect(result).toHaveLength(12);
  });

  it("getWeeklySummaries includes empty weeks with zeros", async () => {
    mockPrisma.transaction.findMany.mockResolvedValue([]);

    const result = await service.getWeeklySummaries(new Date("2024-03-15"), 12);
    for (const week of result) {
      expect(week.totalIncome).toBe(0);
      expect(week.totalExpense).toBe(0);
    }
  });

  it("getWeeklySummaries excludes Transfer transactions", async () => {
    mockPrisma.transaction.findMany.mockResolvedValue([
      { id: 1, type: "Transfer", amount: -1000, date: new Date("2024-03-15"), category: null },
    ]);

    const result = await service.getWeeklySummaries(new Date("2024-03-15"), 12);
    const weekWithData = result.find((w) => w.weekStart === "2024-03-11");
    expect(weekWithData?.totalIncome).toBe(0);
    expect(weekWithData?.totalExpense).toBe(0);
  });

  it("getWeeklySummaries has weekEnd 6 days after weekStart", async () => {
    mockPrisma.transaction.findMany.mockResolvedValue([]);

    const result = await service.getWeeklySummaries(new Date("2024-03-15"), 12);
    const week = result[result.length - 1];
    expect(week.weekEnd).toBe("2024-03-17");
  });

  it("getWeeklySummaries includes category breakdown with percentages", async () => {
    mockPrisma.transaction.findMany.mockResolvedValue([
      { id: 1, type: "Eft-Pos", amount: -2000, date: new Date("2024-03-13"), category: mockCategory },
      { id: 2, type: "Eft-Pos", amount: -2000, date: new Date("2024-03-14"), category: mockCategory },
    ]);

    const result = await service.getWeeklySummaries(new Date("2024-03-15"), 12);
    const week = result[result.length - 1];
    expect(week.categoryBreakdown).toHaveLength(1);
    expect(week.categoryBreakdown[0].categoryName).toBe("Groceries");
    expect(week.categoryBreakdown[0].amount).toBeGreaterThan(0);
  });

  it("getWeeklySummaries category breakdown percentages sum approx 100%", async () => {
    mockPrisma.transaction.findMany.mockResolvedValue([
      { id: 1, type: "Eft-Pos", amount: -3000, date: new Date("2024-03-13"), category: mockCategory },
      { id: 2, type: "Eft-Pos", amount: -1000, date: new Date("2024-03-14"), category: { id: 2, name: "Fuel", type: "EXPENSE", icon: null, color: null } },
    ]);

    const result = await service.getWeeklySummaries(new Date("2024-03-15"), 12);
    const week = result[result.length - 1];
    const sum = week.categoryBreakdown.reduce((s, c) => s + c.percentage, 0);
    expect(sum).toBeCloseTo(100, -1);
  });

  it("getDashboardData returns correct all-time totals", async () => {
    mockPrisma.transaction.findMany.mockResolvedValue([
      { id: 1, type: "Eft-Pos", amount: -2000, date: new Date("2024-03-13"), category: mockCategory },
    ]);
    mockPrisma.transaction.aggregate.mockResolvedValueOnce({ _sum: { amount: 500000 } });
    mockPrisma.transaction.aggregate.mockResolvedValueOnce({ _sum: { amount: -200000 } });
    mockPrisma.budget.findMany.mockResolvedValue([]);
    mockPrisma.transaction.groupBy.mockResolvedValue([]);

    const result = await service.getDashboardData(12);
    expect(result.totalIncome).toBeGreaterThan(0);
    expect(result.totalExpense).toBeGreaterThan(0);
    expect(result.totalSavings).toBeDefined();
  });

  it("getDashboardData topExpenses returns only top 5", async () => {
    mockPrisma.transaction.findMany.mockResolvedValue([
      { id: 1, type: "Eft-Pos", amount: -1000, date: new Date("2024-03-13"), category: mockCategory },
      { id: 2, type: "Eft-Pos", amount: -2000, date: new Date("2024-03-13"), category: { id: 2, name: "Fuel", type: "EXPENSE", icon: null, color: null } },
      { id: 3, type: "Eft-Pos", amount: -3000, date: new Date("2024-03-13"), category: { id: 3, name: "Rent", type: "EXPENSE", icon: null, color: null } },
      { id: 4, type: "Eft-Pos", amount: -4000, date: new Date("2024-03-13"), category: { id: 4, name: "Utilities", type: "EXPENSE", icon: null, color: null } },
      { id: 5, type: "Eft-Pos", amount: -5000, date: new Date("2024-03-13"), category: { id: 5, name: "Insurance", type: "EXPENSE", icon: null, color: null } },
      { id: 6, type: "Eft-Pos", amount: -6000, date: new Date("2024-03-13"), category: { id: 6, name: "Dining Out", type: "EXPENSE", icon: null, color: null } },
    ]);
    mockPrisma.transaction.aggregate.mockResolvedValueOnce({ _sum: { amount: 0 } });
    mockPrisma.transaction.aggregate.mockResolvedValueOnce({ _sum: { amount: 0 } });
    mockPrisma.budget.findMany.mockResolvedValue([]);
    mockPrisma.transaction.groupBy.mockResolvedValue([]);

    const result = await service.getDashboardData(12);
    expect(result.topExpenses.length).toBeLessThanOrEqual(5);
  });

  it("getDashboardData handles empty DB without crashing", async () => {
    mockPrisma.transaction.findMany.mockResolvedValue([]);
    mockPrisma.transaction.aggregate.mockResolvedValueOnce({ _sum: { amount: null } });
    mockPrisma.transaction.aggregate.mockResolvedValueOnce({ _sum: { amount: null } });
    mockPrisma.budget.findMany.mockResolvedValue([]);
    mockPrisma.transaction.groupBy.mockResolvedValue([]);

    const result = await service.getDashboardData(12);
    expect(result.totalIncome).toBe(0);
    expect(result.totalExpense).toBe(0);
    expect(result.totalSavings).toBe(0);
    expect(Array.isArray(result.weeklyHistory)).toBe(true);
  });
});
