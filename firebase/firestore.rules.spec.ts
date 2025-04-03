import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { beforeAll, describe, it } from "vitest";

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

  beforeAll(async () => {
    testEnv = await initializeTestEnvironment({
      projectId: "demo-code-buddy-development",
      firestore: {
        rules: readFileSync(rulesPath, "utf-8"),
        host: "localhost",
        port: 3001,
      },
    });
  });

  it("should allow authenticated users to read/write rooms", async () => {
    const authenticatedUser = testEnv.authenticatedContext("codebuddytest", {
      email: "code@gmail.com",
    });
    const roomId = `CODEBUDDYTEST_${Date.now()}`;

    const db = authenticatedUser.firestore();
    const roomDoc = db.collection("rooms").doc(roomId);
    const sessionSubRef = db
      .collection("rooms")
      .doc(roomId)
      .collection("sessions")
      .doc("two-sum");

    await assertSucceeds(roomDoc.set(roomData));
    await assertSucceeds(roomDoc.get());
    await assertSucceeds(sessionSubRef.set({}));
  });

  it("should deny unauthenticated users from read/write rooms", async () => {
    const unauthenticated = testEnv.unauthenticatedContext();
    const db = unauthenticated.firestore();
    const roomDoc = db.collection("rooms").doc(`CODEBUDDYTEST_${Date.now()}`);

    await assertFails(roomDoc.set(roomData));
    await assertFails(roomDoc.get());
  });

  it("only user in usernames array can access session document", async () => {
    const roomId = `CODEBUDDYTEST_${Date.now()}`;
    const anotherEmail = testEnv.authenticatedContext("anotherUser", {
      email: "another@gmail.com",
    });
    const validUser = testEnv.authenticatedContext("codebuddytest", {
      email: "buddy@hotmail.com",
    });
    const validDb = validUser.firestore();
    const roomDoc = validDb.collection("rooms").doc(roomId);
    await roomDoc.set(roomData);

    const unvalidDb = anotherEmail.firestore();
    const sessionSubRef = unvalidDb
      .collection("rooms")
      .doc(roomId)
      .collection("sessions")
      .doc("two-sum");
    await assertFails(sessionSubRef.set({}));
  });

  it("should deny random path", async () => {
    const authenticatedUser = testEnv.authenticatedContext("codebuddytest", {
      email: "code@gmail.com",
    });
    const db = authenticatedUser.firestore();
    const randomCollection = db.collection("randomCollection").doc("randomDoc");
    await assertFails(randomCollection.set(roomData));
  });
});
