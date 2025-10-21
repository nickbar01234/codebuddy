import { Identifiable } from "@cb/types";
import {
  getCountFromServer,
  getDocs,
  limit,
  Query,
  QueryDocumentSnapshot,
  startAfter,
} from "firebase/firestore";
import { debounce } from "lodash";
import React from "react";

export const REFRESH_INTERVAL_MS = 120000;
export const DEBOUNCE_DELAY_MS = 500;

type Document<T> = Array<Identifiable<T>>;

interface Data<T> {
  docs: Document<T>;
  collectionSize: number;
}

interface HookReturnValue<T> {
  data: Data<T>;
  error?: Error;
  loading: boolean;
  getNext: () => void;
  hasNext: boolean;
}

interface HookProps<T> {
  baseQuery: Query<T>;
  hookLimit: number;
}

/**
 * Adapted from {@link https://github.com/Chirag7096/react-firebase-pagination/tree/main}
 *
 * todo(nickbar01234): Consolidate into database interface
 */
const usePaginate = <T>({
  baseQuery,
  hookLimit,
}: HookProps<T>): HookReturnValue<T> => {
  const [error, setError] = React.useState<Error>();
  const [loading, setLoading] = React.useState<boolean>(false);
  const [docs, setDocs] = React.useState<Data<T>["docs"]>([]);
  const [query, setQuery] = React.useState(
    decorateQuery(baseQuery, limit, hookLimit)
  );
  const [collectionSize, setCollectionSize] = React.useState(0);

  const lastSnap = React.useRef<QueryDocumentSnapshot<T> | undefined>(
    undefined
  );

  const fetchDocs = React.useMemo(
    () =>
      debounce(() => {
        return getDocs(query)
          .then((response) => {
            const data = response.docs.filter((doc) => doc.exists());
            lastSnap.current =
              data.length === 0 ? undefined : data[data.length - 1];
            setDocs((prev) => [
              ...prev,
              ...data.map((data) => ({ id: data.id, ...data.data() })),
            ]);
          })
          .catch((error) => {
            console.error(error);
            setError(error);
          })
          .finally(() => setLoading(false));
      }, 500),
    [query]
  );

  React.useEffect(() => {
    setLoading(true);
    fetchDocs();
  }, [fetchDocs]);

  React.useEffect(() => {
    // Note this doesn't work since we don't order resources
    const refresh = setInterval(() => {
      getCountFromServer(baseQuery).then((res) => {
        setCollectionSize(res.data().count);
      });
    }, REFRESH_INTERVAL_MS);
    return () => clearInterval(refresh);
  }, [baseQuery, hookLimit]);

  const getNext = React.useMemo(
    () =>
      debounce(() => {
        if (lastSnap.current) {
          let q = decorateQuery(baseQuery, startAfter, lastSnap.current);
          q = decorateQuery(q, limit, hookLimit);
          setQuery(q);
        }
      }, 1000),
    [baseQuery, hookLimit]
  );

  return React.useMemo(
    () => ({
      error,
      loading,
      getNext,
      hasNext: docs.length < collectionSize,
      data: {
        docs,
        collectionSize,
      },
    }),
    [docs, collectionSize, error, getNext, loading]
  );
};

export default usePaginate;
