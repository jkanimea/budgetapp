import { describe, it, expect, beforeEach, vi } from "vitest";
import { mockPrisma } from "../mocks/prisma";
import { TransactionService } from "@/services/transaction.service";

const service = new TransactionService();

const VALID_CSV = [
  "Type,Details,Particulars,Code,Reference,Amount,Date,ForeignCurrencyAmount,ConversionCharge",
  '"Eft-Pos","New World","","","","-25.50","15/03/2024","",""',
  '"Direct Credit","Salary","","","","1500.00","16/03/2024","",""',
].join("\n");

function setupCategoryMap() {
  mockPrisma.category.findMany.mockResolvedValue([
    { id: 1, name: "Groceries", type: "EXPENSE", icon: null, color: null },
    { id: 2, name: "Income", type: "INCOME", icon: null, color: null },
  ]);
}

describe("TransactionService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPrisma.$transaction.mockImplementation((queries: unknown[]) => Promise.all(queries));
    mockPrisma.category.upsert.mockImplementation((args: { create: { name: string; type: string } }) =>
      Promise.resolve({ id: Math.random(), ...args.create })
    );
  });

  it("imports CSV successfully", async () => {
    setupCategoryMap();
    mockPrisma.transaction.findMany.mockResolvedValue([]);
    mockPrisma.transaction.createMany.mockResolvedValue({ count: 2 });

    const result = await service.importCsv(VALID_CSV);
    expect(result).toBe(2);
  });

  it("deduplicates on re-import", async () => {
    setupCategoryMap();
    const { parse } = await import("date-fns");
    const date1 = parse("15/03/2024", "dd/MM/yyyy", new Date());
    const date2 = parse("16/03/2024", "dd/MM/yyyy", new Date());
    mockPrisma.transaction.findMany.mockResolvedValue([
      { date: date1, type: "Eft-Pos", amount: -2550, details: "New World" },
      { date: date2, type: "Direct Credit", amount: 150000, details: "Salary" },
    ]);
    mockPrisma.transaction.createMany.mockResolvedValue({ count: 0 });

    const result = await service.importCsv(VALID_CSV);
    expect(result).toBe(0);
  });

  it("partially deduplicates", async () => {
    setupCategoryMap();
    const { parse } = await import("date-fns");
    const parsedDate = parse("15/03/2024", "dd/MM/yyyy", new Date());
    mockPrisma.transaction.findMany.mockResolvedValue([
      { date: parsedDate, type: "Eft-Pos", amount: -2550, details: "New World" },
    ]);
    mockPrisma.transaction.createMany.mockResolvedValue({ count: 1 });

    const result = await service.importCsv(VALID_CSV);
    expect(result).toBe(1);
  });

  it("handles empty CSV", async () => {
    const result = await service.importCsv("");
    expect(result).toBe(0);
    expect(mockPrisma.transaction.createMany).not.toHaveBeenCalled();
  });

  it("seeds categories on first import", async () => {
    setupCategoryMap();
    mockPrisma.transaction.findMany.mockResolvedValue([]);
    mockPrisma.transaction.createMany.mockResolvedValue({ count: 1 });

    await service.importCsv(VALID_CSV);
    expect(mockPrisma.$transaction).toHaveBeenCalled();
  });

  it("creates dynamic category when merchant not in seed", async () => {
    mockPrisma.category.findMany.mockResolvedValue([]);
    mockPrisma.category.upsert.mockResolvedValue({ id: 99, name: "Uncategorized", type: "EXPENSE" });
    mockPrisma.transaction.findMany.mockResolvedValue([]);
    mockPrisma.transaction.createMany.mockResolvedValue({ count: 1 });

    const csv = [
      "Type,Details,Particulars,Code,Reference,Amount,Date,ForeignCurrencyAmount,ConversionCharge",
      '"Eft-Pos","Some Unknown Place","","","","-10.00","15/03/2024","",""',
    ].join("\n");

    const result = await service.importCsv(csv);
    expect(result).toBe(1);
  });

  it("getAll returns all transactions paginated", async () => {
    mockPrisma.transaction.findMany.mockResolvedValue([
      { id: 1, type: "Eft-Pos", amount: -2550, date: new Date("2024-03-15"), details: "New World", particulars: "", code: "", reference: "", foreignCurrencyAmount: null, conversionCharge: null, category: { id: 1, name: "Groceries", type: "EXPENSE", icon: null, color: null } },
    ]);
    mockPrisma.transaction.count.mockResolvedValue(1);

    const result = await service.getAll();
    expect(result.transactions).toHaveLength(1);
    expect(result.total).toBe(1);
  });

  it("getAll converts cents to dollars", async () => {
    mockPrisma.transaction.findMany.mockResolvedValue([
      { id: 1, type: "Eft-Pos", amount: -2550, date: new Date("2024-03-15"), details: "New World", particulars: "", code: "", reference: "", foreignCurrencyAmount: null, conversionCharge: null, category: { id: 1, name: "Groceries", type: "EXPENSE", icon: null, color: null } },
    ]);
    mockPrisma.transaction.count.mockResolvedValue(1);

    const result = await service.getAll();
    expect(result.transactions[0].amount).toBe(-25.50);
  });

  it("getAll supports search filter", async () => {
    mockPrisma.transaction.findMany.mockResolvedValue([]);
    mockPrisma.transaction.count.mockResolvedValue(0);

    await service.getAll({ search: "New World" });
    const args = mockPrisma.transaction.findMany.mock.calls[0][0];
    expect(args.where.AND).toBeDefined();
  });

  it("getAll supports type filter", async () => {
    mockPrisma.transaction.findMany.mockResolvedValue([]);
    mockPrisma.transaction.count.mockResolvedValue(0);

    await service.getAll({ type: "Transfer" });
    const args = mockPrisma.transaction.findMany.mock.calls[0][0];
    expect(args.where.type).toBe("Transfer");
  });

  it("getAll supports pagination", async () => {
    mockPrisma.transaction.findMany.mockResolvedValue([]);
    mockPrisma.transaction.count.mockResolvedValue(0);

    await service.getAll({ page: 2, pageSize: 10 });
    const args = mockPrisma.transaction.findMany.mock.calls[0][0];
    expect(args.skip).toBe(10);
    expect(args.take).toBe(10);
  });

  it("getAll supports date range filter", async () => {
    mockPrisma.transaction.findMany.mockResolvedValue([]);
    mockPrisma.transaction.count.mockResolvedValue(0);

    const start = new Date("2024-01-01");
    const end = new Date("2024-12-31");
    await service.getAll({ startDate: start, endDate: end });
    const args = mockPrisma.transaction.findMany.mock.calls[0][0];
    expect(args.where.date.gte).toEqual(start);
    expect(args.where.date.lte).toEqual(end);
  });
});
