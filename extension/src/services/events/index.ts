import { Events, Unsubscribe } from "@cb/types";
import mitt, { EventType, Handler } from "mitt";

type FilterHandler<T> = (event: T) => boolean;

export interface FilterableEventEmitter<
  Events extends Record<EventType, unknown>,
> {
  on<Key extends keyof Events>(
    type: Key,
    handler: Handler<Events[Key]>,
    filter?: FilterHandler<Events[Key]>
  ): Unsubscribe;

  off<Key extends keyof Events>(type: Key, handler: Handler<Events[Key]>): void;

  emit<Key extends keyof Events>(type: Key, event?: Events[Key]): void;
}

const createEmitter = <
  Events extends Record<EventType, unknown>,
>(): FilterableEventEmitter<Events> => {
  const emitter = mitt<Events>();
  const handlers = new Map<keyof Events, Map<Handler<any>, Handler<any>>>();

  return {
    on<Key extends keyof Events>(
      type: Key,
      handler: Handler<Events[Key]>,
      filter: FilterHandler<Events[Key]>
    ) {
      const filterable: Handler<Events[Key]> = (event) => {
        const handle = filter == undefined || filter(event);
        if (handle) {
          handler(event);
        }
      };

      if (!handlers.has(type)) {
        handlers.set(type, new Map());
      }
      handlers.get(type)?.set(handler, filterable);

      emitter.on(type, filterable);
      return () => this.off(type, handler);
    },

    off<Key extends keyof Events>(type: Key, handler: Handler<Events[Key]>) {
      const filterable = handlers.get(type)?.get(handler);
      handlers.get(type)?.delete(handler);
      // mitt removes all handlers for type if filterable is undefined
      if (filterable != undefined) emitter.off(type, filterable);
    },

    emit: emitter.emit,
  };
};

export const emitter: EventEmitter = createEmitter();

export type EventEmitter = FilterableEventEmitter<Events>;
