import { renderHook, act } from "@testing-library/react-hooks";
import {
  collection,
  query,
  where,
  Firestore,
  Query,
  QueryDocumentSnapshot,
  QuerySnapshot,
  DocumentData,
  getDocs,
  getCountFromServer,
} from "firebase/firestore";
import usePaginate from "./usePaginate";
import { beforeEach, afterEach, describe, expect, test, vi, it } from "vitest";
import * as firestore from "firebase/firestore";
import { waitFor } from "@testing-library/react";

vi.mock("firebase/firestore", () => ({
  getFirestore: vi.fn(),
  collection: vi.fn(),
  doc: vi.fn(),
  getDoc: vi.fn(),
  addDoc: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  onSnapshot: vi.fn(),
  getDocs: vi.fn(), // mockResolvedValue directly here
  getCountFromServer: vi.fn(),
  limit: vi.fn(),
  query: vi.fn(),
  startAfter: vi.fn(),
}));

// const mockGetDocs = firestore.getDocs; //Change to use the imported namespace
// const mockGetCountFromServer = firestore.getCountFromServer;
// const mockLimit = firestore.limit;
// const mockQuery = firestore.query;

const mockPaginatedData = Array.from({ length: 10 }, (_, i) => ({
  id: i + 1,
  name: `Item ${i + 1}`,
}));

describe("usePaginate", () => {
  // const mockQuery = {} as Query<DocumentData>;
  const totalItems = 10;
  const limit = 3;
  const mockQuery: Query<DocumentData> = {
    firestore: {} as Firestore,
    type: "query",
    converter: null,
    withConverter: vi.fn(),
  } as unknown as Query<DocumentData>;

  const mockSnapshot = {
    docs: mockPaginatedData.map((item) => ({
      id: item.id,
      data: vi.fn(() => item),
    })),
    size: mockPaginatedData.length,
    empty: false,
    metadata: {},
    query: mockQuery,
  } as unknown as QuerySnapshot<DocumentData>;

  beforeEach(() => {
    vi.clearAllMocks();

    (getCountFromServer as vi.Mock).mockResolvedValueOnce({
      data: () => ({
        count: totalItems,
      }),
    });

    (getDocs as vi.Mock).mockResolvedValueOnce(mockSnapshot);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should initialize with loading state", async () => {
    const { result, waitForNextUpdate } = renderHook(() =>
      usePaginate({ query: mockQuery, limit })
    );

    expect(result.current.loading).toBe(false);
    await waitForNextUpdate();
    expect(result.current.loading).toBe(true);
    // await waitForNextUpdate();
    // expect(result.current.loading).toBe(false);
  });

  it("should fetch initial documents", async () => {
    const { result, waitForNextUpdate } = renderHook(() =>
      usePaginate({ query: mockQuery, limit })
    );

    await waitForNextUpdate();
    console.log("result", result.current.data);
    expect(result.current.data.docs).toHaveLength(limit);
    expect(result.current.count).toBe(totalItems);
    expect(result.current.totalPages).toBe(Math.ceil(totalItems / limit));
    expect(result.current.data.currentPage).toBe(1);
  });

  // it("should fetch the next page of documents", async () => {
  //   // Setup mock for next page
  //   const mockNextPageSnapshot = {
  //     docs: mockPaginatedData.map((item, i) => ({
  //       id: item.id + 3, // Adjusting for next page data
  //       data: vi.fn(() => item),
  //     })),
  //     size: mockPaginatedData.length,
  //     empty: false,
  //     metadata: {},
  //     query: mockQuery,
  //   } as unknown as QuerySnapshot<DocumentData>;

  //   (getDocs as vi.Mock).mockResolvedValueOnce(mockNextPageSnapshot);

  //   const { result, waitForNextUpdate } = renderHook(() =>
  //     usePaginate({ query: mockQuery, limit })
  //   );

  //   await waitForNextUpdate(); // Wait for initial data to be loaded
  //   console.log("result before get next", result.current.data);
  //   console.log("count before get next", result.current.count);

  //   expect(result.current.data.docs).toHaveLength(limit);
  //   expect(result.current.count).toBe(totalItems);
  //   expect(result.current.totalPages).toBe(Math.ceil(totalItems / limit));

  //   // Call getNext to simulate fetching the next page
  //   act(() => {
  //     result.current.getNext();
  //   });

  //   await waitForNextUpdate(); // Wait for next page to be fetched
  //   console.log("result after get next", result.current.data);
  //   console.log("count after get next", result.current.count);
  //   expect(result.current.data.docs).toHaveLength(limit); // Next page should have same page size
  //   expect(result.current.data.currentPage).toBe(2); // Page number should increase
  // });

  // it('should handle getNext correctly', async () => {
  //   const { result, waitForNextUpdate } = renderHook(() =>
  //     usePaginate({ query: mockQuery, limit: pageSize })
  //   );

  //   await waitForNextUpdate();
  //   act(() => {
  //     result.current.getNext();
  //   });

  //   expect(mockGetDocs).toHaveBeenCalledTimes(2);
  // });

  // it('should handle getPrevious correctly', async () => {
  //   const { result, waitForNextUpdate } = renderHook(() =>
  //     usePaginate({ query: mockQuery, limit: 2 })
  //   );

  //   await waitForNextUpdate();
  //   act(() => {
  //     result.current.getNext();
  //   });

  //   await waitForNextUpdate();
  //   act(() => {
  //     result.current.getPrevious();
  //   });

  //   expect(mockGetDocs).toHaveBeenCalledTimes(3);
  // });

  // it('should handle errors', async () => {
  //   mockGetDocs.mockRejectedValueOnce(new Error('Fetch error'));

  //   const { result, waitForNextUpdate } = renderHook(() =>
  //     usePaginate({ query: mockQuery, limit: 2 })
  //   );

  //   await waitForNextUpdate();
  //   expect(result.current.error).toBeDefined();
  //   expect(result.current.loading).toBe(false);
  // });
});
