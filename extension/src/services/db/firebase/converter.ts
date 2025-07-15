import { Negotiation, Room } from "@cb/services/db/types";
import {
  FirestoreDataConverter,
  QueryDocumentSnapshot,
} from "firebase/firestore";
import { identity } from "lodash";

export const roomConverter: FirestoreDataConverter<Room, Room> = {
  toFirestore: identity,
  fromFirestore: (snapshot: QueryDocumentSnapshot<Room>, options) =>
    snapshot.data(options),
};

export const negotiationConverter: FirestoreDataConverter<
  Negotiation,
  Negotiation
> = {
  toFirestore: identity,
  fromFirestore: (snapshot: QueryDocumentSnapshot<Negotiation>, options) =>
    snapshot.data(options),
};
