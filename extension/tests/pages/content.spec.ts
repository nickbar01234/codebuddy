import { expect, test } from "@tests/fixture";
import { inRoomExpect, inRoomTest } from "@tests/fixture/in-room";

test("Content script is mounted", async ({ page }) => {
  await expect(page.getByText("CodeBuddy").first()).toBeVisible({
    timeout: 30_000,
  });
});

const EXPECTED_CPP_CODE = `class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        
    }
};`;

inRoomTest("User1 can copy code from User2", async ({ user1 }) => {
  await user1.page.getByRole("tab", { name: /Code/i }).click();
  await user1.page.getByTestId("toggle-code-visibility").click();
  await user1.page.getByTestId("copy-code").click();
  await inRoomExpect(async () => {
    const copiedCode = await user1.page.evaluate(() =>
      navigator.clipboard.readText()
    );
    inRoomExpect(copiedCode.trim()).toBe(EXPECTED_CPP_CODE.trim());
  }).toPass();
});
