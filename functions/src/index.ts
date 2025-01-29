/* eslint-disable @typescript-eslint/no-explicit-any */
import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { logger } from "firebase-functions";
import { onDocumentDeleted } from "firebase-functions/firestore";

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
