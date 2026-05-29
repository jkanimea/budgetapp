import { test, expect } from "@playwright/test";

test.describe("Error recovery", () => {
  test("shows error state with Try again when offline, recovers on retry", async ({ page, context }) => {
    await context.route("**/api/dashboard", (route) => {
      route.abort("connectionrefused");
    });

    await page.goto("/");
    await expect(page.getByText(/failed to load dashboard/i)).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/try again/i)).toBeVisible();

    await context.unroute("**/api/dashboard");
    await page.getByText(/try again/i).click();
    await expect(page.getByText("Dashboard")).toBeVisible({ timeout: 10000 });
  });
});
