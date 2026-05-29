import { describe, it, expect, vi, beforeEach } from "vitest";
import { parseCsvContent } from "@/lib/csv-parser";

const CSV_HEADER = "Type,Details,Particulars,Code,Reference,Amount,Date,ForeignCurrencyAmount,ConversionCharge";

describe("csv-parser", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("parses valid CSV row", () => {
    const csv = `${CSV_HEADER}\n"Eft-Pos","New World Palmerston North","Some Part","123","Ref-001","-25.50","15/03/2024","",""`;
    const result = parseCsvContent(csv);
    expect(result).toHaveLength(1);
    expect(result[0].type).toBe("Eft-Pos");
    expect(result[0].details).toBe("New World Palmerston North");
    expect(result[0].particulars).toBe("Some Part");
    expect(result[0].code).toBe("123");
    expect(result[0].reference).toBe("Ref-001");
    expect(result[0].date).toBeInstanceOf(Date);
  });

  it("converts dollars to cents", () => {
    const csv = `${CSV_HEADER}\n"Eft-Pos","Test","","","","-25.50","15/03/2024","",""`;
    const result = parseCsvContent(csv);
    expect(result[0].amount).toBe(-2550);
  });

  it("parses DD/MM/YYYY dates", () => {
    const csv = `${CSV_HEADER}\n"Eft-Pos","Test","","","","-10.00","15/03/2024","",""`;
    const result = parseCsvContent(csv);
    expect(result[0].date.getFullYear()).toBe(2024);
    expect(result[0].date.getMonth()).toBe(2);
    expect(result[0].date.getDate()).toBe(15);
  });

  it("parses yyyy-MM-dd fallback", () => {
    const csv = `${CSV_HEADER}\n"Eft-Pos","Test","","","","-10.00","2024-03-15","",""`;
    const result = parseCsvContent(csv);
    expect(result[0].date.getFullYear()).toBe(2024);
    expect(result[0].date.getMonth()).toBe(2);
    expect(result[0].date.getDate()).toBe(15);
  });

  it("skips rows with missing Amount", () => {
    const csv = `${CSV_HEADER}\n"Eft-Pos","Test","","","","","15/03/2024","",""`;
    const result = parseCsvContent(csv);
    expect(result).toHaveLength(0);
  });

  it("skips rows with unparseable date and calls console.warn", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const csv = `${CSV_HEADER}\n"Eft-Pos","Test","","","","-10.00","not-a-date","",""`;
    const result = parseCsvContent(csv);
    expect(result).toHaveLength(0);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("not-a-date"));
  });

  it("empty CSV content returns []", () => {
    const result = parseCsvContent("");
    expect(result).toEqual([]);
  });

  it("handles CSV with parse errors and logs console.error", () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    const csv = `"unclosed quote,${CSV_HEADER}\n"Eft-Pos","Test","","","","-10.00","15/03/2024","",""`;
    const result = parseCsvContent(csv);
    expect(error).toHaveBeenCalled();
    expect(Array.isArray(result)).toBe(true);
  });

  it("handles ForeignCurrencyAmount as null when missing", () => {
    const csv = `${CSV_HEADER}\n"Eft-Pos","Test","","","","-10.00","15/03/2024","",""`;
    const result = parseCsvContent(csv);
    expect(result[0].foreignCurrencyAmount).toBeNull();
  });

  it("strips whitespace from headers", () => {
    const csv = `" Type ",Details,Particulars,Code,Reference,Amount,Date,ForeignCurrencyAmount,ConversionCharge\n"Eft-Pos","Test","","","","-10.00","15/03/2024","",""`;
    const result = parseCsvContent(csv);
    expect(result).toHaveLength(1);
    expect(result[0].type).toBe("Eft-Pos");
    expect(result[0].details).toBe("Test");
  });
});
