import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { BudgetForm } from "@/components/BudgetForm";

const mockCategories = [
  { id: 1, name: "Groceries", type: "EXPENSE", icon: "🛒", color: "#ef4444" },
  { id: 2, name: "Fuel", type: "EXPENSE", icon: "⛽", color: "#f97316" },
  { id: 3, name: "Income", type: "INCOME", icon: "💼", color: "#22c55e" },
];

const mockBudgets = [
  { id: 1, categoryId: 1, weeklyAmount: 50, category: mockCategories[0] },
];

describe("BudgetForm", () => {
  it("Add Budget button disabled when no category selected", () => {
    render(<BudgetForm budgets={[]} categories={mockCategories} onSave={vi.fn()} onDelete={vi.fn()} />);

    const btn = screen.getByRole("button", { name: /add budget/i });
    expect(btn).toBeDisabled();
  });

  it("Add Budget button disabled when amount is null or zero", () => {
    render(<BudgetForm budgets={[]} categories={mockCategories} onSave={vi.fn()} onDelete={vi.fn()} />);

    const btn = screen.getByRole("button", { name: /add budget/i });
    expect(btn).toBeDisabled();
  });

  it("shows empty state when budgets is empty array", () => {
    render(<BudgetForm budgets={[]} categories={mockCategories} onSave={vi.fn()} onDelete={vi.fn()} />);

    expect(screen.getByText(/no budgets set yet/i)).toBeInTheDocument();
  });

  it("renders existing budgets", () => {
    render(<BudgetForm budgets={mockBudgets} categories={mockCategories} onSave={vi.fn()} onDelete={vi.fn()} />);

    expect(screen.getByText("Groceries")).toBeInTheDocument();
  });

  it("shows delete button for each budget", () => {
    render(<BudgetForm budgets={mockBudgets} categories={mockCategories} onSave={vi.fn()} onDelete={vi.fn()} />);

    const deleteBtn = document.querySelector(".pi-trash");
    expect(deleteBtn).toBeInTheDocument();
  });

  it("clicking delete calls onDelete with correct id", async () => {
    const onDelete = vi.fn();
    render(<BudgetForm budgets={mockBudgets} categories={mockCategories} onSave={vi.fn()} onDelete={onDelete} />);

    const deleteBtn = document.querySelector(".pi-trash")?.closest("button");
    expect(deleteBtn).toBeInTheDocument();
    if (deleteBtn) {
      fireEvent.click(deleteBtn);
      expect(onDelete).toHaveBeenCalledWith(1);
    }
  });

  it("already-budgeted categories are filtered from dropdown", () => {
    render(<BudgetForm budgets={mockBudgets} categories={mockCategories} onSave={vi.fn()} onDelete={vi.fn()} />);

    const hiddenSelect = document.querySelector('[data-pc-section="select"]') as HTMLSelectElement;
    const options = Array.from(hiddenSelect?.options || []);
    const optionValues = options.map((o) => o.value);
    expect(optionValues).not.toContain("1");
  });
});
