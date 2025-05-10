import { auth } from "@cb/db";
import { sendServiceRequest, setLocalStorage } from "@cb/services";
import { constructUrlFromQuestionId, getSessionId } from "@cb/utils";
import { FirebaseError } from "firebase/app";
import {
  ActionCodeSettings,
  sendSignInLinkToEmail,
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
      throttle(
        () =>
          sendSignInLinkToEmail(auth, email, actionCodeSettings)
            .then(async () => {
              setLocalStorage("signIn", {
                email,
                url: actionCodeSettings.url,
                tabId: await sendServiceRequest({ action: "getActiveTabId" }),
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
            }),
        THROTTLE_SUBMIT
      ),
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
