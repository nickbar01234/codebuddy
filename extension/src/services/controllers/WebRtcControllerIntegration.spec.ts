import { EventEmitter } from "@cb/services/events";
import { RecoveryReason, RecoveryState } from "@cb/types";
import mitt from "mitt";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { WebRtcController } from "./WebRtcController";

// Mock all dependencies
vi.mock("@cb/utils", () => ({
  isEventToMe: vi.fn(() => () => true),
  isEventFromMe: vi.fn(() => () => true),
  getCodePayload: vi.fn().mockResolvedValue({ action: "code", value: "test" }),
  getTestsPayload: vi.fn().mockReturnValue({ action: "tests", tests: [] }),
  getUrlPayload: vi.fn().mockReturnValue({ action: "url", url: "test" }),
}));

vi.mock("@cb/constants", () => ({
  DOM: {
    CODEBUDDY_EDITOR_ID: "test-editor",
    LEETCODE_TEST_ID: "test-tests",
    LEETCODE_SUBMIT_BUTTON: "test-submit",
    LEETCODE_SUBMISSION_RESULT: "test-result",
  },
}));

vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
  },
}));

// Mock browser APIs
(global as any).browser = {
  runtime: {
    onMessage: {
      addListener: vi.fn(),
    },
  },
};

(global as any).MutationObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  disconnect: vi.fn(),
}));

(global as any).window = {
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  location: { href: "test-url" },
};

// Mock DOM functions
(global as any).waitForElement = vi.fn().mockResolvedValue({
  cloneNode: vi.fn().mockReturnValue({}),
  replaceWith: vi.fn(),
  onclick: null,
});

interface MockRTCError extends Error {
  errorDetail: string;
}

interface MockDataChannel {
  close: ReturnType<typeof vi.fn>;
  send: ReturnType<typeof vi.fn>;
  readyState: string;
  onopen?: (() => void) | null;
  onerror?: ((event: RTCErrorEvent) => void) | null;
  onmessage?: ((event: MessageEvent) => void) | null;
  onclose?: (() => void) | null;
}

interface MockPeerConnection {
  createDataChannel: ReturnType<typeof vi.fn>;
  setLocalDescription: ReturnType<typeof vi.fn>;
  setRemoteDescription: ReturnType<typeof vi.fn>;
  addIceCandidate: ReturnType<typeof vi.fn>;
  restartIce: ReturnType<typeof vi.fn>;
  close: ReturnType<typeof vi.fn>;
  localDescription: { toJSON: () => unknown };
  iceConnectionState: string;
  signalingState: string;
}

