import { act, renderHook } from "@testing-library/react";
import {
  AggregateField,
  AggregateQuerySnapshot,
  DocumentData,
  getCountFromServer,
  getDocs,
  Query,
  QueryDocumentSnapshot,
  QuerySnapshot,
} from "firebase/firestore";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import usePaginate, {
  DEBOUNCE_DELAY_MS,
  REFRESH_INTERVAL_MS,
} from "./usePaginate";

vi.mock("firebase/firestore", () => {
  return {
    getCountFromServer: vi.fn(),
    getDocs: vi.fn(),
    query: vi.fn((...args) => args),
    limit: vi.fn((val) => `LIMIT(${val})`),
    startAfter: vi.fn((val) => `START_AFTER(${val})`),
    endBefore: vi.fn((val) => `END_BEFORE(${val})`),
  };
});

const mockQueryDocumentSnapshot = (id: string): QueryDocumentSnapshot => ({
  id,
  data: () => ({}),
  exists: function (): this is QueryDocumentSnapshot {
    return true;
  },
  metadata: {} as any,
  get: vi.fn(),
  ref: {} as any,
});

const generateDocs = (count: number): QueryDocumentSnapshot[] =>
  Array.from({ length: count }, (_, i) =>
    mockQueryDocumentSnapshot(`doc-${i + 1}`)
  );

const mockQuerySnapshot = (docs: QueryDocumentSnapshot[]) =>
  <QuerySnapshot>{ docs };

const mockAggregateSnapshot = (count: number) =>
  <
    AggregateQuerySnapshot<
      { count: AggregateField<number> },
      DocumentData,
      DocumentData
    >
  >{
    data: () => ({ count }),
  };

