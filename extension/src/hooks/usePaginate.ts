import { useState, useEffect, useMemo } from "react";
import {
  query as firestoreQuery,
  limit,
  Query,
  getDocs,
  startAfter,
  onSnapshot,
  DocumentData,
  QuerySnapshot,
  getCountFromServer,
  QueryDocumentSnapshot,
} from "firebase/firestore";

type Data<T> = {
  totalDocs: number;
  totalPages: number;
  currentPage: number;
  docs: QueryDocumentSnapshot<T>[];
};

type HookReturnValue<T> = {
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

const addQuery = <T>(q: Query<T>, fun: (val: any) => any, value: any) =>
  value ? firestoreQuery(q, fun(value)) : q;

const usePaginate = <T>({
  query: mainQuery,
  limit: pageSize,
  from,
}: HookProps<T>): HookReturnValue<T> => {
  const [error, setError] = useState<Error>();
  const [loading, setLoading] = useState<boolean>(false);
  const [docs, setDocs] = useState<QueryDocumentSnapshot<T>[]>([]);
  const [lastSnap, setLastSnap] = useState<QueryDocumentSnapshot<T>[]>([]);
  const [query, setQuery] = useState(addQuery(mainQuery, limit, pageSize));
  const [totals, setTotals] = useState<
    Pick<Data<T>, "totalDocs" | "totalPages">
  >({
    totalDocs: 0,
    totalPages: 0,
  });

  const onRes = (res: QuerySnapshot<T>) => {
    // console.log('onRes called with:', res.docs);
    if (res.docs.length) {
      // setLastSnap((e) => [...e, res.docs[pageSize - 1]]);
      setLastSnap([res.docs[pageSize - 1]]);
      // setDocs((e) => [...e, ...res.docs]);
      setDocs(res.docs);
    }
    setLoading(false);
  };

  const onErr = (err: Error) => {
    // console.error('Error fetching documents:', err);
    setError(err);
    setLoading(false);
  };

  useEffect(() => {
    // console.log('Fetching documents with query:', query);
    setLoading(true);
    getDocs(query).then(onRes).catch(onErr);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  useEffect(() => {
    // console.log('Fetching total document count for query:', mainQuery);
    setLoading(true);
    getCountFromServer(mainQuery).then((res) => {
      setQuery(addQuery(mainQuery, limit, pageSize));
      setTotals({
        totalDocs: res.data().count,
        totalPages: Math.ceil(res.data().count / pageSize),
      });
    });
  }, [mainQuery, pageSize]);

  const getLastEle = (array: any[]) => array[array.length - 1];

  const getNext = () => {
    // if (lastSnap.length < totals.totalPages) {
    //   let q = addQuery(mainQuery, startAfter, getLastEle(lastSnap));
    //   q = addQuery(q, limit, pageSize);
    //   setQuery(q);
    // }
    console.log("getNext clicked. Last Snapshot:", lastSnap);
    if (lastSnap.length && lastSnap[0]) {
      console.log("Fetching next page after:", lastSnap[0].id);
      let q = addQuery(mainQuery, startAfter, lastSnap[0]); // Use only last item
      q = addQuery(q, limit, pageSize);
      setQuery(q);
    } else {
      console.warn("No last snapshot available. Cannot fetch next page.");
    }
  };

  const getPrevious = () => {
    if (lastSnap.length > 1) {
      const newArray = lastSnap.slice(0, -2);
      setLastSnap(newArray);
      let q = addQuery(mainQuery, startAfter, getLastEle(newArray));
      q = addQuery(q, limit, pageSize);
      setQuery(q);
    }
  };

  return useMemo(
    () => ({
      error,
      loading,
      getNext,
      getPrevious,
      hasNext: lastSnap.length < totals.totalPages,
      hasPrevious: lastSnap.length > 1,
      data: {
        docs,
        ...totals,
        currentPage: lastSnap.length,
      },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [docs]
  );
};

export default usePaginate;
