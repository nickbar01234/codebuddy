import { SkeletonWrapper } from "@cb/components/ui/SkeletonWrapper";
import { Table } from "@cb/lib/components/ui/table";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import React from "react";

interface GenericTableProps {
  loading: boolean;
  children: React.ReactNode;
}

export const DefaultTable = ({ loading, children }: GenericTableProps) => {
  return (
    <SkeletonWrapper loading={loading}>
      <div className="flex flex-col h-full">
        <ScrollArea className="flex-1 overflow-y-auto hide-scrollbar pb-12">
          <Table className="w-full">{children}</Table>
        </ScrollArea>
      </div>
    </SkeletonWrapper>
  );
};
