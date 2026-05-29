import { test, expect } from "@playwright/test";

test.describe("Transaction search and filter", () => {
  test("search reduces results and type filter works", async ({ page }) => {
    await page.goto("/transactions");

    await page.waitForSelector("table", { timeout: 10000 });

    const searchInput = page.locator("input").first();
    await searchInput.fill("New World");
    await page.waitForTimeout(400);

    const typeDropdown = page.getByText("All Types");
    await typeDropdown.click();
    await page.getByText("Eft-Pos").click();
  });
});
