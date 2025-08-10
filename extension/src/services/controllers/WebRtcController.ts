import {
  EventEmitter,
  Events,
  IamPolite,
  PeerConnection,
  User,
} from "@cb/types";

const WEB_RTC_CONFIG = {
  iceServers: [
    {
      urls: ["stun:stun1.l.google.com:19302", "stun:stun2.l.google.com:19302"],
    },
  ],
  iceCandidatePoolSize: 10,
};

export class WebRtcController {
  private me: User;

  private emitter: EventEmitter;

  private iamPolite: IamPolite;

  private pcs: Map<User, PeerConnection>;

  public constructor(me: User, emitter: EventEmitter, iamPolite: IamPolite) {
    this.me = me;
    this.emitter = emitter;
    this.iamPolite = iamPolite;
    this.pcs = new Map();
    this.init();
  }

  public leave() {
    const users = this.pcs.keys();
    for (const user of users) {
      this.disconnect(user);
    }
  }

  private init() {
    this.emitter.on("room.user.changes", ({ left, joined }) => {
      left.forEach(this.disconnect.bind(this));
      joined.forEach(this.connect.bind(this));
    });
  }

  private disconnect(user: User) {
    const connection = this.pcs.get(user);
    if (connection != undefined) {
      this.pcs.delete(user);
      connection.channel.close();
      connection.pc.close();
    }
  }

  private connect(user: User) {
    if (this.pcs.has(user)) {
      return;
    }

    const pc = new RTCPeerConnection(WEB_RTC_CONFIG);
    // See https://stackoverflow.com/a/43788873
    const channel = pc.createDataChannel(user, { negotiated: true, id: 0 });
    this.pcs.set(user, {
      pc,
      channel,
      makingOffer: false,
      isSettingRemoteAnswerPending: false,
      ignoreOffer: false,
    });

    pc.onicecandidate = (event) =>
      this.emitter.emit("rtc.ice", {
        from: this.me,
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
          from: this.me,
          to: user,
          data: description.toJSON(),
        });
      } catch (err) {
        console.log("Fail to create offer", err);
      } finally {
        connection.makingOffer = false;
      }
    };

    const handleIceEvents = this.handleIceEvents.bind(this);
    const handleDescriptionEvents = this.handleDescriptionEvents.bind(this);

    this.emitter.on("rtc.ice", handleIceEvents);
    this.emitter.on("rtc.description", handleDescriptionEvents);

    channel.onopen = () => {
      this.emitter.off("rtc.ice", handleIceEvents);
      this.emitter.off("rtc.description", handleDescriptionEvents);
    };
  }

  private async handleDescriptionEvents({
    from,
    data,
  }: Events["rtc.description"]) {
    const connection = this.pcs.get(from);

    if (connection == undefined) return;

    // whether im polite or not
    const polite = this.iamPolite(this.me, from);
    const pc = connection.pc;
    // whether im ready to receive offer
    const readyOffer =
      !connection.makingOffer &&
      (pc.signalingState === "stable" ||
        connection.isSettingRemoteAnswerPending);

    // collision when receive offer when not ready
    const offerCollision = data.type === "offer" && !readyOffer;
    connection.ignoreOffer = !polite && offerCollision;
    if (connection.ignoreOffer) return;

    // polite user - rollback local offer
    try {
      if (offerCollision && polite) {
        await pc.setLocalDescription({ type: "rollback" });
      }

      connection.isSettingRemoteAnswerPending = data.type === "answer";
      await pc.setRemoteDescription(data);
      if (data.type === "offer") {
        await pc.setLocalDescription();
        this.emitter.emit("rtc.description", {
          from: this.me,
          to: from,
          data: pc.localDescription!.toJSON(),
        });
      }
    } catch (err) {
      console.log("Error when handling description", from, err);
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
}
