import { GenericMessage, GenericResponse } from "./utils";

interface ToggleUi extends GenericMessage {
  action: "toggleUi";
}

interface UrlChange extends GenericMessage {
  action: "url";
  url: string;
}

export type ContentRequest = ToggleUi | UrlChange;

export type ContentResponse = GenericResponse<
  ContentRequest,
  { toggleUi: void; url: void }
>;
