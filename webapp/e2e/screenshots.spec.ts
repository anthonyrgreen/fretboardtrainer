import { test, expect } from "@playwright/test";

test.describe("Visual regression", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("idle state", async ({ page }) => {
    await expect(page).toHaveScreenshot("idle.png");
  });

  test("playing state", async ({ page }) => {
    await page.click("text=Start");
    await page.waitForTimeout(300);

    await expect(page).toHaveScreenshot("playing.png", {
      // Staff scrolls via rAF (not CSS), so mask the entire container
      mask: [page.locator(".staff-container")],
    });
  });

  test("paused state", async ({ page }) => {
    await page.click("text=Start");
    await page.waitForTimeout(200);
    await page.click("text=Pause");

    await expect(page).toHaveScreenshot("paused.png", {
      mask: [page.locator(".staff-container")],
    });
  });

  test("settings panel", async ({ page }) => {
    const settings = page.locator(".settings");
    await expect(settings).toHaveScreenshot("settings.png");
  });

  test("controls - idle", async ({ page }) => {
    const controls = page.locator(".controls");
    await expect(controls).toHaveScreenshot("controls-idle.png");
  });

  test("controls - playing", async ({ page }) => {
    await page.click("text=Start");
    const controls = page.locator(".controls");
    await expect(controls).toHaveScreenshot("controls-playing.png");
  });

  test("controls - paused", async ({ page }) => {
    await page.click("text=Start");
    await page.waitForTimeout(100);
    await page.click("text=Pause");
    const controls = page.locator(".controls");
    await expect(controls).toHaveScreenshot("controls-paused.png");
  });

  test("staff container in idle", async ({ page }) => {
    const staff = page.locator(".staff-container");
    await expect(staff).toHaveScreenshot("staff-idle.png");
  });

  test("staff shows all beats after adding a beat", async ({ page }) => {
    // Add a rest beat via the + button
    await page.click('[title="Add beat"]');

    const staff = page.locator(".staff-container");
    await expect(staff).toHaveScreenshot("staff-5-beats.png");
  });
});
