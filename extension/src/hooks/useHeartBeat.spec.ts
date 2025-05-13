import {
  HEARTBEAT_INTERVAL,
  HeartBeatContext,
  HeartBeatProvider,
  TIMEOUT,
} from "@cb/context/HeartBeatProvider";
import { updateUserHeartbeat } from "@cb/db";
import { useAppState, useRTC } from "@cb/hooks";
import { getUnixTs } from "@cb/utils/heartbeat";
import { act, renderHook } from "@testing-library/react";
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useHeartBeat } from "./useHeartBeat";

vi.mock("@cb/db", () => ({
  getRoomUserRefs: vi.fn(),
  updateUserHeartbeat: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@cb/utils/heartbeat", () => ({
  getUnixTs: vi.fn().mockReturnValue(1000),
}));

vi.mock("@cb/hooks", () => ({
  useAppState: vi.fn(),
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useOnMount: (fn) => React.useEffect(fn, []),
  useRTC: vi.fn(),
}));

vi.mock("firebase/firestore", () => ({
  onSnapshot: vi.fn((_, callback) => {
    // Simulate initial data
    callback({
      forEach: (fn) => {
        const mockUsers = [
          {
            id: "test-user",
            data: () => ({ lastHeartBeat: { seconds: 950 } }),
          },
          { id: "user1", data: () => ({ lastHeartBeat: { seconds: 950 } }) },
          { id: "user2", data: () => ({ lastHeartBeat: { seconds: 960 } }) },
        ];
        mockUsers.forEach(fn);
      },
    });
    return vi.fn(); // Return unsubscribe function
  }),
}));

const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return React.createElement(HeartBeatProvider, {}, children);
};

describe("useHeartBeat", () => {
  const mockRoomId = "test-room-id";
  const mockUsername = "test-user";
  const mockDeletePeers = vi.fn();

  beforeEach(() => {
    vi.useFakeTimers();

    useAppState.mockReturnValue({
      user: { username: mockUsername },
    });

    useRTC.mockReturnValue({
      roomId: mockRoomId,
      deletePeers: mockDeletePeers,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  it("should initialize with empty roomUsers", () => {
    const { result } = renderHook(() => useHeartBeat(), { wrapper: Wrapper });
    const { current } = result as HeartBeatContext;
    expect(current.roomUsers).toBeDefined();
  });

  it("should update user heartbeat at regular intervals", () => {
    renderHook(() => useHeartBeat(), { wrapper: Wrapper });

    act(() => {
      vi.advanceTimersByTime(HEARTBEAT_INTERVAL);
    });

    expect(updateUserHeartbeat).toHaveBeenCalledTimes(1);
    expect(updateUserHeartbeat).toHaveBeenCalledWith(mockRoomId, mockUsername);

    act(() => {
      vi.advanceTimersByTime(HEARTBEAT_INTERVAL * 3);
    });

    expect(updateUserHeartbeat).toHaveBeenCalledTimes(4);
  });

  it("should remove timed out users and call deletePeers but remain current user", () => {
    const { result } = renderHook(() => useHeartBeat(), { wrapper: Wrapper });

    getUnixTs.mockReturnValue(TIMEOUT * 100 + 1); // timeout condition

    act(() => {
      vi.advanceTimersByTime(15000);
    });

    expect(mockDeletePeers).toHaveBeenCalledWith(["user1", "user2"]);

    const { current } = result as HeartBeatContext;
    expect(current.roomUsers).toEqual({
      [mockUsername]: { lastHeartBeat: { seconds: 950 } },
    });
  });
});
