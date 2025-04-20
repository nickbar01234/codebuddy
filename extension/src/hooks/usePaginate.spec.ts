import { act, renderHook } from "@testing-library/react";
import {
  AggregateField,
  AggregateQuerySnapshot,
  getCountFromServer,
  getDocs,
  QuerySnapshot,
} from "firebase/firestore";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import usePaginate, {
  DEBOUNCE_DELAY_MS,
  REFRESH_INTERVAL_MS,
} from "./usePaginate";

vi.mock("firebase/firestore", async () => {
  return {
    getCountFromServer: vi.fn(),
    getDocs: vi.fn(),
    query: vi.fn((...args) => args),
    limit: vi.fn((val) => `LIMIT(${val})`),
    startAfter: vi.fn((val) => `START_AFTER(${val})`),
    endBefore: vi.fn((val) => `END_BEFORE(${val})`),
  };
});

const mockDoc = (id: string) => ({ id }) as any;
const generateDocs = (count: number) =>
  Array.from({ length: count }, (_, i) => mockDoc(`doc-${i + 1}`));

describe("usePaginate", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllTimers();
    vi.resetAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const baseQuery: any = "MOCK_QUERY";
  const hookLimit = 2;

  it("fetches documents by default on initialization", async () => {
    // vi.mocked(getCountFromServer).mockResolvedValue({count: 2 } as AggregateQuerySnapshot);
    vi.mocked(getCountFromServer).mockResolvedValue({
      data: () => ({ count: 2 }),
    } as AggregateQuerySnapshot<{ count: AggregateField<number> }>);

    const initialDocs = generateDocs(2);

    vi.mocked(getDocs).mockResolvedValueOnce({
      docs: initialDocs,
    } as QuerySnapshot);

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
    vi.mocked(getCountFromServer).mockResolvedValue({
      data: () => ({ count: 4 }),
    } as AggregateQuerySnapshot<{ count: AggregateField<number> }>);

    const firstDocs = generateDocs(2);
    const secondDocs = generateDocs(2).map((d) => ({ ...d, id: d.id + "-p2" }));

    vi.mocked(getDocs).mockResolvedValueOnce({
      docs: firstDocs,
    } as QuerySnapshot);

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

    vi.mocked(getDocs).mockResolvedValueOnce({
      docs: secondDocs,
    } as QuerySnapshot);

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
    vi.mocked(getCountFromServer).mockResolvedValue({
      data: () => ({ count: 4 }),
    } as AggregateQuerySnapshot<{ count: AggregateField<number> }>);

    const firstDocs = generateDocs(2);
    const secondDocs = generateDocs(2).map((d) => ({ ...d, id: d.id + "-p2" }));

    vi.mocked(getDocs).mockResolvedValueOnce({
      docs: secondDocs,
    } as QuerySnapshot);

    const { result } = renderHook(() => usePaginate({ baseQuery, hookLimit }));

    await act(async () => {
      await vi.advanceTimersByTimeAsync(DEBOUNCE_DELAY_MS);
    });

    expect(result.current.data.docs.map((d) => d.id)).toEqual([
      "doc-1-p2",
      "doc-2-p2",
    ]);

    vi.mocked(getDocs).mockResolvedValueOnce({
      docs: firstDocs,
    } as QuerySnapshot);

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
    vi.mocked(getCountFromServer).mockResolvedValue({
      data: () => ({ count: 0 }),
    } as AggregateQuerySnapshot<{ count: AggregateField<number> }>);

    (getDocs as any).mockResolvedValue({ size: 0, docs: [] });

    const { result } = renderHook(() => usePaginate({ baseQuery, hookLimit }));

    await act(async () => {
      await vi.advanceTimersByTimeAsync(DEBOUNCE_DELAY_MS);
    });

    expect(result.current.data.docs).toEqual([]);
    expect(result.current.hasNext).toBe(false);
  });

  it("sets loading state correctly during fetch", async () => {
    vi.mocked(getCountFromServer).mockResolvedValue({
      data: () => ({ count: 2 }),
    } as AggregateQuerySnapshot<{ count: AggregateField<number> }>);

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

    vi.mocked(getCountFromServer).mockResolvedValue({
      data: () => ({ count: 0 }),
    } as AggregateQuerySnapshot<{ count: AggregateField<number> }>);

    vi.mocked(getDocs).mockRejectedValue(error);

    const { result } = renderHook(() => usePaginate({ baseQuery, hookLimit }));

    await act(async () => {
      vi.advanceTimersByTime(DEBOUNCE_DELAY_MS);
    });

    expect(result.current.error).toEqual(error);
    expect(result.current.loading).toBe(false);
  });
});
