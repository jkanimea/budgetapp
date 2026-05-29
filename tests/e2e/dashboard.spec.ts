import { test, expect } from "@playwright/test";

test.describe("Dashboard loads correctly", () => {
  test("shows summary cards and charts", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Dashboard")).toBeVisible({ timeout: 10000 });

    await expect(page.getByText("Income")).toBeVisible({ timeout: 10000 });
    await expect(page.getByText("Expenses")).toBeVisible();
    await expect(page.getByText(/savings|overspend/i)).toBeVisible();

    await expect(page.locator(".recharts-responsive-container")).toHaveCount(3, { timeout: 10000 });
  });
});
