import { describe, it, expect, beforeEach, vi } from "vitest";

vi.mock("@/services/budget.service", () => ({
  budgetService: {
    getBudgets: vi.fn(),
    setWeeklyBudget: vi.fn(),
    deleteBudget: vi.fn(),
  },
}));

import { budgetService } from "@/services/budget.service";
import { GET, POST, DELETE } from "@/app/api/weekly-budget/route";
import { NextRequest } from "next/server";

function mockNextRequest(url: string): NextRequest {
  return new NextRequest(new URL(url, "http://localhost"));
}

describe("GET /api/weekly-budget", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns budgets array", async () => {
    (budgetService.getBudgets as ReturnType<typeof vi.fn>).mockResolvedValue([
      { id: 1, categoryId: 1, weeklyAmount: 50, category: { id: 1, name: "Groceries", type: "EXPENSE", icon: null, color: null } },
    ]);

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.budgets).toHaveLength(1);
  });

  it("returns empty budgets array", async () => {
    (budgetService.getBudgets as ReturnType<typeof vi.fn>).mockResolvedValue([]);

    const response = await GET();
    const body = await response.json();

    expect(body.budgets).toEqual([]);
  });
});

describe("POST /api/weekly-budget", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates valid new budget", async () => {
    (budgetService.setWeeklyBudget as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

    const request = new Request("http://localhost/api/weekly-budget", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ categoryId: 1, weeklyAmount: 100 }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
  });

  it("returns 400 when categoryId missing", async () => {
    const request = new Request("http://localhost/api/weekly-budget", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ weeklyAmount: 100 }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it("returns 400 when weeklyAmount missing", async () => {
    const request = new Request("http://localhost/api/weekly-budget", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ categoryId: 1 }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it("returns 400 when negative amount", async () => {
    const request = new Request("http://localhost/api/weekly-budget", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ categoryId: 1, weeklyAmount: -50 }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it("returns 400 when zero amount", async () => {
    const request = new Request("http://localhost/api/weekly-budget", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ categoryId: 1, weeklyAmount: 0 }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it("returns 400 when non-numeric amount", async () => {
    const request = new Request("http://localhost/api/weekly-budget", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ categoryId: 1, weeklyAmount: "abc" }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it("upserts on same categoryId", async () => {
    (budgetService.setWeeklyBudget as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

    const request = new Request("http://localhost/api/weekly-budget", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ categoryId: 1, weeklyAmount: 150 }),
    });

    await POST(request);
    expect(budgetService.setWeeklyBudget).toHaveBeenCalledWith(1, 150, undefined);
  });
});

describe("DELETE /api/weekly-budget", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deletes budget with valid id", async () => {
    (budgetService.deleteBudget as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

    const response = await DELETE(mockNextRequest("/api/weekly-budget?id=1"));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
  });

  it("returns 400 when id missing", async () => {
    const response = await DELETE(mockNextRequest("/api/weekly-budget"));
    expect(response.status).toBe(400);
  });

  it("returns 400 when id is non-numeric", async () => {
    const response = await DELETE(mockNextRequest("/api/weekly-budget?id=abc"));
    expect(response.status).toBe(400);
  });

  it("returns 500 on non-existent id", async () => {
    (budgetService.deleteBudget as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("Record not found"));

    const response = await DELETE(mockNextRequest("/api/weekly-budget?id=99999"));
    expect(response.status).toBe(500);
  });
});
