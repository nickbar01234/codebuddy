import { act, renderHook } from "@testing-library/react";

import { getCountFromServer, getDocs } from "firebase/firestore";
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
    (getCountFromServer as any).mockResolvedValue({
      data: () => ({ count: 2 }),
    });

    const initialDocs = generateDocs(2);

    (getDocs as any).mockResolvedValueOnce({ size: 2, docs: initialDocs });

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
    (getCountFromServer as any).mockResolvedValue({
      data: () => ({ count: 4 }),
    });

    const firstDocs = generateDocs(2);
    const secondDocs = generateDocs(2).map((d) => ({ ...d, id: d.id + "-p2" }));

    (getDocs as any).mockResolvedValueOnce({ size: 2, docs: firstDocs });

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

    (getDocs as any).mockResolvedValueOnce({ size: 2, docs: secondDocs });

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
    (getCountFromServer as any).mockResolvedValue({
      data: () => ({ count: 4 }),
    });

    const firstDocs = generateDocs(2);
    const secondDocs = generateDocs(2).map((d) => ({ ...d, id: d.id + "-p2" }));

    (getDocs as any).mockResolvedValueOnce({ size: 2, docs: secondDocs });

    const { result } = renderHook(() => usePaginate({ baseQuery, hookLimit }));

    await act(async () => {
      await vi.advanceTimersByTimeAsync(DEBOUNCE_DELAY_MS);
    });

    expect(result.current.data.docs.map((d) => d.id)).toEqual([
      "doc-1-p2",
      "doc-2-p2",
    ]);

    (getDocs as any).mockResolvedValueOnce({ size: 2, docs: firstDocs });

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
    (getCountFromServer as any).mockResolvedValue({
      data: () => ({ count: 0 }),
    });

    (getDocs as any).mockResolvedValue({ size: 0, docs: [] });

    const { result } = renderHook(() => usePaginate({ baseQuery, hookLimit }));

    await act(async () => {
      await vi.advanceTimersByTimeAsync(DEBOUNCE_DELAY_MS);
    });

    expect(result.current.data.docs).toEqual([]);
    expect(result.current.hasNext).toBe(false);
  });

  it("sets loading state correctly during fetch", async () => {
    (getCountFromServer as any).mockResolvedValue({
      data: () => ({ count: 2 }),
    });

    const docs = generateDocs(2);
    let resolveDocs: (val: any) => void;

    (getDocs as any).mockImplementation(() => {
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

    (getCountFromServer as any).mockResolvedValue({
      data: () => ({ count: 0 }),
    });

    (getDocs as any).mockRejectedValue(error);

    const { result } = renderHook(() => usePaginate({ baseQuery, hookLimit }));

    await act(async () => {
      vi.advanceTimersByTime(DEBOUNCE_DELAY_MS);
    });

    expect(result.current.error).toEqual(error);
    expect(result.current.loading).toBe(false);
  });
});
