import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
} from "@firebase/rules-unit-testing";
import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rulesPath = path.resolve(__dirname, "../firestore.rules");

(async () => {
  const roomData = {
    questionId: "two-sum",
    expiredAt: new Date(),
    usernames: ["code@gmail.com"],
  };

  const testEnv = await initializeTestEnvironment({
    projectId: "demo-code-buddy-development",
    firestore: {
      rules: readFileSync(rulesPath, "utf-8"),
      host: "localhost",
      port: 3001,
    },
  });

  const authenticatedUser = testEnv.authenticatedContext("codebuddytest", {
    email: "code@gmail.com",
  });
  const db = authenticatedUser.firestore();
  const roomDoc = db.collection("rooms").doc(`CODEBUDDYTEST ${new Date()}`);

  console.log("Authenticated user can write from room");
  await assertSucceeds(roomDoc.set(roomData));

  console.log("Authenticated user can read from room");
  await assertSucceeds(roomDoc.get());

  const unauthenticated = testEnv.unauthenticatedContext();
  const testDb = unauthenticated.firestore();
  const undefineRoomDoc = testDb
    .collection("rooms")
    .doc(`CODEBUDDYTEST ${new Date()}`);

  console.log("Unauthenticated user cannot write from room");
  await assertFails(undefineRoomDoc.set(roomData));

  console.log("Unauthenticated user cannot read from room");
  await assertFails(undefineRoomDoc.get());
})();
