import { expect, twoUserRoomTest } from "../fixture";

const EXPECTED_CPP_CODE = `class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        
    }
};`;

twoUserRoomTest("User1 can copy code from User2", async ({ user1, user2 }) => {
  await user1.page.getByRole("tab", { name: /Code/i }).click();
  await user1.page.getByTestId("toggle-code-visibility").click();
  await user1.page.getByTestId("copy-code").click({ force: true });

  await expect(async () => {
    const copiedCode = await user1.page.evaluate(async () => {
      return await navigator.clipboard.readText();
    });
    expect(copiedCode.trim()).toBe(EXPECTED_CPP_CODE.trim());
  }).toPass();
});
