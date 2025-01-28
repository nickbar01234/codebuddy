export enum Status {
  AUTHENTICATED,
  UNAUTHENTICATED,
  LOADING,
}

export interface AppUser {
  username: string;
}

interface Authenticated {
  status: Status.AUTHENTICATED;
  user: AppUser;
}

interface Unauthenticated {
  status: Status.UNAUTHENTICATED;
}

interface Loading {
  status: Status.LOADING;
}

export type AuthenticationStatus = Authenticated | Unauthenticated | Loading;
