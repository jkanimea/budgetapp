import { describe, it, expect, beforeEach, vi } from "vitest";

const mockTransactions = {
  transactions: [{ id: 1, type: "Eft-Pos", amount: -25.50, date: "2024-03-15", details: "New World", particulars: "", code: "", reference: "", foreignCurrencyAmount: null, conversionCharge: null, category: { id: 1, name: "Groceries", type: "EXPENSE", icon: null, color: null } }],
  total: 1,
};

vi.mock("@/services/transaction.service", () => ({
  transactionService: {
    getAll: vi.fn(),
    importCsv: vi.fn(),
  },
}));

import { transactionService } from "@/services/transaction.service";
import { GET, POST } from "@/app/api/transactions/route";
import { NextRequest } from "next/server";

function mockNextRequest(url: string): NextRequest {
  return new NextRequest(new URL(url, "http://localhost"));
}

describe("GET /api/transactions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns first page with total count", async () => {
    (transactionService.getAll as ReturnType<typeof vi.fn>).mockResolvedValue(mockTransactions);

    const response = await GET(mockNextRequest("/api/transactions"));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.transactions).toHaveLength(1);
    expect(body.total).toBe(1);
  });

  it("passes search filter to service", async () => {
    (transactionService.getAll as ReturnType<typeof vi.fn>).mockResolvedValue(mockTransactions);

    await GET(mockNextRequest("/api/transactions?search=New+World"));
    expect(transactionService.getAll).toHaveBeenCalledWith(expect.objectContaining({ search: "New World" }));
  });

  it("passes type filter to service", async () => {
    (transactionService.getAll as ReturnType<typeof vi.fn>).mockResolvedValue({ transactions: [], total: 0 });

    await GET(mockNextRequest("/api/transactions?type=Transfer"));
    expect(transactionService.getAll).toHaveBeenCalledWith(expect.objectContaining({ type: "Transfer" }));
  });

  it("passes pagination params to service", async () => {
    (transactionService.getAll as ReturnType<typeof vi.fn>).mockResolvedValue({ transactions: [], total: 0 });

    await GET(mockNextRequest("/api/transactions?page=2&pageSize=10"));
    expect(transactionService.getAll).toHaveBeenCalledWith(expect.objectContaining({ page: 2, pageSize: 10 }));
  });

  it("passes categoryId filter to service", async () => {
    (transactionService.getAll as ReturnType<typeof vi.fn>).mockResolvedValue({ transactions: [], total: 0 });

    await GET(mockNextRequest("/api/transactions?categoryId=3"));
    expect(transactionService.getAll).toHaveBeenCalledWith(expect.objectContaining({ categoryId: 3 }));
  });

  it("handles invalid page param gracefully", async () => {
    (transactionService.getAll as ReturnType<typeof vi.fn>).mockResolvedValue({ transactions: [], total: 0 });

    const response = await GET(mockNextRequest("/api/transactions?page=abc"));
    expect(response.status).toBe(200);
  });

  it("returns 500 on DB error", async () => {
    (transactionService.getAll as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("DB error"));

    const response = await GET(mockNextRequest("/api/transactions"));
    expect(response.status).toBe(500);
  });
});

describe("POST /api/transactions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("imports valid CSV file and returns count", async () => {
    (transactionService.importCsv as ReturnType<typeof vi.fn>).mockResolvedValue(5);

    const request = new NextRequest(new URL("http://localhost/api/transactions"), { method: "POST" });
    Object.defineProperty(request, "formData", {
      value: async () => {
        const fd = new FormData();
        fd.append("file", new File(["test"], "test.csv", { type: "text/csv" }));
        return fd;
      },
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.imported).toBe(5);
  });

  it("returns 400 when no file provided", async () => {
    const request = new NextRequest(new URL("http://localhost/api/transactions"), { method: "POST" });
    Object.defineProperty(request, "formData", {
      value: async () => {
        const fd = new FormData();
        return fd;
      },
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it("returns 400 when file too large", async () => {
    const request = new NextRequest(new URL("http://localhost/api/transactions"), { method: "POST" });
    Object.defineProperty(request, "formData", {
      value: async () => {
        const fd = new FormData();
        const largeContent = "x".repeat(11 * 1024 * 1024);
        fd.append("file", new File([largeContent], "large.csv", { type: "text/csv" }));
        return fd;
      },
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it("handles re-upload of same CSV", async () => {
    (transactionService.importCsv as ReturnType<typeof vi.fn>).mockResolvedValue(0);

    const request = new NextRequest(new URL("http://localhost/api/transactions"), { method: "POST" });
    Object.defineProperty(request, "formData", {
      value: async () => {
        const fd = new FormData();
        fd.append("file", new File(["test"], "test.csv", { type: "text/csv" }));
        return fd;
      },
    });

    const response = await POST(request);
    const body = await response.json();
    expect(body.imported).toBe(0);
  });
});
