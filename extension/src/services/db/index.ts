import { Models } from "@cb/types";
import { collection, query, where } from "firebase/firestore";
import { auth, firebaseDatabaseServiceImpl } from "./firebase";
import { roomConverter } from "./firebase/converter";
import { firestore } from "./firebase/setup";

const db = firebaseDatabaseServiceImpl;

export const roomQuery = query(
  collection(firestore, Models.ROOMS).withConverter(roomConverter),
  where("isPublic", "==", true)
);

export default db;
export { auth };
