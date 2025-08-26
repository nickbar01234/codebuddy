import { AddressableEvent } from "@cb/types";

export const isEventToMe =
  (me: string) =>
  ({ to }: AddressableEvent<unknown>) =>
    to === me;

export const isEventFromMe =
  (me: string) =>
  ({ from }: AddressableEvent<unknown>) =>
    from === me;
