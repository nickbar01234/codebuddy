import { auth } from "@cb/db";
import {
  getLocalStorage,
  removeLocalStorage,
  sendServiceRequest,
} from "@cb/services";
import { AppDispatch } from "@cb/state/store";
import { AuthenticationStatus, ResponseStatus, Status } from "@cb/types";
import { poll } from "@cb/utils/poll";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  createUserWithEmailAndPassword,
  isSignInWithEmailLink,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithEmailLink,
} from "firebase/auth/web-extension";
import { toast } from "sonner";

interface SessionState {
  auth: AuthenticationStatus;
}

const initialState: SessionState = {
  auth: { status: Status.LOADING },
};

export const initialAuthenticateCheck = createAsyncThunk(
  "session/initialAuthenticateCheck",
  async (_, { rejectWithValue }) => {
    if (import.meta.env.MODE === "development") {
      const user = await poll({
        fn: async () => getLocalStorage("test"),
        until: (x) => x != undefined,
      });
      if (user != undefined) {
        const { peer } = user;
        createUserWithEmailAndPassword(auth, peer, "TEST_PASSWORD")
          .catch((error) => {
            if (error.code !== "auth/email-already-in-use") {
              console.error(error);
              rejectWithValue(error);
            }
          })
          .finally(() =>
            signInWithEmailAndPassword(auth, peer, "TEST_PASSWORD")
          );
      }
    } else {
      const signIn = getLocalStorage("signIn");
      if (
        signIn != undefined &&
        isSignInWithEmailLink(auth, window.location.href)
      ) {
        // todo(nickbar01234): Handle signin from different device
        // todo(nickbar01234): Handle error code
        signInWithEmailLink(auth, signIn.email, window.location.href)
          .then(() => sendServiceRequest({ action: "closeSignInTab", signIn }))
          .then((response) => {
            if (response.status === ResponseStatus.SUCCESS) {
              toast.info("Closed sign-in tab");
            }
          })
          .catch((error) => {
            console.error(error);
            rejectWithValue(error);
          })
          .finally(() => {
            removeLocalStorage("signIn");
          });
      }
    }
  }
);

export const listenToAuthChanges = () => (dispatch: AppDispatch) => {
  return onAuthStateChanged(auth, (user) => {
    if (user == null) {
      dispatch(setAuthStatus({ status: Status.UNAUTHENTICATED }));
    } else {
      dispatch(
        setAuthStatus({
          status: Status.AUTHENTICATED,
          user: { username: user.displayName ?? user.email! },
        })
      );
    }
  });
};

// Create slice
const sessionSlice = createSlice({
  name: "session",
  initialState,
  reducers: {
    setAuthStatus: (state, action: PayloadAction<AuthenticationStatus>) => {
      state.auth = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(initialAuthenticateCheck.pending, (state) => {
        state.auth = { status: Status.LOADING };
      })
      .addCase(initialAuthenticateCheck.rejected, (state) => {
        // Handle sign-in errors if needed
        console.error("Error during initial authentication check");
        state.auth = { status: Status.UNAUTHENTICATED };
      });
  },
});

export const { setAuthStatus } = sessionSlice.actions;
export default sessionSlice.reducer;
