import { EventHandler, PubSub } from "./types";

class DefaultPubSub<T extends Record<string, unknown>> implements PubSub<T> {
  private handlers: { [K in keyof T]?: Set<EventHandler<T[K]>> } = {};

  public subscribe<K extends keyof T>(event: K, cb: EventHandler<T[K]>) {
    if (this.handlers[event] == undefined) {
      this.handlers[event] = new Set();
    }
    this.handlers[event].add(cb);
    return () => this.handlers[event]?.delete(cb);
  }

  public publish<K extends keyof T>(event: K, payload: T[K]) {
    this.handlers[event]?.forEach((handler) => handler(payload));
  }
}

export default DefaultPubSub;
