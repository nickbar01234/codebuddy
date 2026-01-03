import type { Page } from "@playwright/test";
import { createExtensionContext, getExtensionId } from "../fixture";
import type { AuthenticatedUser } from "./auth";
import { authenticatedTest, signIn } from "./auth";

export interface RoomInfo {
  id: string;
}

async function createRoom(page: Page): Promise<RoomInfo> {
  await page.locator('button:has-text("Create Room")').click();
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

async function joinRoom(page: Page, roomId: string): Promise<void> {
  //joinRoomButton is hidden by beta banner
  await page.locator(".lucide.lucide-x").click();
  await page.getByRole("button", { name: "Join room" }).click();
  await page.locator('input[id="roomId"]').fill(roomId);
  await page.locator('button:has-text("Join")').last().click();
}

export const multiUserRoomTest = authenticatedTest.extend<{
  room: RoomInfo;
  user1: AuthenticatedUser;
  user2: AuthenticatedUser;
}>({
  user1: async ({ authenticatedUser }, use) => {
    await use(authenticatedUser);
  },
  room: async ({ user1 }, use) => {
    const room = await createRoom(user1.page);
    await use(room);
  },
  user2: async ({ room }, use) => {
    // Create separate context for user2
    const user2Context = await createExtensionContext();
    const user2Page = user2Context.pages()[0] || (await user2Context.newPage());
    const user2Email = `user2-${Date.now()}@test.com`;

    await signIn(user2Page, user2Email);
    await joinRoom(user2Page, room.id);
    const extensionId = await getExtensionId(user2Context);

    const user2: AuthenticatedUser = {
      email: user2Email,
      page: user2Page,
      context: user2Context,
      extensionId,
    };

    await use(user2);
    await user2Context.close();
  },
});

export { joinRoom };
