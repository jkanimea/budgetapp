import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { WeeklyTrendChart } from "@/components/WeeklyTrendChart";

const mockData = [
  { weekStart: "2024-03-11", weekEnd: "2024-03-17", totalIncome: 1500, totalExpense: 500, netSavings: 1000 },
  { weekStart: "2024-03-18", weekEnd: "2024-03-24", totalIncome: 1200, totalExpense: 600, netSavings: 600 },
];

describe("WeeklyTrendChart", () => {
  it("renders line chart when data has entries", () => {
    const { container } = render(<WeeklyTrendChart data={mockData} />);

    expect(container.querySelector(".recharts-responsive-container")).toBeInTheDocument();
  });

  it("shows empty state message when data is empty", () => {
    render(<WeeklyTrendChart data={[]} />);

    expect(screen.getByText(/no weekly data to display/i)).toBeInTheDocument();
  });
});
