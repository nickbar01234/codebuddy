import db from "@cb/services/db";
import { DatabaseService, Id, Room, User } from "@cb/services/db/types";
import DefaultPubSub from "@cb/services/pubsub";
import { NegotiationEvents, PubSub } from "@cb/services/pubsub/types";
import { Identifable, Unsubscribe } from "@cb/types/utils";
import { WebRtcController } from "./webrtc/WebRtcController";

export class RoomLifeCycleController {
  private static instance: RoomLifeCycleController | null = null;

  private database: DatabaseService["room"];

  private negotiationsPubSub: PubSub<NegotiationEvents>;

  private webRtcController: WebRtcController;

  private room: Identifable<Room>;

  private me: User;

  private unsubscribers: Unsubscribe[] = [];

  private constructor(
    database: DatabaseService["room"],
    room: Identifable<Room>,
    me: User
  ) {
    this.database = database;
    this.negotiationsPubSub = new DefaultPubSub<NegotiationEvents>();
    this.webRtcController = new WebRtcController(
      me,
      this.negotiationsPubSub,
      (x, y) => x < y
    );
    this.room = room;
    this.me = me;
    this.init();
  }

  public static async create(room: Room, me: User) {
    return db.room
      .create(room)
      .then((id) => this.instantiate({ ...room, id }, me));
  }

  public static async join(id: Id, me: User) {
    const room = await db.room.get(id);
    if (room == undefined) {
      // todo(nickbar01234): More rigorous exception
      throw new Error("Room does not exist");
    }
    return this.instantiate({ ...room, id: id }, me);
  }

  public static get() {
    return this.instance;
  }

  public close() {
    this.unsubscribers.forEach((unsubscribe) => unsubscribe());
    this.webRtcController.close();
  }

  private async init() {
    await this.database.incrementVersion(this.room.id);
    const unsubscribeFromRoom = this.database.observer.room(this.room.id, {
      onChange: (data) => {
        this.handleUserChanges(data);
        this.room = {
          ...this.room,
          ...data,
        };
      },
      onNotFound: () => {},
    });
    const unsubscribeFromNegotiations = this.database.observer.negotiations(
      this.room.id,
      this.room.version,
      {
        onAdded: (data) => {},
        onModified: (data) => {},
        onDeleted: (data) => {},
      }
    );
    this.unsubscribers.push(unsubscribeFromRoom, unsubscribeFromNegotiations);
  }

  private handleUserChanges(data: Room) {
    const joined = data.usernames.filter(
      (username) => !this.room.usernames.includes(username)
    );
    const left = this.room.usernames.filter(
      (username) => !data.usernames.includes(username)
    );
    joined.forEach((user) => this.webRtcController.connect(user));
    left.forEach(this.webRtcController.disconnect);
  }

  private static instantiate(room: Identifable<Room>, me: User) {
    if (this.instance == null) {
      this.instance = new RoomLifeCycleController(db.room, room, me);
    }
    return this.instance;
  }
}
