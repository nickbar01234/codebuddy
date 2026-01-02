import { signIn } from "../auth";
import { createExtensionContext } from "../fixture";
import { joinRoom, roomTest } from "../room";

roomTest(
  "Two users can establish connection within one room",
  async ({ authenticatedUser, room }) => {
    const user1 = authenticatedUser;

    const user2Context = await createExtensionContext();
    const user2Page = user2Context.pages()[0] || (await user2Context.newPage());
    const user2Email = `user2-${Date.now()}@test.com`;

    await signIn(user2Page, user2Email);

    await joinRoom(user2Page, room.id);

    await user2Context.close();
  }
);
