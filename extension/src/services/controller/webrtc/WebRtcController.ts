import { User } from "@cb/services/db/types";
import { NegotiationEvents, PubSub } from "@cb/services/pubsub/types";

type IamPolite = (me: User, other: User) => boolean;

interface PeerConnection {
  pc: RTCPeerConnection;
  channel: RTCDataChannel;
  makingOffer: boolean;
  isSettingRemoteAnswerPending: boolean;
  ignoreOffer: boolean;
}

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

  private signaler: PubSub<NegotiationEvents>;

  private iamPolite: IamPolite;

  private pcs: Map<User, PeerConnection>;

  constructor(
    me: User,
    signaler: PubSub<NegotiationEvents>,
    iamPolite: IamPolite
  ) {
    this.me = me;
    this.signaler = signaler;
    this.iamPolite = iamPolite;
    this.pcs = new Map();
  }

  public connect(user: User) {
    if (this.pcs.has(user)) {
      return;
    }

    const pc = new RTCPeerConnection(WEB_RTC_CONFIG);
    const channel = pc.createDataChannel(user);
    this.pcs.set(user, {
      pc,
      channel,
      makingOffer: false,
      isSettingRemoteAnswerPending: false,
      ignoreOffer: false,
    });

    pc.onicecandidate = (event) => {
      this.signaler.publish("ice", {
        from: this.me,
        to: user,
        data: event.candidate?.toJSON() ?? null,
      });
    };

    // create offer (onnegotiationneeded)
    pc.onnegotiationneeded = async () => {
      const connection = this.pcs.get(user);
      if (!connection || connection?.makingOffer) return;
      try {
        connection.makingOffer = true;

        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        const description = pc.localDescription;
        if (!description) return;

        this.signaler.publish("description", {
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
  }

  public disconnect(user: User) {
    const connection = this.pcs.get(user);
    connection?.channel.close();
    connection?.pc.close();
    this.pcs.delete(user);
  }

  public close() {}

  public async handleDescription({
    from,
    data,
  }: NegotiationEvents["description"]) {
    const conn = this.pcs.get(from);
    if (!conn) return;

    // whether im polite or not
    const polite = this.iamPolite(this.me, from);
    const pc = conn.pc;
    // whether im ready to receive offer
    const readyOffer =
      !conn.makingOffer &&
      (pc.signalingState === "stable" || conn.isSettingRemoteAnswerPending);

    // collision when receive offer when not ready
    const offerCollision = data.type === "offer" && !readyOffer;
    conn.ignoreOffer = !polite && offerCollision;
    if (conn.ignoreOffer) return;

    // polite user - rollback local offer
    try {
      if (offerCollision && polite) {
        await pc.setLocalDescription({ type: "rollback" });
      }

      conn.isSettingRemoteAnswerPending = data.type === "answer";
      await pc.setRemoteDescription(data);
      if (data.type === "offer") {
        await pc.setLocalDescription();
        this.signaler.publish("description", {
          from: this.me,
          to: from,
          data: pc.localDescription!.toJSON(),
        });
      }
    } catch (err) {
      console.log("handle description error", err);
    }
  }
  public async handleCandidate({ from, data }: NegotiationEvents["ice"]) {
    const conn = this.pcs.get(from);
    if (!conn) return;
    try {
      await conn.pc.addIceCandidate(data);
    } catch (err) {
      if (!conn.ignoreOffer) {
        console.error("handle candidate error:", err);
      }
    }
  }
}
