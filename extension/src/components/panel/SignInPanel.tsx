import { useSignInWithEmailLink } from "@cb/hooks/auth";
import { isValidEmail } from "@cb/utils";

export const SignInPanel = () => {
  const { email, onEmailInput, onEmailSubmit, status, resetStatus } =
    useSignInWithEmailLink();

  return (
    <div className="h-full w-full flex flex-col justify-center items-center py-24 gap-y-4 overflow-auto">
      <h1 className="text-4xl font-medium">Code Buddy</h1>
      <div className="flex flex-col gap-y-2 rounded-md w-[300px]">
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
        <button
          data-valid={isValidEmail(email)}
          disabled={!isValidEmail(email)}
          className="self-end h-8 py-1.5 px-3 bg-[#2DB55D] dark:bg-[#2CBB5D] rounded-md data-[valid=false]:bg-[#000a200d] data-[valid=false]:dark:bg-[#ffffff12] data-[valid=true]:text-white"
          onClick={(e) => {
            e.preventDefault();
            onEmailSubmit();
          }}
        >
          Submit
        </button>
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
  );
};
