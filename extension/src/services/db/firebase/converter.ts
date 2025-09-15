import { Negotiation, Room } from "@cb/types";
import { UserProgress } from "@cb/types/db";
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

export const userProgressConverter: FirestoreDataConverter<
  UserProgress,
  UserProgress
> = {
  toFirestore: identity,
  fromFirestore: (snapshot: QueryDocumentSnapshot<UserProgress>, options) =>
    snapshot.data(options),
};
