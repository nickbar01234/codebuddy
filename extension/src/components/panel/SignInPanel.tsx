import { useSignInWithEmailLink } from "@cb/hooks/auth";
import { isValidEmail } from "@cb/utils";
import { cn } from "@cb/utils/cn";
import { DefaultPanel } from "./DefaultPanel";

const SignInPanel = () => {
  const { email, onEmailInput, onEmailSubmit, status, resetStatus } =
    useSignInWithEmailLink();

  return (
    <DefaultPanel>
      <div className="w-full flex justify-center">
        <div className="flex flex-col gap-y-4 rounded-md w-[300px]">
          <input
            className="w-full rounded-md leading-5 outline-none placeholder:text-[#3c3c434d] dark:placeholder:text-[#ebebf54d] border-none py-1.5 text-[#262626bf] dark:text-[#eff1f6bf] bg-[#000a200d] dark:bg-[#ffffff1a] focus:bg-[#000a201a] dark:focus:bg-[#ffffff24] px-3"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => {
              resetStatus();
              onEmailInput(e.target.value);
            }}
          />
          <div className="self-end group flex flex-none items-center justify-center hover:bg-fill-quaternary dark:hover:bg-fill-quaternary bg-fill-tertiary dark:bg-fill rounded-md">
            <button
              className={cn(
                "font-medium items-center whitespace-nowrap focus:outline-none inline-flex rounded-none py-1.5 px-3 bg-transparent dark:bg-transparent text-text-primary dark:text-text-primary",
                {
                  "bg-[#000a200d] dark:bg-[#ffffff12]": isValidEmail(email),
                  hidden: !isValidEmail(email),
                }
              )}
              onClick={(e) => {
                e.preventDefault();
                onEmailSubmit();
              }}
            >
              Submit
            </button>
          </div>
          <span
            data-status={status.status}
            className="mt-4 self-center rounded-md outline-none bg-transparent data-[status=SENT]:bg-[#e8ffe9] data-[status=SENT]:text-[#2DB55D] data-[status=ERROR]:bg-[rgba(246,54,54,0.08)] data-[status=ERROR]:dark:bg-[rgba(248,97,92,0.08)] data-[status=ERROR]:text-[#f8615c] w-full px-3 py-1.5 before:content-['\200b']"
          >
            {status.status === "ERROR"
              ? status.message
              : status.status === "SENT"
                ? "A sign-in link has been sent to your email"
                : null}
          </span>
        </div>
      </div>
    </DefaultPanel>
  );
};

export default SignInPanel;
