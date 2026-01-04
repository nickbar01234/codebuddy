import type { Page } from "@playwright/test";

export interface RoomInfo {
  id: string;
}

export async function createRoom(page: Page): Promise<RoomInfo> {
  await page.getByRole("button", { name: "Create Room" }).click();
  await page.getByRole("radio", { name: "Private" }).click();
  await page.getByRole("button", { name: "Create" }).click();
  await page.getByRole("img", { name: "Copy room ID" }).click();

  const roomId = await page.evaluate(async () => {
    return await navigator.clipboard.readText();
  });

  if (!roomId) {
    throw new Error("Failed to extract room ID after creating room. ");
  }

  return { id: roomId };
}

export async function joinRoom(page: Page, roomId: string): Promise<void> {
  //joinRoomButton is hidden by beta banner
  await page.locator(".lucide.lucide-x").click();
  await page.getByRole("button", { name: "Join room" }).click();
  await page.getByRole("textbox", { name: "Enter room ID" }).fill(roomId);
  await page.getByRole("button", { name: "Join" }).click();
}
