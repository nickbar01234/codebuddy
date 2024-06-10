export interface User {
  id: string;
  username: string;
}

export type Status =
  | {
      status: "AUTHENTICATED";
      user: User;
    }
  | { status: "LOADING" }
  | { status: "UNAUTHENTICATED" };

interface CookieRequest {
  action: "cookie";
}
interface GetValueRequest {
  action: "getValue";
}

interface SetValueRequest {
  action: "setValue";
  value: string;
}

export type ServiceRequest = CookieRequest | GetValueRequest | SetValueRequest;

export type ServiceResponse = {
  cookie: Status;
  getValue: string;
  setValue: void;
};

interface EditorPreference {
  width: number;
}

export interface ExtensionStorage {
  editorPreference: EditorPreference;
}
