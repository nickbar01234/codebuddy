import { beforeEach, describe, expect, it, vi } from "vitest";
import { WebRtcController } from "./WebRtcController";

vi.mock("@cb/utils", () => ({
  isEventToMe: vi.fn(() => () => true),
}));

interface MockRTCError extends Error {
  errorDetail: string;
}

interface MockEmitter {
  on: ReturnType<typeof vi.fn>;
  emit: ReturnType<typeof vi.fn>;
}

interface MockAppStore {
  getState: ReturnType<typeof vi.fn>;
}

interface MockDataChannel {
  close: ReturnType<typeof vi.fn>;
  send: ReturnType<typeof vi.fn>;
  readyState: string;
  onopen?: (() => void) | null;
  onerror?: ((event: RTCErrorEvent) => void) | null;
  onmessage?: ((event: MessageEvent) => void) | null;
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
  generateCertificate: ReturnType<typeof vi.fn>;
}

describe("WebRtcController", () => {
  let controller: WebRtcController;

  const mockEmitter: MockEmitter = {
    on: vi.fn().mockReturnValue(() => {}),
    emit: vi.fn(),
  };

  const mockAppStore: MockAppStore = {
    getState: vi.fn().mockReturnValue({
      actions: {
        getAuthUser: () => ({ username: "testUser" }),
      },
    }),
  };

  const mockIamPolite = vi.fn().mockReturnValue(true);
  const mockRtcConfiguration = { iceServers: [] };

  beforeEach(async () => {
    vi.clearAllMocks();

    (global as any).setTimeout = vi
      .fn()
      .mockImplementation((callback: () => void, delay: number) => {
        callback();
        return 1;
      });

    const mockDataChannel: MockDataChannel = {
      close: vi.fn(),
      send: vi.fn(),
      readyState: "open",
      onopen: null,
      onerror: null,
      onmessage: null,
    };

    const mockPeerConnection: MockPeerConnection = {
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
      generateCertificate: vi.fn(),
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

    controller = new WebRtcController(
      mockAppStore as any,
      mockEmitter as any,
      mockIamPolite,
      mockRtcConfiguration
    );
  });

  describe("Initialization", () => {
    it("should create instance successfully", () => {
      expect(controller).toBeDefined();
      expect(mockEmitter.on).toHaveBeenCalledTimes(5); // 5 event listeners in constructor
    });

    it("should set up required event listeners", () => {
      expect(mockEmitter.on).toHaveBeenCalledWith(
        "room.changes",
        expect.any(Function)
      );
      expect(mockEmitter.on).toHaveBeenCalledWith(
        "room.left",
        expect.any(Function)
      );
      expect(mockEmitter.on).toHaveBeenCalledWith(
        "rtc.send.message",
        expect.any(Function)
      );
      expect(mockEmitter.on).toHaveBeenCalledWith(
        "rtc.recovery.request",
        expect.any(Function)
      );
      expect(mockEmitter.on).toHaveBeenCalledWith(
        "rtc.recovery.ack",
        expect.any(Function)
      );
    });
  });

  describe("Connection Management", () => {
    it("should handle room changes without throwing", () => {
      const roomChangesHandler = mockEmitter.on.mock.calls.find(
        (call) => call[0] === "room.changes"
      )?.[1];

      expect(roomChangesHandler).toBeDefined();

      if (roomChangesHandler) {
        expect(() => {
          roomChangesHandler({ left: [], joined: ["user1"] });
        }).not.toThrow();
      }
    });

    it("should handle room left event without throwing", () => {
      const roomLeftHandler = mockEmitter.on.mock.calls.find(
        (call) => call[0] === "room.left"
      )?.[1];

      expect(roomLeftHandler).toBeDefined();

      if (roomLeftHandler) {
        expect(() => {
          roomLeftHandler();
        }).not.toThrow();
      }
    });
  });

  describe("Error Handling Flow", () => {
    it("should identify recoverable vs non-recoverable errors correctly", () => {
      const recoverableError = {
        errorDetail: "data-channel-failure",
      } as MockRTCError;
      const nonRecoverableError = {
        errorDetail: "dtls-failure",
      } as MockRTCError;

      expect((controller as any).isErrorRecoverable(recoverableError)).toBe(
        true
      );
      expect((controller as any).isErrorRecoverable(nonRecoverableError)).toBe(
        false
      );
    });

    it("should have methods available for error recovery", () => {
      expect(typeof (controller as any).reestablishConnection).toBe("function");
      expect(typeof (controller as any).initiateRecovery).toBe("function");
      expect(typeof (controller as any).isErrorRecoverable).toBe("function");
    });
  });

  describe("Real Error Recovery Simulation", () => {
    let mockDataChannel: any;
    let reestablishConnectionSpy: any;
    let initiateRecoverySpy: any;

    beforeEach(() => {
      // Set up spies
      reestablishConnectionSpy = vi.spyOn(
        controller as any,
        "reestablishConnection"
      );
      initiateRecoverySpy = vi.spyOn(controller as any, "initiateRecovery");

      const roomChangesHandler = mockEmitter.on.mock.calls.find(
        (call) => call[0] === "room.changes"
      )?.[1];

      if (roomChangesHandler) {
        roomChangesHandler({ left: [], joined: ["testUser"] });
      }

      // Get the mock data channel that was created
      mockDataChannel = (global as any).RTCPeerConnection.mock.results[0].value
        .createDataChannel.mock.results[0].value;
    });

    it("should trigger recovery for recoverable errors", () => {
      vi.useFakeTimers();

      const recoverableError = {
        errorDetail: "data-channel-failure",
      } as MockRTCError;
      const errorEvent = { error: recoverableError };

      if (mockDataChannel.onerror) {
        mockDataChannel.onerror(errorEvent);
      }

      expect(initiateRecoverySpy).toHaveBeenCalledWith(
        "testUser",
        expect.any(String),
        "data-channel-failure"
      );
      expect(mockEmitter.emit).toHaveBeenCalledWith("rtc.error.connection", {
        user: "testUser",
      });

      vi.useRealTimers();
    });

    it("should trigger recovery for non-recoverable errors", () => {
      const nonRecoverableError = {
        errorDetail: "dtls-failure",
      } as MockRTCError;
      const errorEvent = { error: nonRecoverableError };

      if (mockDataChannel.onerror) {
        mockDataChannel.onerror(errorEvent);
      }

      expect(initiateRecoverySpy).toHaveBeenCalledWith(
        "testUser",
        expect.any(String),
        "dtls-failure"
      );
      expect(mockEmitter.emit).toHaveBeenCalledWith("rtc.error.connection", {
        user: "testUser",
      });
    });

    it("should initiate recovery process for errors", async () => {
      vi.useFakeTimers();

      const error = { errorDetail: "dtls-failure" } as MockRTCError;
      const errorEvent = { error };

      if (mockDataChannel.onerror) {
        mockDataChannel.onerror(errorEvent);
      }

      expect(initiateRecoverySpy).toHaveBeenCalledWith(
        "testUser",
        expect.any(String),
        "dtls-failure"
      );
      expect(mockEmitter.emit).toHaveBeenCalledWith("rtc.error.connection", {
        user: "testUser",
      });

      vi.useRealTimers();
    });

    it("should initiate recovery for any error", () => {
      const recoverableError = {
        errorDetail: "data-channel-failure",
      } as MockRTCError;
      const errorEvent = { error: recoverableError };

      if (mockDataChannel.onerror) {
        mockDataChannel.onerror(errorEvent);
      }

      // Verify recovery was initiated
      expect(initiateRecoverySpy).toHaveBeenCalledWith(
        "testUser",
        expect.any(String),
        "data-channel-failure"
      );
      expect(mockEmitter.emit).toHaveBeenCalledWith("rtc.error.connection", {
        user: "testUser",
      });
    });
  });
});
