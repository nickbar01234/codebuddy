import { AppStore } from "@cb/store";
import {
  DatabaseService,
  EventEmitter,
  Events,
  Id,
  Room,
  User,
} from "@cb/types";
import { Identifiable, Unsubscribe } from "@cb/types/utils";

class RoomLifeCycle {
  private database: DatabaseService["room"];

  private emitter: EventEmitter;

  private room: Identifiable<Room>;

  private me: User;

  private unsubscribers: Unsubscribe[];

  public constructor(
    database: DatabaseService["room"],
    emitter: EventEmitter,
    room: Identifiable<Room>,
    me: User
  ) {
    this.database = database;
    this.emitter = emitter;
    this.room = {
      ...room,
      usernames: [],
    };
    this.me = me;
    this.unsubscribers = [];
    this.init();
  }

  public getRoom() {
    return this.room;
  }

  public async leave() {
    this.unsubscribers.forEach((unsubscribe) => unsubscribe());
    await this.database.removeUser(this.room.id, this.me);
    this.emitter.emit("room.left");
  }

  private async init() {
    // todo(nickbar01234): Can we collapse? Quite silly to remove to add. But this is to ensure that
    // other users are notified when I join.
    await this.database.removeUser(this.room.id, this.me);
    await this.database.addUser(this.room.id, this.me);
    this.unsubscribers.push(this.subscribeToRoom());
    this.unsubscribers.push(this.subscribeToNegotiations());
    this.unsubscribers.push(this.subscribeToEventsEmitter());
  }

  private subscribeToRoom() {
    return this.database.observer.room(this.room.id, {
      onChange: (room) => {
        const joined = room.usernames.filter(
          (user) => !this.room.usernames.includes(user) && user !== this.me
        );
        const left = this.room.usernames.filter(
          (user) => !room.usernames.includes(user) && user !== this.me
        );
        this.emitter.emit("room.changes", { room, joined, left });
        this.room = {
          ...this.room,
          ...room,
        };
      },
    });
  }

  private subscribeToNegotiations() {
    return this.database.observer.negotiations(
      this.room.id,
      this.room.version,
      {
        onAdded: ({ from, to, message }) => {
          if (from === this.me) {
            return;
          }
          const { action } = message;
          switch (action) {
            case "description": {
              this.emitter.emit("rtc.description", {
                from,
                to,
                data: message.data,
                source: "firebase",
              });
              break;
            }
            case "ice": {
              this.emitter.emit("rtc.ice", {
                from,
                to,
                data: message.data,
                source: "firebase",
              });
              break;
            }
            default: {
              assertUnreachable(action);
            }
          }
        },
        onModified: () => {},
        onDeleted: () => {},
      }
    );
  }

  private subscribeToEventsEmitter() {
    const iceEvents = this.handleIceEvents.bind(this);
    const descriptionEvents = this.handleDescriptionEvents.bind(this);

    this.emitter.on("rtc.ice", iceEvents);
    this.emitter.on("rtc.description", descriptionEvents);

    return () => {
      this.emitter.off("rtc.ice", iceEvents);
      this.emitter.off("rtc.description", descriptionEvents);
    };
  }

  private handleIceEvents({ from, to, data, source }: Events["rtc.ice"]) {
    // Only forward my local WebRTC events to Firebase (ignore events from Firebase to prevent loops)
    if (from === this.me && source !== "firebase") {
      this.database.addNegotiation(this.room.id, {
        from,
        to,
        message: { action: "ice", data },
        version: this.room.version,
      });
    }
  }

  private handleDescriptionEvents({
    from,
    to,
    data,
    source,
  }: Events["rtc.description"]) {
    // Only forward my local WebRTC events to Firebase (ignore events from Firebase to prevent loops)
    if (from === this.me && source !== "firebase") {
      this.database.addNegotiation(this.room.id, {
        from,
        to,
        message: { action: "description", data },
        version: this.room.version,
      });
    }
  }
}

export class RoomController {
  private database: DatabaseService["room"];

  private emitter: EventEmitter;

  private room: RoomLifeCycle | null = null;

  private appStore: AppStore;

  public constructor(
    database: DatabaseService["room"],
    emitter: EventEmitter,
    appStore: AppStore
  ) {
    this.database = database;
    this.emitter = emitter;
    this.appStore = appStore;
  }

  public async create(room: Pick<Room, "name" | "isPublic">) {
    if (this.room != null) {
      return this.room;
    }
    const { username: me } = this.appStore.getState().actions.getAuthUser();
    const doc = await this.database.create(room);
    this.room = new RoomLifeCycle(this.database, this.emitter, doc, me);
    return this.room;
  }

  public async join(id: Id) {
    if (this.room != null) {
      return this.room;
    }
    const { username: me } = this.appStore.getState().actions.getAuthUser();
    const room = await this.database.get(id);
    if (room == undefined) {
      throw new Error(`Room with ${id} not found`);
    }
    this.room = new RoomLifeCycle(
      this.database,
      this.emitter,
      { id, ...room },
      me
    );
    return this.room;
  }

  public async leave() {
    if (this.room != null) {
      await this.room.leave();
      this.room = null;
    }
  }
}
