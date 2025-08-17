import { setLocalStorage } from "@cb/services";
import background from "@cb/services/background";
import { auth } from "@cb/services/db";
import { constructUrlFromQuestionId, getSessionId } from "@cb/utils";
import { FirebaseError } from "firebase/app";
import {
  ActionCodeSettings,
  createUserWithEmailAndPassword,
  sendSignInLinkToEmail,
  signInWithEmailAndPassword,
} from "firebase/auth/web-extension";
import { throttle } from "lodash";
import React from "react";

const THROTTLE_SUBMIT = 5000;

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
      url: constructUrlFromQuestionId(getSessionId()),
      handleCodeInApp: true,
    }),
    []
  );

  const onEmailInput = (input: string) => setEmail(input);

  const onEmailSubmit = React.useMemo(
    () =>
      throttle(() => {
        if (import.meta.env.DEV) {
          createUserWithEmailAndPassword(auth, email, "TEST_PASSWORD")
            .catch((error) => {
              if (error.code !== "auth/email-already-in-use") {
                console.error(error);
              }
            })
            .finally(() =>
              signInWithEmailAndPassword(auth, email, "TEST_PASSWORD")
            );
        } else {
          sendSignInLinkToEmail(auth, email, actionCodeSettings)
            .then(async () => {
              setLocalStorage("signIn", {
                email,
                url: actionCodeSettings.url,
                tabId: await background.getActiveTab({}),
              });
              setStatus({ status: "SENT" });
            })
            .catch((error: unknown) => {
              if (error instanceof FirebaseError) {
                // https://firebase.google.com/docs/reference/js/v8/firebase.auth.Auth#sendsigninlinktoemail
                const message =
                  error.code === "auth/invalid-email"
                    ? "Invalid email"
                    : "An error has occured";
                setStatus({ status: "ERROR", message: message });
                console.error(error);
              }
            });
        }
      }, THROTTLE_SUBMIT),
    [actionCodeSettings, email]
  );

  const resetStatus = () => {
    setStatus({ status: "INIT" });
    setEmail("");
  };

  return {
    email: email,
    onEmailInput: onEmailInput,
    onEmailSubmit: onEmailSubmit,
    status: status,
    resetStatus: resetStatus,
  };
};
