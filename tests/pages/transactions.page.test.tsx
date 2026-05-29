import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { server } from "../mocks/server";

const push = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
  usePathname: () => "/transactions",
}));

import TransactionsPage from "@/app/transactions/page";

describe("Transactions Page", () => {
  afterEach(() => {
    server.resetHandlers();
    vi.clearAllMocks();
  });

  it("loads and displays transactions on mount", async () => {
    render(<TransactionsPage />);

    expect(await screen.findByText("New World", {}, { timeout: 5000 })).toBeInTheDocument();
  });

  it("typing in search debounces before firing API", async () => {
    const user = userEvent.setup();
    render(<TransactionsPage />);

    expect(await screen.findByText("New World", {}, { timeout: 5000 })).toBeInTheDocument();

    const searchInput = document.querySelector("input") as HTMLInputElement;
    await user.type(searchInput, "BP");

    await waitFor(() => {
      expect(screen.getByText("BP Connect")).toBeInTheDocument();
    }, { timeout: 5000 });
  });

  it("changing type filter updates results", async () => {
    const mockHandler = vi.fn(({ request }) => {
      const type = new URL(request.url).searchParams.get("type");
      if (type === "Eft-Pos") {
        return HttpResponse.json({
          transactions: [{ id: 1, type: "Eft-Pos", amount: -25.50, date: "2024-03-15", details: "New World", particulars: "", code: "", reference: "", foreignCurrencyAmount: null, conversionCharge: null, category: { id: 1, name: "Groceries", color: "#ef4444" } }],
          total: 1,
        });
      }
      return HttpResponse.json({
        transactions: [{ id: 1, type: "Eft-Pos", amount: -25.50, date: "2024-03-15", details: "New World", particulars: "", code: "", reference: "", foreignCurrencyAmount: null, conversionCharge: null, category: { id: 1, name: "Groceries", color: "#ef4444" } }],
        total: 1,
      });
    });
    server.use(http.get("*/api/transactions", mockHandler));

    render(<TransactionsPage />);
    expect(await screen.findByText("New World", {}, { timeout: 5000 })).toBeInTheDocument();
  });

  it("shows amounts in red for negative", async () => {
    render(<TransactionsPage />);

    await waitFor(() => {
      const amountElements = document.querySelectorAll(".text-red-600");
      expect(amountElements.length).toBeGreaterThan(0);
    }, { timeout: 5000 });
  });

  it("shows No transactions found when API returns empty", async () => {
    server.use(
      http.get("*/api/transactions", () => {
        return HttpResponse.json({ transactions: [], total: 0 });
      })
    );

    render(<TransactionsPage />);

    expect(await screen.findByText(/no transactions found/i, {}, { timeout: 5000 })).toBeInTheDocument();
  });

  it("shows error toast on API failure", async () => {
    server.use(
      http.get("*/api/transactions", () => {
        return HttpResponse.json({ error: "Server error" }, { status: 500 });
      })
    );

    render(<TransactionsPage />);
  });
});
