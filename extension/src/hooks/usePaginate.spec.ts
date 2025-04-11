import { act, renderHook } from "@testing-library/react-hooks";

import { getCountFromServer, getDocs } from "firebase/firestore";
import { beforeEach, describe, expect, it, vi } from "vitest";
import usePaginate from "./usePaginate";

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
  const mockQuery: any = "MOCK_QUERY";
  const limit = 2;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches next page using getNext, which updates lastDoc, docs but not firstDoc", async () => {
    (getCountFromServer as any).mockResolvedValue({
      data: () => ({ count: 4 }),
    });

    const firstDocs = generateDocs(2);
    const secondDocs = generateDocs(2).map((d) => ({ ...d, id: d.id + "-p2" }));

    (getDocs as any).mockResolvedValueOnce({ size: 2, docs: firstDocs });

    const { result, waitForNextUpdate } = renderHook(() =>
      usePaginate({ query: mockQuery, limit })
    );

    await waitForNextUpdate();

    expect(result.current.data.docs.length).toBe(2);
    expect(result.current.data.docs.map((d) => d.id)).toEqual([
      "doc-1",
      "doc-2",
    ]);
    expect(result.current.hasNext).toBe(true);

    (getDocs as any).mockResolvedValueOnce({ size: 2, docs: secondDocs });

    await act(async () => {
      result.current.getNext();
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

  it("fetches previous page using getPrevious", async () => {
    (getCountFromServer as any).mockResolvedValue({
      data: () => ({ count: 4 }),
    });

    const firstDocs = generateDocs(2);
    const secondDocs = generateDocs(2).map((d) => ({ ...d, id: d.id + "-p2" }));

    (getDocs as any)
      .mockResolvedValueOnce({ size: 2, docs: firstDocs })
      .mockResolvedValueOnce({ size: 2, docs: secondDocs });

    const { result, waitForNextUpdate } = renderHook(() =>
      usePaginate({ query: mockQuery, limit })
    );

    await waitForNextUpdate();

    await act(async () => {
      result.current.getNext();
    });

    await act(async () => {
      result.current.getPrevious();
    });

    expect(result.current.data.docs.length).toBe(4);
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

    const { result, waitForNextUpdate } = renderHook(() =>
      usePaginate({ query: mockQuery, limit })
    );

    await waitForNextUpdate();

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

    const { result } = renderHook(() =>
      usePaginate({ query: mockQuery, limit })
    );

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

    const { result, waitForNextUpdate } = renderHook(() =>
      usePaginate({ query: mockQuery, limit })
    );

    await waitForNextUpdate();

    expect(result.current.error).toEqual(error);
    expect(result.current.loading).toBe(false);
  });
});
