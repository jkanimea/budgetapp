import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ExpensePieChart } from "@/components/ExpensePieChart";

const mockData = [
  { categoryName: "Groceries", amount: 200, percentage: 50 },
  { categoryName: "Fuel", amount: 100, percentage: 25 },
  { categoryName: "Rent", amount: 100, percentage: 25 },
];

describe("ExpensePieChart", () => {
  it("renders pie chart when data has entries", () => {
    const { container } = render(<ExpensePieChart data={mockData} />);

    expect(container.querySelector(".recharts-responsive-container")).toBeInTheDocument();
  });

  it("shows empty state when data is empty", () => {
    render(<ExpensePieChart data={[]} />);

    expect(screen.getByText(/no expense data this week/i)).toBeInTheDocument();
  });
});
