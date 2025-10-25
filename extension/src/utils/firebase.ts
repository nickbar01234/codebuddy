import { Query, query, QueryConstraint } from "firebase/firestore";

export const decorateQuery = <T, U>(
  q: Query<T>,
  fnc: (value: U) => QueryConstraint,
  value: U
) => query(q, fnc(value));
