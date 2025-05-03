import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { getAllSessionId } from "@cb/db/index";
import { generateId } from "@cb/utils/dom";
import { useFetchPastQuestions } from "./useFetchPastQuestions";

vi.mock("../db/index", () => ({
  getAllSessionId: vi.fn(),
}));

describe("useFetchPastQuestions", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("it should return past questions ID in the roomId", async () => {
    const mockQuestionIds = ["two-sum", "add-two-numbers"];
    (getAllSessionId as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      mockQuestionIds
    );
    const mockRoomId = generateId(`ROOM_${Date.now()}`);
    const { result } = renderHook(() =>
      useFetchPastQuestions({ roomId: mockRoomId })
    );
    await waitFor(() => {
      expect(result.current).toEqual(mockQuestionIds);
    });
    expect(getAllSessionId).toHaveBeenCalledWith(mockRoomId);
  });

  it("it should return empty array when roomId is null", () => {
    const { result } = renderHook(() =>
      useFetchPastQuestions({ roomId: null })
    );
    expect(result.current).toEqual([]);
    expect(getAllSessionId).not.toHaveBeenCalled();
  });
});
