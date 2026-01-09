import { createRoom, joinRoom, RoomInfo } from "@tests/utils/room";
import { factory, UserPage } from "./factory";

interface UserInRoomPage extends UserPage {
  room: RoomInfo;
}

export const inRoomTest = factory.extend<{
  user1: UserInRoomPage;
  user2: UserInRoomPage;
}>({
  user1: async ({ pageCreator }, use) => {
    const user = await pageCreator.instantiate("user1@test.com");
    const room = await createRoom(user.page);
    await use({ ...user, room });
  },

  user2: async ({ pageCreator, user1 }, use) => {
    const user = await pageCreator.instantiate("user2@test.com");
    await joinRoom(user.page, user1.room.id);
    await use({ ...user, room: user1.room });
  },
});

export const inRoomExpect = inRoomTest.expect;
