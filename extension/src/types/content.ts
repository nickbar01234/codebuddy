import { GenericMessage, GenericResponse } from "./utils";

interface ToggleUi extends GenericMessage {
  action: "toggleUi";
}

export type ContentRequest = ToggleUi;

export type ContentResponse = GenericResponse<
  ContentRequest,
  { toggleUi: void }
>;
