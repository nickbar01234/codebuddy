/* eslint-disable @typescript-eslint/no-explicit-any */
import { initializeApp } from "firebase-admin/app";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import { logger } from "firebase-functions";
import {
  onDocumentCreated,
  onDocumentDeleted,
  onDocumentUpdated,
} from "firebase-functions/firestore";

initializeApp();

const db = getFirestore();

export const cleanup = onDocumentDeleted("rooms/{roomId}", async (event) => {
  const {
    params: { roomId },
  } = event;
  try {
    logger.info("Deleting subcollections", roomId);
    await db.recursiveDelete(db.doc(`rooms/${roomId}`));
  } catch (e: any) {
    logger.error("Failed to delete subcollections", roomId, e);
  }
});

export const setExpirationDate = onDocumentCreated(
  "rooms/{roomId}",
  (change) => {
    if (change.data?.exists) {
      const expiredAt = Timestamp.now().toDate();
      expiredAt.setDate(expiredAt.getDate() + 1);
      change.data?.ref.update({
        expiredAt,
      });
    }
  }
);

export const onRoomUsernamesUpdate = onDocumentUpdated(
  "rooms/{roomId}",
  async (event) => {
    const change = event.data;
    const context = event;
    if (!change) return;

    const before = change.before.data();
    const after = change.after.data();
    const roomId = context.params.roomId;

    if (!before || !after) return;

    const beforeUsernames = new Set(before.usernames || []);
    const afterUsernames = new Set(after.usernames || []);

    const joinedUsers = [...afterUsernames].filter(
      (u) => !beforeUsernames.has(u)
    );
    const leftUsers = [...beforeUsernames].filter(
      (u) => !afterUsernames.has(u)
    );

    const events: any[] = [];

    joinedUsers.forEach((username) => {
      events.push({
        type: "connection",
        timestamp: Timestamp.now(),
        payload: {
          username,
          status: "join",
        },
      });
    });

    leftUsers.forEach((username) => {
      events.push({
        type: "connection",
        timestamp: Timestamp.now(),
        payload: {
          username,
          status: "leave",
        },
      });
    });

    // Add events to Firestore logs
    await Promise.all(events.map((event) => addEventToRoom(event, roomId)));
  }
);

function addEventToRoom(event: any, roomId: string) {
  return db.collection(`rooms/${roomId}/logs`).add(event);
}
