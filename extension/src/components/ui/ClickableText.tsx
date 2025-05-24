import { cn } from "@cb/utils/cn";

interface ClickableTextProps {
  node: React.ReactNode;
  container: React.HTMLAttributes<HTMLDivElement>;
}

export const ClickableText = ({
  node,
  container: { className, ...rest },
}: ClickableTextProps) => {
  return (
    <div
      className={cn(
        "text-[#1E1E1E] dark:text-[#F5F5F5] underline cursor-pointer",
        className
      )}
      {...rest}
    >
      {node}
    </div>
  );
};
