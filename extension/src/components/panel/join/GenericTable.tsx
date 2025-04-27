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
  loading: boolean;
  renderRow: (item: T) => React.ReactNode;
  emptyMessage?: string;
}

const GenericTable = <T,>({
  data,
  headers,
  loading,
  renderRow,
  emptyMessage = "No data available",
}: Props<T>) => {
  return (
    <ScrollArea className="grow h-10 z-10">
      <Table className="min-w-full">
        <TableHeader className="sticky top-0 bg-white z-20">
          <TableRow>
            {headers.map((header, index) => (
              <TableHead key={index} className="align-bottom p-2 truncate">
                {header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableHead
                colSpan={headers.length}
                className="text-center p-4 text-gray-500"
              >
                Loading...
              </TableHead>
            </TableRow>
          ) : data.length > 0 ? (
            data.map((item, index) => (
              <React.Fragment key={index}>{renderRow(item)}</React.Fragment>
            ))
          ) : (
            <TableRow>
              <TableHead
                colSpan={headers.length}
                className="text-center p-4 text-gray-500 bg-white dark:bg-dark-layer-bg hover:bg-white dark:hover:bg-dark-layer-bg"
              >
                {emptyMessage}
              </TableHead>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </ScrollArea>
  );
};

export default GenericTable;
