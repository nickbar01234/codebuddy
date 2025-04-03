// sessionSlice.ts
import { auth } from "@cb/db";
import {
  getLocalStorage,
  removeLocalStorage,
  sendServiceRequest,
} from "@cb/services";
import { AuthenticationStatus, ResponseStatus, Status } from "@cb/types";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  createUserWithEmailAndPassword,
  isSignInWithEmailLink,
  signInWithEmailAndPassword,
  signInWithEmailLink,
} from "firebase/auth/web-extension";
import { toast } from "sonner";

interface SessionState {
  auth: AuthenticationStatus;
}
// Define initial state
const initialState: SessionState = {
  auth: { status: Status.LOADING },
};

export const initialAuthenticateCheck = createAsyncThunk(
  "session/initialAuthenticateCheck",
  async (_, { rejectWithValue }) => {
    if (import.meta.env.MODE === "development") {
      const user = getLocalStorage("test");
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

// Create slice
const sessionSlice = createSlice({
  name: "session",
  initialState,
  reducers: {
    setAuthStatus: (state, action) => {
      return action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(initialAuthenticateCheck.pending, (state) => {
        state.auth = { status: Status.LOADING };
      })
      .addCase(initialAuthenticateCheck.fulfilled, (state) => {
        // Note: The actual authentication status will be updated by the Firebase listener
        // This just handles the email link sign-in process
      })
      .addCase(initialAuthenticateCheck.rejected, (state) => {
        // Handle sign-in errors if needed
      });
  },
});

export const { setAuthStatus } = sessionSlice.actions;
export default sessionSlice.reducer;
