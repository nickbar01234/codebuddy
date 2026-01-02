import type { Page } from "@playwright/test";
import { authenticatedTest } from "./auth";

export interface RoomInfo {
  id: string;
}

async function createRoom(page: Page): Promise<RoomInfo> {
  const createRoomButton = page.locator('button:has-text("Create Room")');
  await createRoomButton.click();

  const radioButton = page.getByRole("radio", { name: "Private" });
  await radioButton.click();

  const createButton = page.getByRole("button", { name: "Create" });
  await createButton.click();

  const copyButton = page.getByRole("img", { name: "Copy room ID" });
  await copyButton.click();

  const roomId = await page.evaluate(async () => {
    return await navigator.clipboard.readText();
  });

  if (!roomId) {
    throw new Error("Failed to extract room ID after creating room. ");
  }

  return { id: roomId };
}

async function joinRoom(page: Page, roomId: string): Promise<void> {
  //joinRoomButton is hidden by beta banner
  const removeBetaBanner = page.locator(".lucide.lucide-x");
  await removeBetaBanner.click();

  const joinRoomButton = page.getByRole("button", { name: "Join room" });
  await joinRoomButton.click();

  const roomIdInput = page.locator('input[id="roomId"]');
  await roomIdInput.fill(roomId);

  const joinButton = page.locator('button:has-text("Join")').last();
  await joinButton.click();
}

export const roomTest = authenticatedTest.extend<{
  room: RoomInfo;
}>({
  room: async ({ authenticatedUser }, use) => {
    const room = await createRoom(authenticatedUser.page);
    await use(room);
  },
});

export { joinRoom };
