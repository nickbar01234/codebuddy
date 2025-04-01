import { beforeAll, describe, expect, it } from "vitest";
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rulesPath = path.resolve(__dirname, "firestore.rules");

describe("DemoTest", () => {
  it("TestRunner", () => {
    expect(1).toBe(1);
  });
});

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
    const db = authenticatedUser.firestore();
    const roomDoc = db.collection("rooms").doc(`CODEBUDDYTEST_${Date.now()}`);

    await assertSucceeds(roomDoc.set(roomData));
    await assertSucceeds(roomDoc.get());
  });

  it("should deny unauthenticated users from read/write rooms", async () => {
    const unauthenticated = testEnv.unauthenticatedContext();
    const db = unauthenticated.firestore();
    const roomDoc = db.collection("rooms").doc(`CODEBUDDYTEST_${Date.now()}`);

    await assertFails(roomDoc.set(roomData));
    await assertFails(roomDoc.get());
  });
});
