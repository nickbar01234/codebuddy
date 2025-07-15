import { User } from "@cb/services/db/types";
import { NegotiationEvents, PubSub } from "@cb/services/pubsub/types";

type IamPolite = (me: User, other: User) => boolean;

interface PeerConnection {
  pc: RTCPeerConnection;
  channel: RTCDataChannel;
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
    this.pcs.set(user, { pc, channel });

    pc.onicecandidate = (event) => {
      this.signaler.publish("ice", {
        from: this.me,
        to: user,
        data: event.candidate?.toJSON() ?? null,
      });
    };
  }

  public disconnect(user: User) {
    const connection = this.pcs.get(user);
    connection?.channel.close();
    connection?.pc.close();
    this.pcs.delete(user);
  }

  public close() {}
}
