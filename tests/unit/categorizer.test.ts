import { describe, it, expect } from "vitest";
import { categorizeTransaction } from "@/lib/categorizer";

describe("categorizer", () => {
  it("matches exact merchant keyword", () => {
    const result = categorizeTransaction("Eft-Pos", "New World Palmerston North", "");
    expect(result).toEqual({ name: "Groceries", type: "EXPENSE" });
  });

  it("matches partial keyword (BP)", () => {
    const result = categorizeTransaction("Eft-Pos", "BP Connect Auckland", "");
    expect(result).toEqual({ name: "Fuel", type: "EXPENSE" });
  });

  it("longer keyword takes priority", () => {
    const result = categorizeTransaction("Eft-Pos", "BP Connect Auckland", "");
    const bpResult = categorizeTransaction("Eft-Pos", "BP ", "");
    expect(result.name).toBe("Fuel");
    expect(bpResult.name).toBe("Fuel");
  });

  it("falls back to transaction type when no merchant match", () => {
    const result = categorizeTransaction("Direct Credit", "EMPLOYER PAYROLL", "");
    expect(result).toEqual({ name: "Income", type: "INCOME" });
  });

  it("transfer type maps correctly", () => {
    const result = categorizeTransaction("Transfer", "To Savings", "");
    expect(result).toEqual({ name: "Transfers", type: "EXPENSE" });
  });

  it("unknown type falls back to Uncategorized", () => {
    const result = categorizeTransaction("Cheque", "Some payment", "");
    expect(result).toEqual({ name: "Uncategorized", type: "EXPENSE" });
  });

  it("case-insensitive matching", () => {
    const result = categorizeTransaction("Eft-Pos", "NEW WORLD", "");
    expect(result).toEqual({ name: "Groceries", type: "EXPENSE" });
  });

  it("searches both details + particulars", () => {
    const result = categorizeTransaction("Eft-Pos", "", "new world");
    expect(result).toEqual({ name: "Groceries", type: "EXPENSE" });
  });
});
