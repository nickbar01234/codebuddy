import db, {
  Connection,
  DatabaseObserver,
  Model,
  ObserverCollectionCallback,
  ObserverDocumentCallback,
  Room,
  Unsubscribe,
} from "@cb/services/db";

interface Unsubscriber {
  unsubscribe: (id: string) => void;
}

/**
 * todo(nickbar01234): Implement ability to register multiple callbacks per subscriber
 */
type DatabaseObserverManager = DatabaseObserver & Unsubscriber;

class DefaultDatabaseObserverManager implements DatabaseObserverManager {
  private delegate: DatabaseObserver;

  private observers: Map<string, Unsubscribe>;

  constructor(delegate: DatabaseObserver) {
    this.delegate = delegate;
    this.observers = new Map();
  }

  public subscribeToRooms(cb: ObserverCollectionCallback<Room>) {
    return this.subscribe(Model.ROOMS, this.delegate.subscribeToRooms, cb);
  }

  public subscribeToRoom(id: string, cb: ObserverDocumentCallback<Room>) {
    return this.subscribe(
      `${Model.ROOMS}/${id}`,
      this.delegate.subscribeToRoom,
      id,
      cb
    );
  }

  public subscribeToConnection(
    id: string,
    from: string,
    to: string,
    cb: ObserverDocumentCallback<Connection>
  ) {
    return this.subscribe(
      `${Model.ROOMS}/${id}/${Model.CONNECTIONS}/${from}/${to}`,
      this.delegate.subscribeToConnection,
      id,
      from,
      to,
      cb
    );
  }

  public unsubscribe(id: string) {
    this.observers.get(id)?.();
    this.observers.delete(id);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private subscribe<T extends (...args: any[]) => any>(
    id: string,
    factory: T,
    ...args: Parameters<T>
  ) {
    this.unsubscribe(id);
    const unsubscribe = factory(...args);
    this.observers.set(id, unsubscribe);
    return unsubscribe;
  }
}

const databaseObseverManager = new DefaultDatabaseObserverManager(
  db.listener()
);

export default databaseObseverManager;
