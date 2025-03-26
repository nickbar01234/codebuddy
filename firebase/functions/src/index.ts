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

export const cleanup = onDocumentDeleted("groups/{groupId}", async (event) => {
  const {
    params: { groupId },
  } = event;
  try {
    logger.info("Deleting subcollections", groupId);
    await db.recursiveDelete(db.doc(`groups/${groupId}`));
  } catch (e: any) {
    logger.error("Failed to delete subcollections", groupId, e);
  }
});

export const setExpirationDate = onDocumentCreated(
  "groups/{groupId}",
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
