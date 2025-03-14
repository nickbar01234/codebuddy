import { cn } from "@cb/utils/cn";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("animate-pulse rounded-md p-1", className)} {...props}>
      <div className="h-full w-full rounded-md bg-[--color-tabset-tabbar-background]"></div>
    </div>
  );
}

export { Skeleton };
