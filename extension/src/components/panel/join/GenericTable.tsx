import InfiniteScroll from "@cb/components/ui/InfiniteScroll";
import { SkeletonWrapper } from "@cb/components/ui/SkeletonWrapper";
import { ScrollArea } from "@cb/lib/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@cb/lib/components/ui/table";
import { Loader2 } from "lucide-react";
import React from "react";

interface IdentifiableObject {
  id: string | number;
}

interface Props<T extends IdentifiableObject> {
  data: T[];
  headers: string[];
  renderRow: (item: T) => React.ReactNode;
  isLoading: boolean; // Add loading state
  hasMore: boolean; // Add hasMore state
  loadMore: () => void; // Add loadMore function
}

const GenericTable = <T extends IdentifiableObject>({
  data,
  headers,
  renderRow,
  isLoading,
  hasMore,
  loadMore,
}: Props<T>) => {
  return (
    <ScrollArea className="grow h-10 z-10">
      {/* <div className="grow h-10 z-10 overflow-hidden"> */}
      <SkeletonWrapper loading={data === undefined}>
        <Table className="min-w-full dark:bg-dark-layer-bg dark:text-gray-100">
          <TableHeader className="sticky top-0 bg-white dark:bg-dark-layer-bg text-secondary dark:text-gray-300 z-20">
            <TableRow>
              {headers.map((header) => (
                <TableHead key={header} className="align-bottom p-2 truncate">
                  {header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          {/* <div className="max-h-[400px] overflow-y-auto"> */}
          <TableBody>
            {data.map((item) => (
              <React.Fragment key={item.id}>{renderRow(item)}</React.Fragment>
            ))}
            <InfiniteScroll
              isLoading={isLoading}
              hasMore={hasMore}
              next={loadMore}
              threshold={1}
              rootMargin="0px"
            >
              {hasMore && (
                <TableRow className="flex justify-center items-center my-2">
                  {/* <div className="flex justify-center items-center my-2"> */}
                  <Loader2 className="h-5 w-5 animate-spin" />
                  {/* </div> */}
                </TableRow>
              )}
            </InfiniteScroll>
          </TableBody>
          {/* </div> */}
        </Table>
      </SkeletonWrapper>
      {/* </div> */}
    </ScrollArea>
  );
};

export default GenericTable;
