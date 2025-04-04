import { Skeleton } from "@cb/lib/components/ui/skeleton";
import { cn } from "@cb/utils/cn";
import React from "react";

export const SkeletonWrapper = ({
  children,
  className,
  loading,
}: {
  children: React.ReactNode;
  className?: string;
  loading?: boolean;
}) => {
  return loading ? (
    <Skeleton
      className={cn(
        "h-full w-full bg-[--color-tabset-tabbar-background]",
        className
      )}
    />
  ) : (
    <>{children}</>
  );
};
