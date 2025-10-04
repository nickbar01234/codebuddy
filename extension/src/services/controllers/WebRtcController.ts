import { EventEmitter } from "@cb/services/events";
import { AppStore } from "@cb/store";
import {
  Events,
  IamPolite,
  PeerConnection,
  PeerMessage,
  PeerRecoveryAckMessage,
  PeerRecoveryRequestMessage,
  RecoveryReason,
  RecoveryState,
  User,
} from "@cb/types";
import { isEventToMe } from "@cb/utils";

export class WebRtcController {
  private appStore: AppStore;

  private emitter: EventEmitter;

  private iamPolite: IamPolite;

  private pcs: Map<User, PeerConnection>;

  private rtcConfiguration: RTCConfiguration;

  public constructor(
    appStore: AppStore,
    emitter: EventEmitter,
    iamPolite: IamPolite,
    rtcConfiguration: RTCConfiguration
  ) {
    this.appStore = appStore;
    this.emitter = emitter;
    this.iamPolite = iamPolite;
    this.pcs = new Map();
    this.rtcConfiguration = rtcConfiguration;
    this.init();
  }

  private init() {
    this.emitter.on("room.changes", ({ left, joined }) => {
      left.forEach(this.disconnect.bind(this));
      joined.forEach(this.connect.bind(this));
    });
    this.emitter.on("room.left", this.leave.bind(this));
    this.emitter.on("rtc.send.message", this.sendMessage.bind(this));
    this.emitter.on(
      "rtc.recovery.request",
      this.handleRecoveryRequestEvent.bind(this)
    );
    this.emitter.on("rtc.recovery.ack", this.handleRecoveryAckEvent.bind(this));
  }

  private leave() {
    const users = this.pcs.keys();
    for (const user of users) {
      this.disconnect(user);
    }
  }

  private disconnect(user: User) {
    const connection = this.pcs.get(user);
    if (connection != undefined) {
      this.pcs.delete(user);
      connection.channel.close();
      connection.pc.close();
    }
  }

  private isErrorRecoverable(error: RTCError): boolean {
    switch (error.errorDetail) {
      case "dtls-failure":
      case "fingerprint-failure":
      case "sdp-syntax-error":
        return false;
      default:
        return true;
    }
  }

  private connect(user: User) {
    console.log("Connecting user", user, this.pcs.has(user));
    if (this.pcs.has(user)) {
      return;
    }

    const { username: me } = this.appStore.getState().actions.getAuthUser();
    const pc = new RTCPeerConnection(this.rtcConfiguration);
    // See https://stackoverflow.com/a/43788873
    const channel = pc.createDataChannel(user, { negotiated: true, id: 0 });
    this.pcs.set(user, {
      pc,
      channel,
      makingOffer: false,
      isSettingRemoteAnswerPending: false,
      ignoreOffer: false,
      recoveryState: RecoveryState.IDLE,
      recoveryRequestId: undefined,
      recoveryTimeout: undefined,
    });

    pc.onicecandidate = (event) =>
      this.emitter.emit("rtc.ice", {
        from: me,
        to: user,
        data: event.candidate?.toJSON() ?? null,
      });

    pc.onnegotiationneeded = async () => {
      const connection = this.pcs.get(user);
      if (!connection || connection?.makingOffer) return;
      try {
        connection.makingOffer = true;
        await pc.setLocalDescription();
        const description = pc.localDescription;
        if (!description) return;

        this.emitter.emit("rtc.description", {
          from: me,
          to: user,
          data: description.toJSON(),
        });
      } catch (err) {
        console.error("Fail to create offer", err);
      } finally {
        connection.makingOffer = false;
      }
    };

    pc.oniceconnectionstatechange = () => {
      if (pc.iceConnectionState === "failed") {
        console.log("Restarting ICE gathering");
        // See https://github.com/w3c/webrtc-pc/issues/2167
        pc.restartIce();
      }
    };

    const unsubscribeFromIceEvents = this.emitter.on(
      "rtc.ice",
      this.handleIceEvents.bind(this),
      isEventToMe(me)
    );
    const unsubscribeFromDescriptionEvents = this.emitter.on(
      "rtc.description",
      this.handleDescriptionEvents.bind(this),
      isEventToMe(me)
    );

    channel.onopen = () => {
      console.log("Channel open", user);
      unsubscribeFromIceEvents();
      unsubscribeFromDescriptionEvents();
      this.emitter.emit("rtc.open", { user });
    };

    channel.onclose = () => {
      console.log("Channel closed", user);
      unsubscribeFromIceEvents();
      unsubscribeFromDescriptionEvents();
    };

    channel.onmessage = (event: MessageEvent) => {
      try {
        const message: PeerMessage = JSON.parse(event.data ?? {});
        this.emitter.emit("rtc.receive.message", { from: user, message });
      } catch (error) {
        console.error("Unable to parse rtc message", error);
      }
    };

    channel.onerror = (errorEvent: RTCErrorEvent) => {
      console.error("Error on RTC data channel", errorEvent);
      const isRecoverable = this.isErrorRecoverable(errorEvent.error);
      const reason = isRecoverable
        ? RecoveryReason.CHANNEL_ERROR
        : RecoveryReason.CONNECTION_TIMEOUT;

      this.initiateRecovery(user, reason, errorEvent.error?.errorDetail);
      this.emitter.emit("rtc.error.connection", { user });
    };
  }

