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
  collectionSize: number;
}

interface HookReturnValue<T> {
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
  const [collectionSize, setCollectionSize] = useState(0);
  const [error, setError] = useState<Error>();
  const [loading, setLoading] = useState<boolean>(false);

  const getFirstDoc = useCallback(() => docs[0], [docs]);
  const getLastDoc = useCallback(() => docs[docs.length - 1], [docs]);

  const buildPaginatedQuery = useCallback(
    (isNext: boolean, cursor?: QueryDocumentSnapshot<T>) => {
      const cursorConstraint =
        cursor != undefined
          ? isNext
            ? startAfter(cursor)
            : endBefore(cursor)
          : undefined;
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
      setDocs((prev) =>
        isNext ? [...prev, ...newDocs] : [...newDocs, ...prev]
      );
    },
    []
  );

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
            setError(err as Error);
          } finally {
            setLoading(false);
          }
        },
        500
      ),
    [buildPaginatedQuery, handleSnapshot]
  );

  useEffect(() => {
    const interval = setInterval(() => {
      getCountFromServer(baseQuery)
        .then((res) => setCollectionSize(res.data().count))
        .catch(setError);
    }, 120000);

    return () => clearInterval(interval);
  }, [baseQuery]);

  useEffect(() => {
    fetchDocs();
  }, [fetchDocs]);

  const getNext = useCallback(() => {
    if (docs.length === collectionSize) return;
    const lastDoc = getLastDoc();
    if (lastDoc) fetchDocs(lastDoc, true);
  }, [getLastDoc, fetchDocs, docs, collectionSize]);

  const getPrevious = useCallback(() => {
    const firstDoc = getFirstDoc();
    if (firstDoc) fetchDocs(firstDoc, false);
  }, [getFirstDoc, fetchDocs]);

  return useMemo(
    () => ({
      error,
      loading,
      getNext,
      getPrevious,
      hasNext: docs.length < collectionSize,
      data: {
        docs,
        collectionSize,
      },
    }),
    [docs, collectionSize, error, getNext, getPrevious, loading]
  );
};

export default usePaginate;
