import { WEBRTC_RETRY } from "@cb/constants";
import { EventEmitter } from "@cb/services/events";
import { AppStore } from "@cb/store";
import {
  Events,
  IamPolite,
  PeerConnection,
  PeerMessage,
  RestartState,
  User,
} from "@cb/types";
import { isEventToMe } from "@cb/utils";
import { Timestamp } from "firebase/firestore";

export class WebRtcController {
  private appStore: AppStore;

  private emitter: EventEmitter;

  private iamPolite: IamPolite;

  private pcs: Map<User, PeerConnection>;

  private rtcConfiguration: RTCConfiguration;

  private retryCounts: Map<User, number>;

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
    this.retryCounts = new Map();
    this.rtcConfiguration = rtcConfiguration;
    this.init();
  }

  private init() {
    this.emitter.on("room.changes", ({ room: { users }, left }) => {
      left.forEach(this.disconnect.bind(this));
      Object.entries(users).forEach(([user, metadata]) => {
        if (user !== this.appStore.getState().actions.getAuthUser().username) {
          this.connect(user, metadata.joinedAt);
        }
      });
    });
    this.emitter.on("room.left", this.leave.bind(this));
    this.emitter.on("rtc.send.message", this.sendMessage.bind(this));
    this.emitter.on(
      "rtc.renegotiation.request",
      this.handleRenegotiationRequest.bind(this)
    );
    this.emitter.on(
      "rtc.renegotiation.start",
      this.handleRenegotiationStart.bind(this)
    );
  }

  private leave() {
    const users = this.pcs.keys();
    for (const user of users) {
      this.disconnect(user);
    }
    this.retryCounts.clear();
  }

  private disconnect(user: User) {
    const connection = this.pcs.get(user);
    if (connection != undefined) {
      this.pcs.delete(user);
      connection.channel.close();
      connection.pc.close();
    }
  }

  private connect(user: User, joinedAt: Timestamp) {
    const maybeJoinedAt = this.pcs.get(user)?.joinedAt;
    console.log(
      `Connecting user ${user}@${joinedAt}. Last attempted ${maybeJoinedAt}`
    );
    if (maybeJoinedAt && maybeJoinedAt > joinedAt) {
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
      joinedAt,
      restartState: RestartState.IDLE,
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
      const cur = this.pcs.get(user);
      if (cur) cur.restartState = RestartState.IDLE;
      this.retryCounts.delete(user);
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
      if (
        errorEvent.error.errorDetail === "sctp-failure" &&
        errorEvent.error.sctpCauseCode === 12 // https://datatracker.ietf.org/doc/html/rfc4960#section-3.3.10
      ) {
        this.disconnect(user);
        this.emitter.emit("rtc.user.disconnected", { user });
        return;
      }
      console.error("Error on RTC data channel", errorEvent);

      const connection = this.pcs.get(user);
      if (!connection) return;

      if (connection.restartState === RestartState.RESTARTING) return;

      const currentRetry = this.retryCounts.get(user) ?? 0;
      if (currentRetry >= WEBRTC_RETRY.MAX_ATTEMPTS) {
        this.disconnect(user);
        this.retryCounts.delete(user);
        this.emitter.emit("rtc.user.disconnected", { user });
        return;
      }

      this.disconnect(user);
      this.connect(user, connection.joinedAt);
      const updated = this.pcs.get(user);
      if (updated) updated.restartState = RestartState.RESTARTING;

      this.retryCounts.set(user, currentRetry + 1);
      this.emitter.emit("rtc.renegotiation.request", {
        from: me,
        to: user,
        data: undefined,
      });
    };
  }

  private async handleDescriptionEvents({
    from,
    data,
    joinedAt,
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
      if (joinedAt) {
        connection.joinedAt = joinedAt;
      }
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

  private handleRenegotiationRequest({
    from,
    joinedAt,
  }: Events["rtc.renegotiation.request"]) {
    console.log("Renegotiation request received from", from);
    const connection = this.pcs.get(from);
    const { username: me } = this.appStore.getState().actions.getAuthUser();
    if (connection?.restartState === RestartState.RESTARTING) return;
    if (connection) {
      this.disconnect(from);
    }
    const effectiveJoinedAt =
      joinedAt ?? connection?.joinedAt ?? Timestamp.now();
    this.connect(from, effectiveJoinedAt);
    const updated = this.pcs.get(from);
    if (updated) {
      updated.restartState = RestartState.RESTARTING;
    }

    this.emitter.emit("rtc.renegotiation.start", {
      from: me,
      to: from,
      data: undefined,
    });
  }

  private handleRenegotiationStart({
    from,
    joinedAt,
  }: Events["rtc.renegotiation.start"]) {
    console.log("Renegotiation start received from", from);
    const connection = this.pcs.get(from);
    if (connection?.restartState === RestartState.RESTARTING) return;
    if (connection) this.disconnect(from);
    const effectiveJoinedAt =
      joinedAt ?? connection?.joinedAt ?? Timestamp.now();
    this.connect(from, effectiveJoinedAt);
    const updated = this.pcs.get(from);
    if (updated) {
      updated.restartState = RestartState.RESTARTING;
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
}
