import { ClickableText } from "@cb/components/ui/ClickableText";
import { InputContainer } from "@cb/components/ui/InputContainer";
import { useSignInWithEmailLink } from "@cb/hooks/auth";
import { isValidEmail } from "@cb/utils";
import React from "react";
import { toast } from "sonner";
import { DefaultPanel } from "./DefaultPanel";

const SignInPanel = () => {
  const { email, onEmailInput, onEmailSubmit, status, resetStatus } =
    useSignInWithEmailLink();

  React.useEffect(() => {
    if (status.status === "ERROR") {
      toast.error(`${status.message}. Please try again.`);
      resetStatus();
    }
  }, [status, resetStatus]);

  return (
    <DefaultPanel>
      <div className="flex flex-col gap-3 items-center w-full">
        {status.status === "INIT" ? (
          <>
            <div className="flex flex-col gap-2 items-center text-center">
              <div className="text-[#1E1E1E] dark:text-[#F5F5F5] font-semibold text-xl">
                Enter your email to login
              </div>
              <div className="flex flex-col text-[#0000008C] dark:text-[#FFFFFF99] text-lg">
                <span>We&apos;ll send you a one-time activation link.</span>
                <span>You&apos;ll stay logged in after this.</span>
              </div>
            </div>
            <InputContainer
              input={{
                type: "email",
                placeholder: "Enter your email",
                value: email,
                onChange: (e) => onEmailInput(e.target.value),
              }}
              button={{
                disabled: !isValidEmail(email),
                onClick: (e) => {
                  e.preventDefault();
                  onEmailSubmit();
                },
              }}
            />
          </>
        ) : status.status === "SENT" ? (
          <>
            <div className="flex flex-col gap-2 items-center text-center">
              <div className="text-[#1E1E1E] dark:text-white font-semibold text-xl">
                Email sent to {email}
              </div>
              <div className="flex flex-col text-[#0000008C] dark:text-[#FFFFFF99] text-lg">
                <span>We&apos;ll send you a one-time activation link.</span>
                <span>
                  Once you click it, you&apos;ll be logged in automatically.
                </span>
              </div>
            </div>
            <div className="flex gap-2 text-lg">
              <div className="text-[#0000008C] dark:text-[#FFFFFF99]">
                Haven&apos;t received any email? Check your spam folder.
              </div>
              {/* todo(nickbar01234): Should wait for X duration before displaying this, since we throttle anyway */}
              <ClickableText
                node="Resend"
                container={{ onClick: () => onEmailSubmit() }}
              />
              <ClickableText
                node="Retry"
                container={{ onClick: () => resetStatus() }}
              />
            </div>
          </>
        ) : null}
      </div>
    </DefaultPanel>
  );
};

export default SignInPanel;
