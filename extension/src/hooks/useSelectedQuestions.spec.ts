import { getAllSessionId } from "@cb/db/";
import { generateId } from "@cb/utils";
import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useSelectedQuestions } from "./useSelectedQuestions";

const mocks = vi.hoisted(() => ({
  getAllSessionId: vi.fn(),
}));

vi.mock("../db/index", () => ({
  getAllSessionId: mocks.getAllSessionId,
}));

describe("useSelectedQuestions", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("it should return selected questions ID in the roomId", async () => {
    const mockQuestionIds = ["two-sum", "add-two-numbers"];
    mocks.getAllSessionId.mockResolvedValueOnce(mockQuestionIds);
    const mockRoomId = generateId(`ROOM_${Date.now()}`);

    const { result } = renderHook(() =>
      useSelectedQuestions({ roomId: mockRoomId })
    );
    await waitFor(() => {
      expect(result.current).toEqual(mockQuestionIds);
    });
    expect(getAllSessionId).toHaveBeenCalledExactlyOnceWith(mockRoomId);
  });

  it("it should return empty array when roomId is null", () => {
    const { result } = renderHook(() => useSelectedQuestions({ roomId: null }));
    expect(result.current).toEqual([]);
    expect(getAllSessionId).not.toHaveBeenCalled();
  });
});
