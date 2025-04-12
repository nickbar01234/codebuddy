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
import { debounce } from "lodash";
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

  const buildPaginatedQuery = useCallback(
    (isNext: boolean, cursor?: QueryDocumentSnapshot<T>) => {
      const cursorConstraint =
        cursor && (isNext ? startAfter(cursor) : endBefore(cursor));
      return firestoreQuery(
        baseQuery,
        ...(cursorConstraint ? [cursorConstraint] : []),
        firestoreLimit(limit)
      );
    },
    [baseQuery, limit]
  );

  const handleSnapshot = useCallback(
    (res: QuerySnapshot<T>, isNext: boolean) => {
      if (res.empty) return;

      const newDocs = res.docs;
      if (!firstDoc || !isNext) setFirstDoc(newDocs[0]);
      if (isNext) setLastDoc(newDocs[newDocs.length - 1]);

      setDocs((prev) =>
        isNext ? [...prev, ...newDocs] : [...newDocs, ...prev]
      );
    },
    [firstDoc]
  );

  const handleError = useCallback((err: unknown) => {
    setError(err as Error);
  }, []);

  const fetchDocs = useMemo(
    () =>
      debounce(
        async (cursor?: QueryDocumentSnapshot<T>, isNext: boolean = true) => {
          setLoading(true);
          try {
            const q = buildPaginatedQuery(isNext, cursor);
            const res = await getDocs(q);
            handleSnapshot(res, isNext);
          } catch (err) {
            handleError(err);
          } finally {
            setLoading(false);
          }
        },
        500
      ),
    [buildPaginatedQuery, handleSnapshot, handleError]
  );

  useEffect(() => {
    const interval = setInterval(() => {
      getCountFromServer(baseQuery)
        .then((res) => setTotalDocs(res.data().count))
        .catch(handleError);
    }, 5000);

    return () => clearInterval(interval);
  }, [baseQuery, handleError]);

  useEffect(() => {
    fetchDocs();
  }, [fetchDocs]);

  const getNext = useCallback(() => {
    if (docs.length === totalDocs) return;
    if (lastDoc) fetchDocs(lastDoc, true);
  }, [lastDoc, fetchDocs, docs, totalDocs]);

  const getPrevious = useCallback(() => {
    if (firstDoc) fetchDocs(firstDoc, false);
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
