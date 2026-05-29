import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { BudgetChart } from "@/components/BudgetChart";

const mockData = [
  { categoryName: "Groceries", budgeted: 50, spent: 30, remaining: 20 },
  { categoryName: "Fuel", budgeted: 100, spent: 120, remaining: -20 },
];

describe("BudgetChart", () => {
  it("renders bar chart when data has entries", () => {
    const { container } = render(<BudgetChart data={mockData} />);

    expect(container.querySelector(".recharts-responsive-container")).toBeInTheDocument();
  });

  it("shows empty state when data is empty", () => {
    render(<BudgetChart data={[]} />);

    expect(screen.getByText(/no budget data to display/i)).toBeInTheDocument();
  });

  it("over-budget category still renders", () => {
    const { container } = render(<BudgetChart data={mockData} />);

    expect(container.querySelector(".recharts-responsive-container")).toBeInTheDocument();
  });
});
