import { Negotiation } from "@cb/services/db/types";
import { ExtractMessage, MessagePayload, Unsubscribe } from "@cb/types/utils";

export type EventHandler<T> = (payload: T) => void;

export interface PubSub<T extends Record<string, unknown>> {
  subscribe<K extends keyof T>(event: K, cb: EventHandler<T[K]>): Unsubscribe;

  publish<K extends keyof T>(event: K, payload: T[K]): void;
}

export type NegotiationEvents = {
  [K in Negotiation["message"]["action"]]: Pick<Negotiation, "from" | "to"> &
    MessagePayload<ExtractMessage<Negotiation["message"], K>>;
};
