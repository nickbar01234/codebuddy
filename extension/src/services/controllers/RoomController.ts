import { ROOM } from "@cb/constants";
import { EventEmitter } from "@cb/services/events";
import { AppStore } from "@cb/store";
import {
  DatabaseService,
  Events,
  Id,
  Question,
  QuestionProgress,
  Room,
  User,
} from "@cb/types";
import { Identifiable, Unsubscribe } from "@cb/types/utils";
import { isEventFromMe } from "@cb/utils";

export enum RoomJoinCode {
  SUCCESS,
  NOT_EXISTS,
  MAX_CAPACITY,
}

export enum AddQuestionCode {
  SUCCESS,
  NOT_IN_ROOM,
}

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
      users: {},
    };
    this.me = me;
    this.unsubscribers = [];
    this.init();
  }

  public getRoom() {
    return this.room;
  }

  public async getUserProgress() {
    return this.database.getUserProgress(this.room.id, this.me);
  }

  public async leave() {
    this.unsubscribers.forEach((unsubscribe) => unsubscribe());
    await this.database.removeUser(this.room.id, this.me);
    this.emitter.emit("room.left");
  }

  public async addQuestion(question: Question) {
    this.database.addQuestion(this.room.id, question);
  }

  public async completeQuestion(url: string, progress: QuestionProgress) {
    this.database.setUserProgress(this.room.id, this.me, {
      questions: { [url]: progress },
    });
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
        const joined = Object.keys(room.users).filter(
          (user) =>
            !Object.keys(this.room.users).includes(user) && user !== this.me
        );
        const left = Object.keys(this.room.users).filter(
          (user) => !Object.keys(room.users).includes(user) && user !== this.me
        );
        console.log("Observed participants", joined, left);
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
    const unsubscribeFromIceEvents = this.emitter.on(
      "rtc.ice",
      this.handleIceEvents.bind(this),
      isEventFromMe(this.me)
    );
    const unsubscribeFromDescriptionEvents = this.emitter.on(
      "rtc.description",
      this.handleDescriptionEvents.bind(this),
      isEventFromMe(this.me)
    );

    return () => {
      unsubscribeFromIceEvents();
      unsubscribeFromDescriptionEvents();
    };
  }

  private handleIceEvents({ from, to, data }: Events["rtc.ice"]) {
    this.database.addNegotiation(this.room.id, {
      from,
      to,
      message: { action: "ice", data },
      version: this.room.version,
    });
  }

  private handleDescriptionEvents({
    from,
    to,
    data,
  }: Events["rtc.description"]) {
    this.database.addNegotiation(this.room.id, {
      from,
      to,
      message: { action: "description", data },
      version: this.room.version,
    });
  }
}

type RoomJoinResponse =
  | { code: RoomJoinCode.SUCCESS; data: RoomLifeCycle }
  | { code: Exclude<RoomJoinCode, RoomJoinCode.SUCCESS> };

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

  public async create(room: Pick<Room, "name" | "isPublic" | "questions">) {
    if (this.room != null) {
      return this.room;
    }
    const { username: me } = this.appStore.getState().actions.getAuthUser();
    const doc = await this.database.create(room);
    this.room = new RoomLifeCycle(this.database, this.emitter, doc, me);
    return this.room;
  }

  public async join(id: Id): Promise<RoomJoinResponse> {
    if (this.room != null) {
      return { code: RoomJoinCode.SUCCESS, data: this.room };
    }
    const { username: me } = this.appStore.getState().actions.getAuthUser();
    const room = await this.database.get(id);
    if (room == undefined) {
      return { code: RoomJoinCode.NOT_EXISTS };
    }
    const usernames = Object.keys(room.users);
    if (usernames.length === ROOM.CAPACITY && !usernames.includes(me)) {
      return { code: RoomJoinCode.MAX_CAPACITY };
    }
    this.room = new RoomLifeCycle(
      this.database,
      this.emitter,
      { id, ...room },
      me
    );
    return { code: RoomJoinCode.SUCCESS, data: this.room };
  }

  public async leave() {
    if (this.room != null) {
      await this.room.leave();
      this.room = null;
    }
  }

  public instance() {
    return this.room;
  }
}
