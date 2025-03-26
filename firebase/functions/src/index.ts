/* eslint-disable @typescript-eslint/no-explicit-any */
import { initializeApp } from "firebase-admin/app";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import { logger } from "firebase-functions";
import {
  onDocumentCreated,
  onDocumentDeleted,
} from "firebase-functions/firestore";

initializeApp();

const db = getFirestore();
// remember to change the path to the collection you want to delete. todoooo

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
