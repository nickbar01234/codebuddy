import {
  endBefore,
  getCountFromServer,
  getDocs,
  limit,
  query,
  Query,
  QueryDocumentSnapshot,
  QuerySnapshot,
  startAfter,
} from "firebase/firestore";
import { debounce } from "lodash";
import { useCallback, useEffect, useMemo, useState } from "react";

export const REFRESH_INTERVAL_MS = 120000;
export const DEBOUNCE_DELAY_MS = 500;

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
  baseQuery: Query<T>;
  hookLimit: number;
}

const usePaginate = <T>({
  baseQuery,
  hookLimit,
}: HookProps<T>): HookReturnValue<T> => {
  const [docs, setDocs] = useState<QueryDocumentSnapshot<T>[]>([]);
  const [collectionSize, setCollectionSize] = useState(0);
  const [error, setError] = useState<Error>();
  const [loading, setLoading] = useState(false);

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
      return query(
        baseQuery,
        ...(cursorConstraint ? [cursorConstraint] : []),
        limit(hookLimit)
      );
    },
    [baseQuery, hookLimit]
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
          if (loading) return;
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
        DEBOUNCE_DELAY_MS
      ),
    [buildPaginatedQuery, handleSnapshot, loading]
  );

  // const fetchDocs = useCallback(
  //   async (cursor?: QueryDocumentSnapshot<T>, isNext: boolean = true) => {
  //     if (loading) return;
  //     setLoading(true);
  //     try {
  //       const q = buildPaginatedQuery(isNext, cursor);
  //       const res = await getDocs(q);
  //       handleSnapshot(res, isNext);
  //     } catch (err) {
  //       setError(err as Error);
  //     } finally {
  //       setLoading(false);
  //     }
  //   },
  //   [buildPaginatedQuery, handleSnapshot, loading]
  // );

  useEffect(() => {
    setDocs([]);
    setCollectionSize(0);
    setError(undefined);

    // fetchDocs(undefined, true);
    fetchDocs();

    const fetchCount = async () => {
      try {
        console.log("📦 Calling getCountFromServer...");
        const snap = await getCountFromServer(baseQuery);
        const count = snap.data().count;
        setCollectionSize(count);
        console.log("✅ getCountFromServer returned:", count);
      } catch (err) {
        console.error("❌ getCountFromServer failed:", err);
        setError(err as Error);
      }
    };

    fetchCount();

    const interval = setInterval(fetchCount, REFRESH_INTERVAL_MS);

    return () => {
      clearInterval(interval);
      console.log("🔴 Cleared interval for fetching collection size");
    };
  }, [fetchDocs, baseQuery]);

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
      hasNext: collectionSize > 0 && docs.length < collectionSize,
      data: {
        docs,
        collectionSize,
      },
    }),
    [docs, collectionSize, error, getNext, getPrevious, loading]
  );
};

export default usePaginate;
