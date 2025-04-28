import { SkeletonWrapper } from "@cb/components/ui/SkeletonWrapper";
import { ScrollArea } from "@cb/lib/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@cb/lib/components/ui/table";
import React from "react";

interface Props<T> {
  data: T[];
  headers: string[];
  renderRow: (item: T) => React.ReactNode;
}

const GenericTable = <T,>({ data, headers, renderRow }: Props<T>) => {
  return (
    <ScrollArea className="grow h-10 z-10">
      <SkeletonWrapper loading={data === undefined}>
        <Table className="min-w-full dark:bg-dark-layer-bg dark:text-gray-100">
          <TableHeader className="sticky top-0 bg-white dark:bg-dark-layer-bg dark:text-gray-300 z-20">
            <TableRow>
              {headers.map((header, index) => (
                <TableHead key={index} className="align-bottom p-2 truncate">
                  {header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item, index) => (
              <React.Fragment key={index}>{renderRow(item)}</React.Fragment>
            ))}
          </TableBody>
        </Table>
      </SkeletonWrapper>
    </ScrollArea>
  );
};

export default GenericTable;
