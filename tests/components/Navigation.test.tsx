import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

const push = vi.fn();
let pathname = "/";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
  usePathname: () => pathname,
}));

import { Navigation } from "@/components/Navigation";

describe("Navigation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders all 4 nav items", () => {
    render(<Navigation />);

    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Import CSV")).toBeInTheDocument();
    expect(screen.getByText("Transactions")).toBeInTheDocument();
    expect(screen.getByText("Budget")).toBeInTheDocument();
  });

  it("active item has p-menuitem-active class when pathname matches", () => {
    pathname = "/";
    const { container } = render(<Navigation />);

    const items = container.querySelectorAll(".p-menuitem-active");
    expect(items.length).toBeGreaterThan(0);
  });

  it("clicking nav item calls router.push with correct href", () => {
    render(<Navigation />);

    const budgetLink = screen.getByText("Budget");
    fireEvent.click(budgetLink);
    expect(push).toHaveBeenCalledWith("/budget");
  });
});
