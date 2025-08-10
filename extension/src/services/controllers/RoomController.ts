import {
  DatabaseService,
  EventEmitter,
  Events,
  Id,
  Room,
  User,
} from "@cb/types";
import { Identifable, Unsubscribe } from "@cb/types/utils";

class RoomLifeCycle {
  private database: DatabaseService["room"];

  private emitter: EventEmitter;

  private room: Identifable<Room>;

  private me: User;

  private unsubscribers: Unsubscribe[];

  public constructor(
    database: DatabaseService["room"],
    emitter: EventEmitter,
    room: Identifable<Room>,
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
    await this.database.removeUser(this.room.id, this.me);
    this.unsubscribers.forEach((unsubscribe) => unsubscribe());
  }

  private async init() {
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
          (username) => !room.usernames.includes(username)
        );
        this.emitter.emit("room.user.changes", { room, joined, left });
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
              });
              break;
            }
            case "ice": {
              this.emitter.emit("rtc.ice", {
                from,
                to,
                data: message.data,
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

  private handleIceEvents({ from, to, data }: Events["rtc.ice"]) {
    if (from === this.me) {
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
  }: Events["rtc.description"]) {
    if (from === this.me) {
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

  private me: User;

  public constructor(
    database: DatabaseService["room"],
    emitter: EventEmitter,
    me: User
  ) {
    this.database = database;
    this.emitter = emitter;
    this.me = me;
  }

  public async create(room: Pick<Room, "name" | "isPublic">) {
    if (this.room != null) {
      return this.room;
    }
    const doc = await this.database.create(room);
    this.room = new RoomLifeCycle(this.database, this.emitter, doc, this.me);
    return this.room;
  }

  public async join(id: Id) {
    if (this.room != null) {
      return this.room;
    }
    const room = await this.database.get(id);
    if (room == undefined) {
      throw new Error(`Room with ${id} not found`);
    }
    return new RoomLifeCycle(
      this.database,
      this.emitter,
      { id, ...room },
      this.me
    );
  }

  public async leave() {
    if (this.room != null) {
      await this.room.leave();
      this.room = null;
    }
  }
}