  private async handleDescriptionEvents({
    from,
    data,
  }: Events["rtc.description"]) {
    const connection = this.pcs.get(from);
    if (connection == undefined) return;

    const { username: me } = this.appStore.getState().actions.getAuthUser();

    const polite = this.iamPolite(me, from);
    const pc = connection.pc;
    const readyOffer =
      !connection.makingOffer &&
      (pc.signalingState === "stable" ||
        connection.isSettingRemoteAnswerPending);

    const offerCollision = data.type === "offer" && !readyOffer;
    connection.ignoreOffer = !polite && offerCollision;
    if (connection.ignoreOffer) return;

    try {
      connection.isSettingRemoteAnswerPending = data.type === "answer";
      await pc.setRemoteDescription(data);
      connection.isSettingRemoteAnswerPending = false;
      if (data.type === "offer") {
        await pc.setLocalDescription();
        this.emitter.emit("rtc.description", {
          from: me,
          to: from,
          data: pc.localDescription!.toJSON(),
        });
      }
    } catch (err) {
      console.error("Error when handling description", from, err);
    }
  }

  private async handleIceEvents({ from, data }: Events["rtc.ice"]) {
    const connection = this.pcs.get(from);
    if (connection == undefined) return;

    try {
      await connection.pc.addIceCandidate(data);
    } catch (err) {
      if (!connection.ignoreOffer) {
        console.error("Error when handling ICE candidate", from, err);
      }
    }
  }

  private sendMessage({ to, message }: Events["rtc.send.message"]) {
    this.pcs.forEach((connection, peer) => {
      const send =
        (to == undefined || peer === to) &&
        connection.channel.readyState === "open";
      if (!send) {
        return;
      }
      connection.channel.send(JSON.stringify(message));
    });
  }

  private initiateRecovery(
    user: User,
    reason: RecoveryReason,
    errorDetail?: string
  ) {
    const connection = this.pcs.get(user);
    if (!connection || connection.recoveryState !== RecoveryState.IDLE) {
      return;
    }

    const recoveryId = `recovery-${Date.now()}`;
    connection.recoveryState = RecoveryState.RECOVERY_REQUESTED;
    connection.recoveryRequestId = recoveryId;

    const recoveryRequest: PeerRecoveryRequestMessage = {
      action: "recovery-request",
      timestamp: Date.now(),
      requestId: recoveryId,
      reason,
      errorDetail,
    };

    this.sendRecoverySignal(user, recoveryRequest);

    connection.recoveryTimeout = setTimeout(() => {
      this.handleRecoveryTimeout(user, recoveryId);
    }, 5000);
  }

  private sendRecoverySignal(
    user: User,
    message: PeerRecoveryRequestMessage | PeerRecoveryAckMessage
  ) {
    console.log(`Sending recovery message through signaling server to ${user}`);

    const { username: me } = this.appStore.getState().actions.getAuthUser();

    this.emitter.emit("rtc.recovery", {
      from: me,
      to: user,
      data: message,
    });
  }

  private handleRecoveryRequestEvent({
    from,
    message,
  }: Events["rtc.recovery.request"]) {
    this.handleRecoveryRequest(from, message);
  }

  private handleRecoveryAckEvent({
    from,
    message,
  }: Events["rtc.recovery.ack"]) {
    this.handleRecoveryAck(from, message);
  }

  private handleRecoveryRequest(
    from: User,
    message: PeerRecoveryRequestMessage
  ) {
    const connection = this.pcs.get(from);
    if (!connection) return;

    console.log(`Received recovery request from ${from}:`, message.reason);

    connection.recoveryState = RecoveryState.RECOVERY_ACKNOWLEDGED;

    const ackMessage: PeerRecoveryAckMessage = {
      action: "recovery-ack",
      timestamp: Date.now(),
      requestId: message.requestId,
    };

    this.sendRecoverySignal(from, ackMessage);

    this.emitter.emit("rtc.recovery.initiated", {
      user: from,
      reason: message.reason,
    });
  }

  private handleRecoveryAck(from: User, message: PeerRecoveryAckMessage) {
    const connection = this.pcs.get(from);
    if (!connection || connection.recoveryRequestId !== message.requestId) {
      return;
    }

    console.log(`Received recovery acknowledgment from ${from}`);

    if (connection.recoveryTimeout) {
      clearTimeout(connection.recoveryTimeout);
      connection.recoveryTimeout = undefined;
    }

    connection.recoveryState = RecoveryState.RECOVERY_ACKNOWLEDGED;

    this.reestablishConnection(from);
  }

  private handleRecoveryTimeout(user: User, recoveryId: string) {
    const connection = this.pcs.get(user);
    if (!connection || connection.recoveryRequestId !== recoveryId) {
      return;
    }

    console.warn(
      `Recovery timeout for ${user}, proceeding with unilateral recovery`
    );

    // Reset state and proceed with fallback recovery
    connection.recoveryState = RecoveryState.IDLE;
    connection.recoveryRequestId = undefined;

    this.reestablishConnection(user);
  }

  private reestablishConnection(user: User) {
    console.log(`Starting Phase 2 recovery for ${user}`);

    // Reset recovery state
    const connection = this.pcs.get(user);
    if (connection) {
      connection.recoveryState = RecoveryState.IDLE;
      connection.recoveryRequestId = undefined;
    }

    this.disconnect(user);

    setTimeout(() => {
      console.log(`Reconnecting to ${user} after coordinated disconnection`);
      this.connect(user);
    }, 500);
  }
}
