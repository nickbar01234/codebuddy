import { Models } from "@cb/types";
import { and, collection, orderBy, query, where } from "firebase/firestore";
import { auth, firebaseDatabaseServiceImpl } from "./firebase";
import { roomConverter } from "./firebase/converter";
import { firestore } from "./firebase/setup";

const db = firebaseDatabaseServiceImpl;

// todo(nickbar01234): To filter on "full" room, we need to add auxilary field for user count. Alternatively, we can
// display full room but have it so that users can't click on it.
export const roomQuery = decorateQuery(
  query(
    collection(firestore, Models.ROOMS).withConverter(roomConverter),
    and(where("isPublic", "==", true), where("users", "!=", {}))
  ),
  orderBy,
  "createdAt"
);

export default db;
export { auth };
