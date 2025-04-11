import {
  endBefore,
  limit as firestoreLimit,
  query as firestoreQuery,
  getCountFromServer,
  getDocs,
  Query,
  QueryDocumentSnapshot,
  QuerySnapshot,
  startAfter,
} from "firebase/firestore";
import { useCallback, useEffect, useMemo, useState } from "react";

interface Data<T> {
  docs: QueryDocumentSnapshot<T>[];
}

interface HookReturnValue<T> {
  totalDocs: number;
  data: Data<T>;
  error?: Error;
  loading: boolean;
  getNext: () => void;
  getPrevious: () => void;
  hasNext: boolean;
}

interface HookProps<T> {
  query: Query<T>;
  limit: number;
}

const usePaginate = <T>({
  query: baseQuery,
  limit,
}: HookProps<T>): HookReturnValue<T> => {
  const [docs, setDocs] = useState<QueryDocumentSnapshot<T>[]>([]);
  const [firstDoc, setFirstDoc] = useState<QueryDocumentSnapshot<T>>();
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot<T>>();
  const [totalDocs, setTotalDocs] = useState(0);
  const [error, setError] = useState<Error>();
  const [loading, setLoading] = useState<boolean>(false);
  const [direction, setDirection] = useState<"next" | "prev">("next");

  const buildPaginatedQuery = useCallback(
    (cursor?: QueryDocumentSnapshot<T>) => {
      const cursorConstraint =
        cursor &&
        (direction === "next" ? startAfter(cursor) : endBefore(cursor));
      return firestoreQuery(
        baseQuery,
        ...(cursorConstraint ? [cursorConstraint] : []),
        firestoreLimit(limit)
      );
    },
    [baseQuery, direction, limit]
  );

  const handleSnapshot = useCallback(
    (res: QuerySnapshot<T>) => {
      if (res.empty) return;

      const newDocs = res.docs;
      if (!firstDoc || direction === "prev") setFirstDoc(newDocs[0]);
      if (direction === "next") setLastDoc(newDocs[newDocs.length - 1]);

      setDocs((prev) =>
        direction === "next" ? [...prev, ...newDocs] : [...newDocs, ...prev]
      );
    },
    [direction, firstDoc]
  );

  const handleError = useCallback((err: unknown) => {
    setError(err as Error);
  }, []);

  const fetchDocs = useCallback(
    async (cursor?: QueryDocumentSnapshot<T>) => {
      setLoading(true);
      try {
        const q = buildPaginatedQuery(cursor);
        const res = await getDocs(q);
        handleSnapshot(res);
      } catch (err) {
        handleError(err);
      } finally {
        setLoading(false);
      }
    },
    [buildPaginatedQuery, handleSnapshot, handleError]
  );

  useEffect(() => {
    getCountFromServer(baseQuery)
      .then((res) => setTotalDocs(res.data().count))
      .catch(handleError);
  }, [baseQuery, handleError]);

  useEffect(() => {
    fetchDocs();
  }, [fetchDocs]);

  const getNext = useCallback(() => {
    if (docs.length === totalDocs) return;
    setDirection("next");
    if (lastDoc) fetchDocs(lastDoc);
  }, [lastDoc, fetchDocs, docs, totalDocs]);

  const getPrevious = useCallback(() => {
    setDirection("prev");
    if (firstDoc) fetchDocs(firstDoc);
  }, [firstDoc, fetchDocs]);

  return useMemo(
    () => ({
      error,
      loading,
      getNext,
      getPrevious,
      hasNext: docs.length < totalDocs,
      data: {
        docs,
      },
      totalDocs,
    }),
    [docs, totalDocs, error, getNext, getPrevious, loading]
  );
};

export default usePaginate;
