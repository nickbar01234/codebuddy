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

  public static async create(room: Omit<Room, "version" | "usernames">) {
    return db.room.create(room);
  }

  public static async join(id: Id, me: User) {
    const room = await db.room.get(id);
    if (room == undefined) {
      // todo(nickbar01234): More rigorous exception
      throw new Error("Room does not exist");
    }
    this.instantiate({ ...room, usernames: [], id: id }, me);
    return room;
  }

  public static get() {
    return this.instance;
  }

  public async leave() {
    this.unsubscribers.forEach((unsubscribe) => unsubscribe());
    this.webRtcController.close();
    await this.database.removeUser(this.room.id, this.me);
    RoomLifeCycleController.instance = null;
  }

  public id() {
    return this.room.id;
  }

  private async init() {
    await this.database.incrementVersion(this.room.id);
    await db.room.addUser(this.room.id, this.me);
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
        onAdded: ({ from, to, message }) => {
          if (from === this.me) return;
          switch (message.action) {
            case "description": {
              this.negotiationsPubSub.publish("description", {
                from,
                to,
                data: message.data,
              });
              break;
            }
            case "ice": {
              this.negotiationsPubSub.publish("ice", {
                from,
                to,
                data: message.data,
              });
              break;
            }
          }
        },
        onModified: (data) => {},
        onDeleted: (data) => {},
      }
    );
    const [unsubscribeFromIce, unsubscribeFromDescription] =
      this.subscribePubSub();
    this.unsubscribers.push(
      unsubscribeFromRoom,
      unsubscribeFromNegotiations,
      unsubscribeFromIce,
      unsubscribeFromDescription
    );
  }

  private handleUserChanges(data: Room) {
    const joined = data.usernames.filter(
      (username) =>
        !this.room.usernames.includes(username) && username !== this.me
    );
    const left = this.room.usernames.filter(
      (username) => !data.usernames.includes(username)
    );
    left.forEach((user) => this.webRtcController.disconnect(user));
    joined.forEach((user) => this.webRtcController.connect(user));
  }

  private subscribePubSub() {
    const unsubscribeFromIce = this.negotiationsPubSub.subscribe(
      "ice",
      ({ to, data }) => {
        console.log("Sending at version", this.room.version);
        this.database.addNegotiation(this.room.id, {
          from: this.me,
          to,
          message: { action: "ice", data },
          version: this.room.version,
        });
      },
      ({ from }) => from === this.me
    );
    const unsubscribeFromDescription = this.negotiationsPubSub.subscribe(
      "description",
      ({ to, data }) => {
        console.log("Sending at version", this.room.version);
        this.database.addNegotiation(this.room.id, {
          from: this.me,
          to,
          message: { action: "description", data },
          version: this.room.version,
        });
      },
      ({ from }) => from === this.me
    );
    return [unsubscribeFromIce, unsubscribeFromDescription];
  }

  private static instantiate(room: Identifable<Room>, me: User) {
    if (this.instance == null) {
      this.instance = new RoomLifeCycleController(db.room, room, me);
    }
    return this.instance;
  }
}
