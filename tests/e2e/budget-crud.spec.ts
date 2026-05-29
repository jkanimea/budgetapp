import { test, expect } from "@playwright/test";

test.describe("Budget CRUD", () => {
  test("adds and removes a budget", async ({ page }) => {
    await page.goto("/budget");

    await page.waitForSelector(".p-dropdown", { timeout: 10000 });
    await page.locator(".p-dropdown").first().click();
    await page.getByText("Groceries").click();

    const amountInput = page.locator(".p-inputnumber input");
    await amountInput.fill("150");

    await page.getByRole("button", { name: /add budget/i }).click();
    await expect(page.getByText(/groceries/i)).toBeVisible({ timeout: 10000 });

    const deleteButton = page.locator(".pi-trash").first();
    await deleteButton.click();
  });
});
