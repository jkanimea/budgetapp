import { describe, it, expect, beforeEach, vi } from "vitest";

const mockDashboardData = {
  currentWeek: {
    weekStart: "2024-03-11", weekEnd: "2024-03-17",
    totalIncome: 1500, totalExpense: 500, netSavings: 1000,
    categoryBreakdown: [],
  },
  weeklyHistory: [],
  topExpenses: [],
  totalIncome: 1500,
  totalExpense: 500,
  totalSavings: 1000,
  budgetComparison: [],
};

vi.mock("@/services/dashboard.service", () => ({
  dashboardService: {
    getDashboardData: vi.fn(),
  },
}));

import { dashboardService } from "@/services/dashboard.service";
import { GET } from "@/app/api/dashboard/route";

describe("GET /api/dashboard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 200 with data field matching shape", async () => {
    (dashboardService.getDashboardData as ReturnType<typeof vi.fn>).mockResolvedValue(mockDashboardData);

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data).toBeDefined();
    expect(body.data.totalIncome).toBe(1500);
    expect(body.data.totalExpense).toBe(500);
  });

  it("returns 500 on DB error", async () => {
    (dashboardService.getDashboardData as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("DB error"));

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.error).toBeDefined();
  });
});
