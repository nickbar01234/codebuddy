import { WindowMessage } from "@cb/types";
import { expect, test } from "@tests/fixture";

test("Copy test", async ({ page }) => {
  const testValues = ["[3,2,4]", "9"];

  await page.waitForSelector(
    'button[data-e2e-locator="console-testcase-tag"]',
    { timeout: 10000 }
  );

  const initialCount = await page.$$eval(
    'button[data-e2e-locator="console-testcase-tag"]',
    (buttons) => buttons.length
  );
  await page.evaluate((values) => {
    const message: WindowMessage = {
      action: "appendTestCaseToLeetCode",
      testValues: values,
    };
    window.postMessage(message, "*");
  }, testValues);
  await expect(async () => {
    const buttons = await page.$$(
      'button[data-e2e-locator="console-testcase-tag"]'
    );
    expect(buttons.length).toBe(initialCount + 1);
  }).toPass({ timeout: 10_000 });

  const buttons = page
    .locator('button[data-e2e-locator="console-testcase-tag"]')
    .last();
  await buttons.click({ force: true });

  await expect(async () => {
    const inputs = await page.$$(
      'div[data-e2e-locator="console-testcase-input"][contenteditable="true"]'
    );
    expect(inputs.length).toBe(testValues.length);

    for (let i = 0; i < inputs.length; i++) {
      const text = await inputs[i].textContent();
      expect(text?.trim()).toBe(testValues[i]);
    }
  }).toPass({ timeout: 10_000 });
});
