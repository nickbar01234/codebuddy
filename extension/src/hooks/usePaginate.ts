import {
  limit as firestoreLimit,
  query as firestoreQuery,
  getCountFromServer,
  getDocs,
  Query,
  QueryConstraint,
  QueryDocumentSnapshot,
  QuerySnapshot,
  startAfter,
} from "firebase/firestore";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

interface Data<T> {
  currentPage: number;
  docs: QueryDocumentSnapshot<T>[];
  docsArray: QueryDocumentSnapshot<T>[];
}

interface HookReturnValue<T> {
  totalPages: number;
  data: Data<T>;
  error?: Error;
  loading: boolean;
  getNext: (
    lastDoc: QueryDocumentSnapshot<T>
  ) => Promise<QueryDocumentSnapshot<T> | null>;
  hasNext: boolean;
  hasPrevious: boolean;
  search: (pageNumber: number) => void;
  currentPage: number;
}

interface HookProps<T> {
  query: Query<T>;
  limit: number;
}

const addQuery = <T, U>(
  q: Query<T>,
  fun: (val: U) => QueryConstraint,
  value: U
) => (value ? firestoreQuery(q, fun(value)) : q);

const usePaginate = <T>({
  query: baseQuery,
  limit,
}: HookProps<T>): HookReturnValue<T> => {
  const [error, setError] = useState<Error>();
  const [loading, setLoading] = useState<boolean>(false);
  const [docs, setDocs] = useState<QueryDocumentSnapshot<T>[]>([]);
  const [docsArray, setDocsArray] = useState<QueryDocumentSnapshot<T>[][]>([]);
  const [lastSnap, setLastSnap] = useState<QueryDocumentSnapshot<T>>();
  const [query, setQuery] = useState(
    addQuery(baseQuery, firestoreLimit, limit)
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const fetchResolver = useRef<
    ((val: QueryDocumentSnapshot<T> | null) => void) | null
  >(null);

  const onRes = useCallback((res: QuerySnapshot<T>) => {
    let newLastDoc: QueryDocumentSnapshot<T> | null = null;
    if (res.size) {
      newLastDoc = res.docs[res.size - 1];
      setLastSnap(res.docs[res.size - 1]);
      setDocs(res.docs);
      setDocsArray((prevDocsArray) => [...prevDocsArray, res.docs]);
    }
    setLoading(false);

    if (fetchResolver.current) {
      fetchResolver.current(newLastDoc);
      fetchResolver.current = null;
    }
  }, []);

  const onErr = (err: Error) => {
    setError(err);
    setLoading(false);

    if (fetchResolver.current) {
      fetchResolver.current(null);
      fetchResolver.current = null;
    }
  };

  useEffect(() => {
    getCountFromServer(baseQuery).then((res) => {
      setTotalPages(Math.ceil(res.data().count / limit));
    });
  }, [baseQuery, limit]);

  useEffect(() => {
    setLoading(true);
    getDocs(query).then(onRes).catch(onErr);
  }, [query, onRes]);

  const getNext = useCallback(
    async (
      lastDoc: QueryDocumentSnapshot<T>
    ): Promise<QueryDocumentSnapshot<T> | null> => {
      let q = addQuery(baseQuery, startAfter, lastDoc);
      q = addQuery(q, firestoreLimit, limit);

      try {
        return new Promise((resolve) => {
          fetchResolver.current = resolve;
          setQuery(q);
        });
      } catch (err) {
        onErr(err as Error);
        return null;
      }
    },
    [baseQuery, limit]
  );

  const advancePages = useCallback(
    async (
      pagesToAdvance: number,
      lastDoc: QueryDocumentSnapshot<T> | undefined
    ) => {
      for (let i = 0; i < pagesToAdvance; i++) {
        if (lastDoc) {
          const newLastDoc = await getNext(lastDoc);
          if (newLastDoc) {
            lastDoc = newLastDoc;
            setLastSnap(newLastDoc);
            setCurrentPage((prev) => prev + 1);
          }
        }
      }
    },
    [getNext]
  );

  const search = useCallback(
    async (pageNumber: number) => {
      if (docsArray.length < pageNumber) {
        const pagesToAdvance = pageNumber - docsArray.length;
        await advancePages(pagesToAdvance, lastSnap);
      } else {
        setCurrentPage(pageNumber);
        setDocs(docsArray[pageNumber - 1]);
      }
    },
    [docsArray, lastSnap, advancePages]
  );

  const memoizedResult = useMemo(
    () => ({
      error,
      loading,
      getNext,
      hasNext: currentPage < totalPages,
      hasPrevious: currentPage > 1,
      data: {
        docs,
        docsArray: docsArray.flat(),
        currentPage,
      },
      totalPages,
      currentPage,
      search,
    }),
    [docs, totalPages, error, getNext, loading, currentPage, docsArray, search]
  );

  return memoizedResult;
};

export default usePaginate;
