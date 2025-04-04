import { act, renderHook } from "@testing-library/react-hooks";
import { getCountFromServer, getDocs } from "firebase/firestore";
import { beforeEach, describe, expect, it, vi } from "vitest";
import usePaginate from "./usePaginate"; // adjust the path as needed

// Mocks
vi.mock("firebase/firestore", async () => {
  return {
    getCountFromServer: vi.fn(),
    getDocs: vi.fn(),
    query: vi.fn((...args) => args),
    limit: vi.fn((val) => `LIMIT(${val})`),
    startAfter: vi.fn((val) => `START_AFTER(${val})`),
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

  it("fetches total count on mount", async () => {
    (getCountFromServer as any).mockResolvedValue({
      data: () => ({ count: 10 }),
    });

    (getDocs as any).mockResolvedValue({
      size: 2,
      docs: generateDocs(2),
    });

    const { result, waitForNextUpdate } = renderHook(() =>
      usePaginate({ query: mockQuery, limit })
    );

    await waitForNextUpdate();

    expect(result.current.totalPages).toBe(5);
    expect(result.current.data.docs.length).toBe(2);
    expect(result.current.data.currentPage).toBe(1);
  });

  it("fetches next page using getNext, which updates lastSnap, docs, docsArray but not currentPage", async () => {
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

    let returnedLastDoc: any;
    await act(async () => {
      returnedLastDoc = await result.current.getNext(firstDocs[1]);
    });

    // Validate lastDoc returned
    expect(returnedLastDoc).toEqual(secondDocs[1]);
    expect(returnedLastDoc?.id).toBe("doc-2-p2");

    // currentPage remains the same
    expect(result.current.data.currentPage).toBe(1);

    // Docs now reflect the second page (latest fetched docs)
    expect(result.current.data.docs[0].id).toBe("doc-1-p2");

    // docsArray should contain both the first and second page
    expect(result.current.data.docsArray.length).toBe(4);
    expect(result.current.data.docsArray.map((d) => d.id)).toEqual([
      "doc-1",
      "doc-2",
      "doc-1-p2",
      "doc-2-p2",
    ]);
  });

  it("returns null from getNext if query fails", async () => {
    const docs = generateDocs(2);
    (getCountFromServer as any).mockResolvedValue({
      data: () => ({ count: 4 }),
    });
    (getDocs as any)
      .mockResolvedValueOnce({ size: 2, docs })
      .mockRejectedValueOnce(new Error("Network error"));

    const { result, waitForNextUpdate } = renderHook(() =>
      usePaginate({ query: mockQuery, limit })
    );

    await waitForNextUpdate();

    let returned: any;
    await act(async () => {
      returned = await result.current.getNext(docs[1]);
    });

    expect(returned).toBe(null);
    expect(result.current.error?.message).toBe("Network error");
  });

  it("can navigate back to a previously loaded page using search", async () => {
    const page1 = generateDocs(2);
    const page2 = generateDocs(2).map((d) => ({ ...d, id: d.id + "-p2" }));

    (getCountFromServer as any).mockResolvedValue({
      data: () => ({ count: 4 }),
    });
    (getDocs as any)
      .mockResolvedValueOnce({ size: 2, docs: page1 })
      .mockResolvedValueOnce({ size: 2, docs: page2 });

    const { result, waitForNextUpdate } = renderHook(() =>
      usePaginate({ query: mockQuery, limit })
    );

    await waitForNextUpdate();

    await act(async () => {
      result.current.search(2);
    });

    expect(result.current.currentPage).toBe(2);
    expect(result.current.data.docs[0].id).toBe("doc-1-p2");

    await act(async () => {
      result.current.search(1);
    });

    expect(result.current.currentPage).toBe(1);
    expect(result.current.data.docs[0].id).toBe("doc-1");
  });

  it("handles errors gracefully", async () => {
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

  it("correctly reflects hasNext and hasPrevious based on currentPage and totalPages", async () => {
    (getCountFromServer as any).mockResolvedValue({
      data: () => ({ count: 4 }),
    });

    const docs = generateDocs(2);
    (getDocs as any).mockResolvedValue({ size: 2, docs });

    const { result, waitForNextUpdate } = renderHook(() =>
      usePaginate({ query: mockQuery, limit })
    );

    await waitForNextUpdate();

    expect(result.current.hasNext).toBe(true);
    expect(result.current.hasPrevious).toBe(false);

    await act(async () => {
      result.current.search(2);
    });

    expect(result.current.hasNext).toBe(false);
    expect(result.current.hasPrevious).toBe(true);
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
});
