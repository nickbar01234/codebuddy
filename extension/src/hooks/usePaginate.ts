import { useState, useEffect, useMemo } from "react";
import {
  query as firestoreQuery,
  Query,
  getDocs,
  startAfter,
  QuerySnapshot,
  getCountFromServer,
  QueryDocumentSnapshot,
  limit as firestoreLimit,
  QueryConstraint,
} from "firebase/firestore";

type Data<T> = {
  currentPage: number;
  docs: QueryDocumentSnapshot<T>[];
};

type HookReturnValue<T> = {
  count: number;
  totalPages: number;
  data: Data<T>;
  error?: Error;
  loading: boolean;
  getNext: () => void;
  getPrevious: () => void;
  hasNext: boolean;
  hasPrevious: boolean;
};

type HookProps<T> = {
  query: Query<T>;
  limit: number;
  from?: QueryDocumentSnapshot<T>;
};

const addQuery = <T>(q: Query<T>, fun: (val: any) => QueryConstraint, value: any) =>
  value ? firestoreQuery(q, fun(value)) : q;

const usePaginate = <T>({
  query: baseQuery,
  limit,
  // from,
}: HookProps<T>): HookReturnValue<T> => {
  const [error, setError] = useState<Error>();
  const [loading, setLoading] = useState<boolean>(false);
  const [docs, setDocs] = useState<QueryDocumentSnapshot<T>[]>([]);
  const [lastSnap, setLastSnap] = useState<QueryDocumentSnapshot<T>[]>([]);
  const [query, setQuery] = useState(
    addQuery(baseQuery, firestoreLimit, limit)
  );
  const [count, setCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const onRes = (res: QuerySnapshot<T>) => {
    if (res.size) {
      setLastSnap((e) => [...e, res.docs[res.size - 1]]);
      setDocs(res.docs);
    }
    setLoading(false);
  };

  const onErr = (err: Error) => {
    setError(err);
    setLoading(false);
  };

  useEffect(() => {
    setLoading(true);
    getCountFromServer(baseQuery).then((res) => {
      setTotalPages(Math.ceil(res.data().count / limit));
      setCount(res.data().count);
    });
  }, [baseQuery, limit]);

  useEffect(() => {
    setLoading(true);
    getDocs(query).then(onRes).catch(onErr);
  }, [query]);

  const getLastEle = (array: any[]) => array[array.length - 1];

  const getNext = () => {
    console.log("getNext clicked. Last Snapshot:", lastSnap);
    if (lastSnap.length) {
      let q = addQuery(baseQuery, startAfter, lastSnap[lastSnap.length - 1]); // Use only last item
      q = addQuery(q, firestoreLimit, limit);
      setQuery(q);
    } else {
      console.warn("No last snapshot available. Cannot fetch next page.");
    }
  };

  const getPrevious = () => {
    if (lastSnap.length > 1) {
      const newArray = lastSnap.slice(0, -2);
      setLastSnap(newArray);
      let q = addQuery(baseQuery, startAfter, getLastEle(newArray));
      q = addQuery(q, firestoreLimit, limit);
      setQuery(q);
    }
  };

  const memoizedResult = useMemo(
    () => ({
      error,
      loading,
      getNext,
      getPrevious,
      hasNext: lastSnap.length < totalPages,
      hasPrevious: lastSnap.length > 1,
      data: {
        docs,
        currentPage: lastSnap.length,
      },
      totalPages,
      count,
    }),
    [docs, lastSnap, totalPages, error, count] // query causes re-rendering
  );

  return memoizedResult;
};

export default usePaginate;
