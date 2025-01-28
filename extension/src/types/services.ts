import type {
  GenericMessage,
  GenericResponse,
  LeetCodeContentChange,
} from "./utils";

interface GetValueRequest extends GenericMessage {
  action: "getValue";
}

interface SetValueRequest extends GenericMessage {
  action: "setValue";
  value: string;
}

interface SetupCodeBuddyModel extends GenericMessage {
  action: "setupCodeBuddyModel";
  id: string;
}

interface SetupLeetCodeModel extends GenericMessage {
  action: "setupLeetCodeModel";
}

interface SetOtherEditorRequest extends GenericMessage {
  action: "setValueOtherEditor";
  code: string;
  language: string;
  changes: LeetCodeContentChange;
  changeUser: boolean;
  editorId: string;
}

interface CleanEditorRequest extends GenericMessage {
  action: "cleanEditor";
}

interface ReloadExtensionRequest extends GenericMessage {
  action: "reloadExtension";
}

export type ServiceRequest =
  | GetValueRequest
  | SetValueRequest
  | SetupCodeBuddyModel
  | SetOtherEditorRequest
  | CleanEditorRequest
  | SetupLeetCodeModel
  | ReloadExtensionRequest;

export type ServiceResponse = GenericResponse<
  ServiceRequest,
  {
    getValue: {
      value: string;
      language: string;
    };
    setValue: void;
    setupCodeBuddyModel: void;
    setupLeetCodeModel: void;
    setValueOtherEditor: void;
    cleanEditor: void;
    reloadExtension: void;
  }
>;
