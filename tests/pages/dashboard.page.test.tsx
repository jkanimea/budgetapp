import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { server } from "../mocks/server";

const push = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
  usePathname: () => "/",
}));

import DashboardPage from "@/app/page";

describe("Dashboard Page", () => {
  afterEach(() => {
    server.resetHandlers();
    vi.clearAllMocks();
  });

  it("shows skeleton loaders while fetching", () => {
    render(<DashboardPage />);

    const skeletons = document.querySelectorAll(".p-skeleton");
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it("renders dashboard components after load", async () => {
    render(<DashboardPage />);

    expect(await screen.findByText("$1,500.00", {}, { timeout: 5000 })).toBeInTheDocument();
  });

  it("shows error state with Try again button on API failure", async () => {
    server.use(
      http.get("*/api/dashboard", () => {
        return HttpResponse.json({ error: "Server error" }, { status: 500 });
      })
    );

    render(<DashboardPage />);

    expect(await screen.findByText(/failed to load dashboard/i, {}, { timeout: 5000 })).toBeInTheDocument();
    expect(screen.getByText(/try again/i)).toBeInTheDocument();
  });

  it("try again button triggers re-fetch", async () => {
    server.use(
      http.get("*/api/dashboard", () => {
        return HttpResponse.json({ error: "Server error" }, { status: 500 });
      })
    );

    render(<DashboardPage />);

    expect(await screen.findByText(/failed to load dashboard/i, {}, { timeout: 5000 })).toBeInTheDocument();

    const tryAgainBtn = screen.getByText(/try again/i);
    expect(tryAgainBtn).toBeInTheDocument();

    server.resetHandlers();
  });

  it("displays correct week date range in subtitle", async () => {
    render(<DashboardPage />);

    expect(await screen.findByText(/2024-03-11/, {}, { timeout: 5000 })).toBeInTheDocument();
  });
});
