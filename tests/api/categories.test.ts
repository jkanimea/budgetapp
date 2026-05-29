import { describe, it, expect, beforeEach, vi } from "vitest";

vi.mock("@/services/transaction.service", () => ({
  transactionService: {
    getCategories: vi.fn(),
  },
}));

import { transactionService } from "@/services/transaction.service";
import { GET } from "@/app/api/categories/route";

describe("GET /api/categories", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns all categories in alphabetical order", async () => {
    (transactionService.getCategories as ReturnType<typeof vi.fn>).mockResolvedValue([
      { id: 1, name: "Bills", type: "EXPENSE", icon: null, color: null },
      { id: 2, name: "Groceries", type: "EXPENSE", icon: null, color: null },
    ]);

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.categories).toHaveLength(2);
  });

  it("returns empty array when no categories exist", async () => {
    (transactionService.getCategories as ReturnType<typeof vi.fn>).mockResolvedValue([]);

    const response = await GET();
    const body = await response.json();

    expect(body.categories).toEqual([]);
  });
});
