import Papa from "papaparse";
import { parse, isValid } from "date-fns";
import { CsvTransaction, ParsedTransaction } from "@/types";

export function parseCsvContent(content: string): ParsedTransaction[] {
  const result = Papa.parse<CsvTransaction>(content, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim(),
  });

  if (result.errors.length > 0) {
    console.error("CSV parse errors:", result.errors);
  }

  const rows: (ParsedTransaction | null)[] = result.data
    .filter((row) => row.Amount !== undefined && row.Amount !== "" && row.Date)
    .map((row) => {
      const date = parseDateStrict(row.Date);
      if (!date) return null;
      return {
        type: row.Type?.trim() || "",
        details: row.Details?.trim() || "",
        particulars: row.Particulars?.trim() || "",
        code: row.Code?.trim() || "",
        reference: row.Reference?.trim() || "",
        amount: dollarsToCents(parseFloat(row.Amount) || 0),
        date,
        foreignCurrencyAmount: row.ForeignCurrencyAmount ? dollarsToCents(parseFloat(row.ForeignCurrencyAmount)) : null,
        conversionCharge: row.ConversionCharge ? dollarsToCents(parseFloat(row.ConversionCharge)) : null,
      };
    });

  return rows.filter((tx): tx is ParsedTransaction => tx !== null);
}

function dollarsToCents(dollars: number): number {
  return Math.round(dollars * 100);
}

function parseDateStrict(dateStr: string): Date | null {
  const parsed = parse(dateStr, "dd/MM/yyyy", new Date());
  if (isValid(parsed)) return parsed;

  const parsedAlt = parse(dateStr, "yyyy-MM-dd", new Date());
  if (isValid(parsedAlt)) return parsedAlt;

  const d = new Date(dateStr);
  if (isValid(d)) return d;

  console.warn(`Could not parse date: "${dateStr}"`);
  return null;
}