describe("WebRTC Recovery Integration Tests", () => {
  let emitter: EventEmitter;
  let webrtcController: WebRtcController;

  let mockDataChannel: MockDataChannel;
  let mockPeerConnection: MockPeerConnection;

  const mockAppStore = {
    getState: vi.fn().mockReturnValue({
      actions: {
        getAuthUser: () => ({ username: "peerA" }),
        toggleEnabledApp: vi.fn(),
      },
      auth: { status: "AUTHENTICATED" },
    }),
  };

  let mockRecoverySignaling: any;

  const mockRoom = {
    usernames: ["peerA", "peerB"],
    version: 1,
    isPublic: false,
    name: "test-room",
    questions: [],
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.useFakeTimers({ shouldAdvanceTime: false });

    // mock WebRTC objects
    mockDataChannel = {
      close: vi.fn(),
      send: vi.fn(),
      readyState: "open",
      onopen: null,
      onerror: null,
      onmessage: null,
      onclose: null,
    };

    mockPeerConnection = {
      createDataChannel: vi.fn().mockReturnValue(mockDataChannel),
      setLocalDescription: vi.fn().mockResolvedValue(undefined),
      setRemoteDescription: vi.fn().mockResolvedValue(undefined),
      addIceCandidate: vi.fn().mockResolvedValue(undefined),
      restartIce: vi.fn(),
      close: vi.fn(),
      localDescription: {
        toJSON: () => ({ type: "offer", sdp: "test" }),
      },
      iceConnectionState: "new",
      signalingState: "stable",
    };

    (global as any).RTCPeerConnection = vi
      .fn()
      .mockImplementation(() => mockPeerConnection);

    const createRTCError = (
      message: string,
      errorDetail: string
    ): MockRTCError => {
      const error = new Error(message) as MockRTCError;
      error.name = "RTCError";
      error.errorDetail = errorDetail;
      return error;
    };
    (global as any).RTCError = createRTCError;

    // Setup components
    const mittEmitter = mitt();
    emitter = {
      on: (type: any, handler: any, filter?: any) => {
        const filterable = (event: any) => {
          const handle = filter == undefined || filter(event);
          if (handle) {
            handler(event);
          }
        };
        mittEmitter.on(type, filterable);
        return () => mittEmitter.off(type, filterable);
      },
      off: mittEmitter.off,
      emit: mittEmitter.emit,
    } as EventEmitter;

    webrtcController = new WebRtcController(
      mockAppStore as unknown as any,
      emitter,
      (x, y) => x < y, // iamPolite function
      { iceServers: [] }
    );

    // Mock Firebase recovery signaling
    mockRecoverySignaling = vi.fn();
    emitter.on("rtc.recovery", mockRecoverySignaling);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("Basic Recovery Flow", () => {
    it("should initiate recovery when channel error occurs", async () => {
      // Setup: Connect a peer
      emitter.emit("room.changes", {
        room: mockRoom,
        left: [],
        joined: ["peerB"],
      });

      // Verify connection was created
      expect(mockPeerConnection.createDataChannel).toHaveBeenCalledWith(
        "peerB",
        {
          negotiated: true,
          id: 0,
        }
      );

      // Simulate channel error
      const recoverableError = {
        errorDetail: "data-channel-failure",
      } as MockRTCError;
      const errorEvent = { error: recoverableError };

      if (mockDataChannel.onerror) {
        mockDataChannel.onerror(errorEvent as RTCErrorEvent);
      }

      // Verify recovery was initiatedaq
      const connection = (webrtcController as unknown as any).pcs.get("peerB");
      expect(connection.recoveryState).toBe(RecoveryState.RECOVERY_REQUESTED);
      expect(connection.recoveryRequestId).toBeDefined();
    });

    it("should send recovery request through Firebase signaling", async () => {
      emitter.emit("room.changes", {
        room: mockRoom,
        left: [],
        joined: ["peerB"],
      });

      // Simulate channel error
      const recoverableError = { errorDetail: "channel-error" } as MockRTCError;
      const errorEvent = { error: recoverableError };

      if (mockDataChannel.onerror) {
        mockDataChannel.onerror(errorEvent as RTCErrorEvent);
      }

      // Verify recovery message was sent through Firebase signaling
      expect(mockRecoverySignaling).toHaveBeenCalledWith(
        expect.objectContaining({
          from: "peerA",
          to: "peerB",
          data: expect.objectContaining({
            action: "recovery-request",
          }),
        })
      );

      // Verify WebRTC channel was NOT used
      expect(mockDataChannel.send).not.toHaveBeenCalledWith(
        expect.stringContaining('"action":"recovery-request"')
      );
    });
  });

  describe("Recovery Message Handling", () => {
    it("should handle recovery request and send acknowledgment", async () => {
      // Setup: Connect a peer
      emitter.emit("room.changes", {
        room: mockRoom,
        left: [],
        joined: ["peerB"],
      });

      // Simulate receiving recovery request through WebRTC
      const recoveryRequest = {
        action: "recovery-request" as const,
        timestamp: Date.now(),
        requestId: "test-recovery-123",
        reason: RecoveryReason.CHANNEL_ERROR,
      };

      // Simulate recovery request received through proper event
      emitter.emit("rtc.recovery.request", {
        from: "peerB",
        message: recoveryRequest,
      });

      // Verify acknowledgment was sent through Firebase signaling
      expect(mockRecoverySignaling).toHaveBeenCalledWith(
        expect.objectContaining({
          from: "peerA",
          to: "peerB",
          data: expect.objectContaining({
            action: "recovery-ack",
          }),
        })
      );

      // Verify connection state updated
      const connection = (webrtcController as unknown as any).pcs.get("peerB");
      expect(connection.recoveryState).toBe(
        RecoveryState.RECOVERY_ACKNOWLEDGED
      );
    });

    it("should handle recovery acknowledgment and reestablish connection", async () => {
      // Setup: Connect a peer and initiate recovery
      emitter.emit("room.changes", {
        room: mockRoom,
        left: [],
        joined: ["peerB"],
      });

      const recoverableError = { errorDetail: "channel-error" } as MockRTCError;
      const errorEvent = { error: recoverableError };

      if (mockDataChannel.onerror) {
        mockDataChannel.onerror(errorEvent as RTCErrorEvent);
      }

      const connection = (webrtcController as unknown as any).pcs.get("peerB");
      const recoveryId = connection.recoveryRequestId;

      // Simulate receiving recovery acknowledgment
      const recoveryAck = {
        action: "recovery-ack" as const,
        timestamp: Date.now(),
        requestId: recoveryId,
      };

      emitter.emit("rtc.recovery.ack", {
        from: "peerB",
        message: recoveryAck,
      });

      // Verify state was reset to idle (Phase 2 completed)
      expect(connection.recoveryState).toBe(RecoveryState.IDLE);

      // Verify timeout was cleared
      expect(connection.recoveryTimeout).toBeUndefined();
    });
  });

  describe("Recovery Timeout Handling", () => {
    it("should timeout and fallback to unilateral recovery", async () => {
      // Use real timers for timeout testing
      vi.useRealTimers();
      vi.useFakeTimers();

      // Setup: Connect a peer
      emitter.emit("room.changes", {
        room: mockRoom,
        left: [],
        joined: ["peerB"],
      });

      // Spy on reestablishConnection method
      const reestablishConnectionSpy = vi.spyOn(
        webrtcController as any,
        "reestablishConnection"
      );

      // Simulate channel error (this starts the timeout)
      const recoverableError = { errorDetail: "channel-error" } as MockRTCError;
      const errorEvent = { error: recoverableError };

      if (mockDataChannel.onerror) {
        mockDataChannel.onerror(errorEvent as RTCErrorEvent);
      }

      // Verify recovery was initiated
      const connection = (webrtcController as unknown as any).pcs.get("peerB");
      expect(connection.recoveryState).toBe(RecoveryState.RECOVERY_REQUESTED);

      // Fast-forward past timeout (5 seconds)
      vi.advanceTimersByTime(5100);

      // Verify timeout triggered fallback recovery
      expect(connection.recoveryState).toBe(RecoveryState.IDLE);
      expect(reestablishConnectionSpy).toHaveBeenCalledWith("peerB");
    });
  });

  describe("Error Recovery Event Flow", () => {
    it("should emit recovery.initiated event when recovery starts", async () => {
      const emitSpy = vi.spyOn(emitter, "emit");

      // Setup: Connect a peer
      emitter.emit("room.changes", {
        room: mockRoom,
        left: [],
        joined: ["peerB"],
      });

      // Simulate recovery request received
      const recoveryRequest = {
        action: "recovery-request" as const,
        timestamp: Date.now(),
        requestId: "event-test-123",
        reason: RecoveryReason.CHANNEL_ERROR,
      };

      emitter.emit("rtc.recovery.request", {
        from: "peerB",
        message: recoveryRequest,
      });

      // Verify recovery.initiated event was emitted
      expect(emitSpy).toHaveBeenCalledWith("rtc.recovery.initiated", {
        user: "peerB",
        reason: "channel-error",
      });
    });

    it("should emit error.connection event when recovery is triggered", async () => {
      const emitSpy = vi.spyOn(emitter, "emit");

      // Connect a peer
      emitter.emit("room.changes", {
        room: mockRoom,
        left: [],
        joined: ["peerB"],
      });

      // Simulate channel error
      const recoverableError = { errorDetail: "channel-error" } as MockRTCError;
      const errorEvent = { error: recoverableError };

      if (mockDataChannel.onerror) {
        mockDataChannel.onerror(errorEvent as RTCErrorEvent);
      }

      expect(emitSpy).toHaveBeenCalledWith("rtc.error.connection", {
        user: "peerB",
      });
    });
  });
});
