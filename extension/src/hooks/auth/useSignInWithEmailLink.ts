import {
  constructUrlFromQuestionId,
  getLocalStorage,
  getQuestionIdFromUrl,
  removeLocalStorage,
  setLocalStorage,
} from "@cb/utils";
import React from "react";
import {
  ActionCodeSettings,
  isSignInWithEmailLink,
  sendSignInLinkToEmail,
  signInWithEmailLink,
} from "firebase/auth/web-extension";
import { auth } from "@cb/db";
import { useOnMount } from "..";

interface SignInInit {
  status: "INIT";
}

interface SignInEmailSent {
  status: "SENT";
}

interface SignInError {
  status: "ERROR";
  message: string;
}

export type SignInWithEmailLinkStatus =
  | SignInInit
  | SignInError
  | SignInEmailSent;

export const useSignInWithEmailLink = () => {
  const [email, setEmail] = React.useState("");
  const [status, setStatus] = React.useState<SignInWithEmailLinkStatus>({
    status: "INIT",
  });

  const actionCodeSettings: ActionCodeSettings = React.useMemo(
    () => ({
      url: constructUrlFromQuestionId(
        getQuestionIdFromUrl(window.location.href)
      ),
      handleCodeInApp: true,
    }),
    []
  );

  const onEmailInput = (input: string) => setEmail(input);

  const onEmailSubmit = () =>
    sendSignInLinkToEmail(auth, email, actionCodeSettings)
      .then(() => {
        setLocalStorage("email", email);
        setStatus({ status: "SENT" });
      })
      .catch((error: any) => {
        // https://firebase.google.com/docs/reference/js/v8/firebase.auth.Auth#sendsigninlinktoemail
        const message =
          error.code === "auth/invalid-email"
            ? "Invalid email"
            : "An error has occured";
        setStatus({ status: "ERROR", message: message });
      });

  const resetStatus = () => setStatus({ status: "INIT" });

  useOnMount(() => {
    if (isSignInWithEmailLink(auth, window.location.href)) {
      const email = getLocalStorage("email");
      // todo(nickbar01234): Handle signin from different device
      // todo(nickbar01234): Handle error code
      if (email != null)
        signInWithEmailLink(auth, email, window.location.href).then(() =>
          removeLocalStorage("email")
        );
    }
  });

  return {
    email: email,
    onEmailInput: onEmailInput,
    onEmailSubmit: onEmailSubmit,
    status: status,
    resetStatus: resetStatus,
  };
};
