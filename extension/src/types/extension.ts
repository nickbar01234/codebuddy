import monaco from "monaco-editor";
import { LocalStorage } from ".";

enum ResponseStatus {
  SUCCESS,
  FAIL,
}

interface BaseGenericResponse<T extends ResponseStatus, U> {
  status: T;
  payload: U;
}

type GenericResponse<Success, Fail> =
  | BaseGenericResponse<ResponseStatus.SUCCESS, Success>
  | BaseGenericResponse<ResponseStatus.FAIL, Fail>;

export interface WindowProtocol {
  languages(languages: string[]): void;
  paste(value: string): void;
  onEditorChange(changes: monaco.editor.IModelContentChange): void;
}

export interface BackgroundProtocol {
  getExtensionId(): GenericResponse<string, string>;
  getActiveTabId(): GenericResponse<number, string>;
  closeSignInTab(data: {
    signIn: LocalStorage["signIn"];
  }): GenericResponse<undefined, string>;
}
