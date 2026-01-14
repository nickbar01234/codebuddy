import { WindowMessage } from "@cb/types";
import { expect, test } from "@tests/fixture";

test("Copy test", async ({ page }) => {
  const testValues = ["[3,2,4]", "9"];

  await page.waitForSelector('button[data-e2e-locator="console-testcase-tag"]');

  const initialCount = await page.$$eval(
    'button[data-e2e-locator="console-testcase-tag"]',
    (buttons) => buttons.length
  );

  await expect(async () => {
    await page.evaluate((values) => {
      const message: WindowMessage = {
        action: "appendTestCaseToLeetCode",
        testValues: values,
      };
      window.postMessage(message, "*");
    }, testValues);
    const buttons = await page.$$(
      'button[data-e2e-locator="console-testcase-tag"]'
    );
    expect(buttons.length).toBe(initialCount + 1);
  }).toPass();

  await expect(async () => {
    const inputs = await page.$$(
      'div[data-e2e-locator="console-testcase-input"][contenteditable="true"]'
    );
    expect(inputs.length).toBe(testValues.length);

    for (let i = 0; i < inputs.length; i++) {
      const text = await inputs[i].textContent();
      expect(text?.trim()).toBe(testValues[i]);
    }
  }).toPass();
});
