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
