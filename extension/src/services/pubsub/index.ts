import { EventHandler, PubSub } from "./types";

class DefaultPubSub<T extends Record<string, unknown>> implements PubSub<T> {
  private handlers: {
    [K in keyof T]?: Set<{
      cb: EventHandler<T[K]>;
      filter: (data: T[K]) => boolean;
    }>;
  } = {};

  public subscribe<K extends keyof T>(
    event: K,
    cb: EventHandler<T[K]>,
    filter?: (data: T[K]) => boolean
  ) {
    if (this.handlers[event] == undefined) {
      this.handlers[event] = new Set();
    }
    const entry = { cb, filter: filter ?? (() => true) };
    this.handlers[event].add(entry);
    return () => this.handlers[event]?.delete(entry);
  }

  public publish<K extends keyof T>(event: K, payload: T[K]) {
    this.handlers[event]?.forEach(({ cb, filter }) => {
      if (filter(payload)) cb(payload);
    });
  }
}

export default DefaultPubSub;
