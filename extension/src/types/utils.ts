export interface GenericMessage {
  action: string;
}

export type GenericResponse<
  T extends GenericMessage,
  R extends Record<T["action"], unknown>
> = {
  [k in T["action"]]: R[k];
};

export type ExtractMessage<
  T extends GenericMessage,
  key extends T["action"]
> = Extract<T, { action: key }>;

export type MessagePayload<T extends GenericMessage> = Omit<T, "action">;

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
