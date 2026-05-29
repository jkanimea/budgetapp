import { test, expect } from "@playwright/test";

test.describe("CSV Import Flow", () => {
  test("navigates to upload, imports CSV, verifies transactions", async ({ page }) => {
    await page.goto("/upload");
    await expect(page.getByText("Import Bank CSV")).toBeVisible();

    const fileChooserPromise = page.waitForEvent("filechooser");
    const dropZone = page.getByText(/drop your csv file here/i);
    await dropZone.click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles({ name: "test.csv", mimeType: "text/csv", buffer: Buffer.from("Type,Details,Particulars,Code,Reference,Amount,Date,ForeignCurrencyAmount,ConversionCharge\nEft-Pos,Test Transaction,,,,-10.00,15/03/2024,,") });

    await page.getByRole("button", { name: /import csv/i }).click();
    await expect(page.getByText(/imported/i)).toBeVisible({ timeout: 10000 });

    await page.goto("/transactions");
    await expect(page.getByText("Test Transaction")).toBeVisible({ timeout: 10000 });
  });
});
