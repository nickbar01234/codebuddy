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

export type ServiceRequest = CookieRequest;

export type ServiceResponse = {
  cookie: Status;
};

interface EditorPreference {
  width: number;
}

export interface ExtensionStorage {
  editorPreference: EditorPreference;
}
