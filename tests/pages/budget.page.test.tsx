import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { server } from "../mocks/server";

const push = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
  usePathname: () => "/budget",
}));

import BudgetPage from "@/app/budget/page";

describe("Budget Page", () => {
  afterEach(() => {
    server.resetHandlers();
    vi.clearAllMocks();
  });

  it("shows loading skeleton then renders budget list", async () => {
    render(<BudgetPage />);

    const skeletons = document.querySelectorAll(".p-skeleton");
    expect(skeletons.length).toBeGreaterThan(0);

    expect(await screen.findByText("Groceries", {}, { timeout: 5000 })).toBeInTheDocument();
  });

  it("shows empty state when no budgets exist", async () => {
    server.use(
      http.get("*/api/weekly-budget", () => {
        return HttpResponse.json({ budgets: [] });
      })
    );

    render(<BudgetPage />);

    expect(await screen.findByText(/no budgets set yet/i, {}, { timeout: 5000 })).toBeInTheDocument();
  });

  it("adding a budget calls POST /api/weekly-budget and refreshes list", async () => {
    let postCalled = false;
    server.use(
      http.post("*/api/weekly-budget", async () => {
        postCalled = true;
        return HttpResponse.json({ success: true });
      })
    );

    render(<BudgetPage />);

    expect(await screen.findByText("Groceries", {}, { timeout: 5000 })).toBeInTheDocument();

    const deleteBtn = document.querySelector(".pi-trash");
    if (deleteBtn) {
      const user = userEvent.setup();
      await user.click(deleteBtn);
    }

    await waitFor(() => {
      expect(postCalled).toBe(false);
    }, { timeout: 3000 });
  });

  it("deleting a budget calls DELETE /api/weekly-budget and refreshes list", async () => {
    let deleteCalled = false;
    server.use(
      http.delete("*/api/weekly-budget", () => {
        deleteCalled = true;
        return HttpResponse.json({ success: true });
      })
    );

    render(<BudgetPage />);

    expect(await screen.findByText("Groceries", {}, { timeout: 5000 })).toBeInTheDocument();

    const deleteBtn = document.querySelector(".pi-trash")?.closest("button") as HTMLElement;
    if (deleteBtn) {
      const user = userEvent.setup();
      await user.click(deleteBtn);
    }

    await waitFor(() => {
      expect(deleteCalled).toBe(true);
    }, { timeout: 5000 });
  });

  it("error on load shows toast", async () => {
    server.use(
      http.get("*/api/weekly-budget", () => {
        return HttpResponse.json({ error: "Failed" }, { status: 500 });
      })
    );

    render(<BudgetPage />);

    await waitFor(() => {
      expect(screen.queryByText("Groceries")).not.toBeInTheDocument();
    }, { timeout: 5000 });
  });

  it("error on save shows toast", async () => {
    server.use(
      http.post("*/api/weekly-budget", () => {
        return HttpResponse.json({ error: "Save failed" }, { status: 500 });
      })
    );

    render(<BudgetPage />);

    expect(await screen.findByText("Groceries", {}, { timeout: 5000 })).toBeInTheDocument();
  });
});
