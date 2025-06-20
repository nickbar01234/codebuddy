import { cn } from "@cb/utils/cn";

type HandleProps = React.HtmlHTMLAttributes<HTMLDivElement>;

export const VerticalHandle = ({ className, ...rest }: HandleProps) => {
  return (
    <div
      className={cn(
        "absolute left-0 flexlayout__splitter flexlayout__splitter_vert w-2 h-full hover:after:h-full hover:after:bg-[--color-splitter-drag] after:h-[20px] after:bg-[--color-splitter] cursor-ew-resize",
        className
      )}
      {...rest}
    />
  );
};