describe("usePaginate", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllTimers();
    vi.resetAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const baseQuery = "MOCK_QUERY" as unknown as Query;
  const hookLimit = 2;

  it("fetches documents by default on initialization", async () => {
    vi.mocked(getCountFromServer).mockResolvedValue(mockAggregateSnapshot(2));
    vi.mocked(getDocs).mockResolvedValueOnce(
      mockQuerySnapshot(generateDocs(2))
    );

    const { result } = renderHook(() => usePaginate({ baseQuery, hookLimit }));

    await act(async () => {
      vi.advanceTimersByTime(DEBOUNCE_DELAY_MS);
    });

    expect(result.current.data.docs.length).toBe(2);
    expect(result.current.data.docs.map((d) => d.id)).toEqual([
      "doc-1",
      "doc-2",
    ]);
    expect(result.current.hasNext).toBe(false);
    expect(result.current.loading).toBe(false);
  });

  it("fetches next page using getNext, which updates lastDoc, docs but not firstDoc", async () => {
    vi.mocked(getCountFromServer).mockResolvedValue(mockAggregateSnapshot(4));

    const firstDocs = generateDocs(2);
    const secondDocs = generateDocs(2).map((_, i) =>
      mockQueryDocumentSnapshot(`doc-${i + 1}-p2`)
    );

    vi.mocked(getDocs).mockResolvedValueOnce(mockQuerySnapshot(firstDocs));

    const { result } = renderHook(() => usePaginate({ baseQuery, hookLimit }));
    await act(async () => {
      vi.advanceTimersByTimeAsync(REFRESH_INTERVAL_MS);
      vi.advanceTimersByTime(DEBOUNCE_DELAY_MS);
    });

    expect(result.current.data.docs.length).toBe(2);
    expect(result.current.data.docs.map((d) => d.id)).toEqual([
      "doc-1",
      "doc-2",
    ]);
    expect(result.current.hasNext).toBe(true);

    vi.mocked(getDocs).mockResolvedValueOnce(mockQuerySnapshot(secondDocs));

    await act(async () => {
      result.current.getNext();
      vi.advanceTimersByTime(DEBOUNCE_DELAY_MS);
    });

    expect(result.current.data.docs.length).toBe(4);
    expect(result.current.data.docs.map((d) => d.id)).toEqual([
      "doc-1",
      "doc-2",
      "doc-1-p2",
      "doc-2-p2",
    ]);
    expect(result.current.hasNext).toBe(false);
  });

  it("starts on page 2 and goes back to page 1 using getPrevious", async () => {
    vi.mocked(getCountFromServer).mockResolvedValue(mockAggregateSnapshot(4));

    const firstDocs = generateDocs(2);
    const secondDocs = generateDocs(2).map((_, i) =>
      mockQueryDocumentSnapshot(`doc-${i + 1}-p2`)
    );

    vi.mocked(getDocs).mockResolvedValueOnce(mockQuerySnapshot(secondDocs));

    const { result } = renderHook(() => usePaginate({ baseQuery, hookLimit }));

    await act(async () => {
      await vi.advanceTimersByTimeAsync(DEBOUNCE_DELAY_MS);
    });

    expect(result.current.data.docs.map((d) => d.id)).toEqual([
      "doc-1-p2",
      "doc-2-p2",
    ]);

    vi.mocked(getDocs).mockResolvedValueOnce(mockQuerySnapshot(firstDocs));

    await act(async () => {
      result.current.getPrevious();
      await vi.advanceTimersByTimeAsync(DEBOUNCE_DELAY_MS);
    });
    expect(result.current.data.docs.map((d) => d.id)).toEqual([
      "doc-1",
      "doc-2",
      "doc-1-p2",
      "doc-2-p2",
    ]);
  });

  it("handles empty results correctly", async () => {
    vi.mocked(getCountFromServer).mockResolvedValue(mockAggregateSnapshot(0));
    vi.mocked(getDocs).mockResolvedValueOnce(mockQuerySnapshot([]));

    const { result } = renderHook(() => usePaginate({ baseQuery, hookLimit }));

    await act(async () => {
      await vi.advanceTimersByTimeAsync(DEBOUNCE_DELAY_MS);
    });

    expect(result.current.data.docs).toEqual([]);
    expect(result.current.hasNext).toBe(false);
  });

  it("sets loading state correctly during fetch", async () => {
    vi.mocked(getCountFromServer).mockResolvedValue(mockAggregateSnapshot(2));

    const docs = generateDocs(2);
    let resolveDocs: (val: any) => void;

    vi.mocked(getDocs).mockImplementation(() => {
      return new Promise((resolve) => {
        resolveDocs = resolve;
      });
    });

    const { result } = renderHook(() => usePaginate({ baseQuery, hookLimit }));

    await act(async () => {
      vi.advanceTimersByTime(DEBOUNCE_DELAY_MS);
    });

    expect(result.current.loading).toBe(true);

    await act(async () => {
      resolveDocs!({ size: 2, docs });
    });

    expect(result.current.loading).toBe(false);
  });

  it("handles errors during fetch", async () => {
    const error = new Error("Fetch failed");

    vi.mocked(getCountFromServer).mockResolvedValue(mockAggregateSnapshot(0));
    vi.mocked(getDocs).mockRejectedValue(error);

    const { result } = renderHook(() => usePaginate({ baseQuery, hookLimit }));

    await act(async () => {
      vi.advanceTimersByTime(DEBOUNCE_DELAY_MS);
    });

    expect(result.current.error).toEqual(error);
    expect(result.current.loading).toBe(false);
  });

  it("unsubscribes the previous interval when baseQuery changes", async () => {
    const firstBaseQuery = "MOCK_QUERY_1" as unknown as Query;
    const secondBaseQuery = "MOCK_QUERY_2" as unknown as Query;

    vi.mocked(getCountFromServer).mockResolvedValue(mockAggregateSnapshot(2));

    const { rerender } = renderHook(
      ({ baseQuery }) => usePaginate({ baseQuery, hookLimit: 2 }),
      { initialProps: { baseQuery: firstBaseQuery } }
    );

    await act(async () => {
      vi.advanceTimersByTime(REFRESH_INTERVAL_MS);
    });

    expect(getCountFromServer).toHaveBeenCalledWith(firstBaseQuery);
    vi.mocked(getCountFromServer).mockClear();
    rerender({ baseQuery: secondBaseQuery });

    await act(async () => {
      vi.advanceTimersByTime(REFRESH_INTERVAL_MS);
    });

    expect(getCountFromServer).toHaveBeenCalledWith(secondBaseQuery);
    expect(getCountFromServer).not.toHaveBeenCalledWith(firstBaseQuery);
  });
});
