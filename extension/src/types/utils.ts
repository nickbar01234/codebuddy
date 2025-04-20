export interface GenericMessage {
  action: string;
}

export type GenericResponse<
  T extends GenericMessage,
  R extends Record<T["action"], unknown>,
> = {
  [k in T["action"]]: R[k];
};

export type ExtractMessage<
  T extends GenericMessage,
  key extends T["action"],
> = Extract<T, { action: key }>;

export type MessagePayload<T extends GenericMessage> = Omit<T, "action">;

// https://stackoverflow.com/a/57103940/19129136
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type DistributiveOmit<T, K extends keyof any> = T extends any
  ? Omit<T, K>
  : never;

export interface LeetCodeContentChange {
  range: {
    startLineNumber: number;
    startColumn: number;
    endLineNumber: number;
    endColumn: number;
  };
  rangeLength: number;
  text: string;
  rangeOffset: number;
  forceMoveMarkers: boolean;
}

export interface Connection {
  username: string;
  pc: RTCPeerConnection;
  channel: RTCDataChannel;
  lastSeen: number;
}
