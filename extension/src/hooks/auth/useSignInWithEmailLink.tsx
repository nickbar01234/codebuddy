import { constructUrlFromQuestionId, getQuestionIdFromUrl } from "@cb/utils";
import React from "react";
import {
  ActionCodeSettings,
  sendSignInLinkToEmail,
} from "firebase/auth/web-extension";
import { auth } from "@cb/db";
import { sendServiceRequest, setLocalStorage } from "@cb/services";

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
      .then(async () => {
        setLocalStorage("signIn", {
          email,
          url: actionCodeSettings.url,
          tabId: await sendServiceRequest({ action: "getActiveTabId" }),
        });
        setStatus({ status: "SENT" });
      })
      .catch((error: any) => {
        // https://firebase.google.com/docs/reference/js/v8/firebase.auth.Auth#sendsigninlinktoemail
        const message =
          error.code === "auth/invalid-email"
            ? "Invalid email"
            : "An error has occured";
        setStatus({ status: "ERROR", message: message });
        console.error(error);
      });

  const resetStatus = () => setStatus({ status: "INIT" });

  return {
    email: email,
    onEmailInput: onEmailInput,
    onEmailSubmit: onEmailSubmit,
    status: status,
    resetStatus: resetStatus,
  };
};
