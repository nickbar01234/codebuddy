import { SkeletonWrapper } from "@cb/components/ui/SkeletonWrapper";
import { Table } from "@cb/lib/components/ui/table";
import React from "react";

interface GenericTableProps {
  loading: boolean;
  children: React.ReactNode;
}

export const DefaultTable = ({ loading, children }: GenericTableProps) => {
  return (
    <SkeletonWrapper loading={loading}>
      <Table className="h-full w-full">{children}</Table>
    </SkeletonWrapper>
  );
};
