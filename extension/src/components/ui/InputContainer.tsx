import { cn } from "@cb/utils/cn";

interface InputContainerProps {
  input: React.InputHTMLAttributes<HTMLInputElement>;
  button: React.ButtonHTMLAttributes<HTMLButtonElement>;
}

export const InputContainer = ({ input, button }: InputContainerProps) => {
  const { disabled } = button;
  return (
    <div
      className={cn(
        "flex min-w-96 border rounded-lg justify-between overflow-hidden",
        {
          "border-[#78788033] dark:border-[#4A4A4E]": disabled,
          "border-[#2C2C2C] dark:border-[#F5F5F5]": !disabled,
        }
      )}
    >
      <input
        className="py-2 px-3 grow rounded-md outline-none placeholder:text-[#0000008C] dark:placeholder:text-[#FFFFFF99] bg-inherit"
        {...input}
      />
      <div
        className={cn("py-2 px-3 transition", {
          "bg-[#78788033] dark:bg-[#71717A]": disabled,
          "bg-[#2C2C2C] dark:bg-[#F5F5F5] text-white dark:text-[#1E1E1E]":
            !disabled,
        })}
      >
        <button {...button}>Continue</button>
      </div>
    </div>
  );
};
