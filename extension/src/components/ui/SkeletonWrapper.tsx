import { Skeleton } from "@cb/lib/components/ui/skeleton";
import { cn } from "@cb/utils/cn";
import React, { FC } from "react";

interface SkelentonWrapperProps extends React.ComponentProps<typeof Skeleton> {
  loading: boolean;
  children?: React.ReactNode;
  className?: string;
}

export const SkeletonWrapper: FC<SkelentonWrapperProps> = ({
  children,
  className,
  loading,
}) => {
  return (
    <div className="relative h-full w-full">
      {loading && (
        <Skeleton
          className={cn(
            "h-full w-full bg-[--color-tabset-tabbar-background]",
            className
          )}
        />
      )}
      <div
        className={cn("h-full w-full", {
          hidden: loading,
        })}
      >
        {children}
      </div>
    </div>
  );
};
