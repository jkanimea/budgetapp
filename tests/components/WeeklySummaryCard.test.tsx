import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { WeeklySummaryCard } from "@/components/WeeklySummaryCard";

describe("WeeklySummaryCard", () => {
  it("renders income, expense, savings values formatted as NZD", () => {
    render(<WeeklySummaryCard totalIncome={1500} totalExpense={500} netSavings={1000} />);

    expect(screen.getByText("$1,500.00")).toBeInTheDocument();
    expect(screen.getByText("$500.00")).toBeInTheDocument();
    expect(screen.getByText("$1,000.00")).toBeInTheDocument();
  });

  it("shows Savings label when netSavings >= 0", () => {
    render(<WeeklySummaryCard totalIncome={1500} totalExpense={500} netSavings={1000} />);

    expect(screen.getByText("Savings")).toBeInTheDocument();
  });

  it("shows Overspend label when netSavings < 0", () => {
    render(<WeeklySummaryCard totalIncome={500} totalExpense={1500} netSavings={-1000} />);

    expect(screen.getByText("Overspend")).toBeInTheDocument();
  });

  it("uses orange color class for negative savings", () => {
    const { container } = render(<WeeklySummaryCard totalIncome={500} totalExpense={1500} netSavings={-1000} />);

    const overspendLabel = screen.getByText("Overspend");
    expect(overspendLabel.className).toContain("text-orange");
  });
});
