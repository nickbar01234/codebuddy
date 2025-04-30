// @vitest-environment jsdom
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  RulesTestContext,
  RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { afterAll, beforeAll, describe, it } from "vitest";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rulesPath = path.resolve(__dirname, "firestore.rules");

describe("Firebase security test", () => {
  let testEnv: RulesTestEnvironment;
  const roomData = {
    questionId: "two-sum",
    expiredAt: new Date(),
    usernames: ["code@gmail.com", "buddy@hotmail.com"],
  };
  let authenticatedUser: RulesTestContext;
  let unauthenticatedUser: RulesTestContext;
  let authenticatedDb: ReturnType<RulesTestContext["firestore"]>;
  let unauthenticatedDb: ReturnType<RulesTestContext["firestore"]>;

  const createRoom = (db: ReturnType<RulesTestContext["firestore"]>) => {
    const roomId = `CODEBUDDYTEST_${Date.now()}`;
    return db.collection("rooms").doc(roomId);
  };

  const createSession = (roomDoc: ReturnType<typeof createRoom>) => {
    return roomDoc.collection("sessions").doc("two-sum");
  };

  const createEvent = (roomDoc: ReturnType<typeof createRoom>) => {
    return roomDoc.collection("events").doc("some-event");
  };

  beforeAll(async () => {
    testEnv = await initializeTestEnvironment({
      projectId: "demo-code-buddy-development",
      firestore: {
        rules: readFileSync(rulesPath, "utf-8"),
        host: "localhost",
        port: 3001,
      },
    });
    authenticatedUser = testEnv.authenticatedContext("codebuddytest", {
      email: "code@gmail.com",
    });
    unauthenticatedUser = testEnv.unauthenticatedContext();
    authenticatedDb = authenticatedUser.firestore();
    unauthenticatedDb = unauthenticatedUser.firestore();
  });

  afterAll(async () => {
    await testEnv.cleanup();
  });

  it("should allow authenticated users to read/write rooms", async () => {
    const authenticatedRoomDoc = createRoom(authenticatedDb);
    const authenticatedSession = createSession(authenticatedRoomDoc);
    // const authenticatedEvent = createEvent(authenticatedRoomDoc);
    await assertSucceeds(authenticatedRoomDoc.set(roomData));
    await assertSucceeds(authenticatedRoomDoc.get());
    await assertSucceeds(authenticatedSession.set({}));
    // await assertSucceeds(authenticatedEvent.get());
    // await assertSucceeds(authenticatedEvent.set({}));
    await assertFails(authenticatedRoomDoc.update({ expiredAt: new Date() }));
  });

  it("should deny unauthenticated users from read/write rooms", async () => {
    const unauthenticatedRoomDoc = createRoom(unauthenticatedDb);
    await assertFails(unauthenticatedRoomDoc.set(roomData));
    await assertFails(unauthenticatedRoomDoc.get());
  });

  it("only user in usernames array can access session document", async () => {
    const anotherEmail = testEnv.authenticatedContext("anotherUser", {
      email: "another@gmail.com",
    });
    const invalidRoomDoc = createRoom(anotherEmail.firestore());
    const invalidSessionRef = createSession(invalidRoomDoc);
    await assertFails(invalidSessionRef.set({}));
  });

  it("should deny random path", async () => {
    const randomCollection = authenticatedDb
      .collection("randomCollection")
      .doc("randomDoc");
    await assertFails(randomCollection.set(roomData));
  });

  it("only user in usernames array can access event document", async () => {
    const anotherEmail = testEnv.authenticatedContext("anotherUser", {
      email: "another@gmail.com",
    });
    const invalidRoomDoc = createRoom(anotherEmail.firestore());
    const invalidEventRef = createEvent(invalidRoomDoc);
    await assertFails(
      invalidEventRef.set({ type: "joined", timestamp: Date.now() })
    );
  });
});
