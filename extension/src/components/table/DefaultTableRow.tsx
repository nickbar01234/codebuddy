import { TableRow } from "@cb/lib/components/ui/table";
import React from "react";

interface DefaultTableRowProps extends React.ComponentProps<typeof TableRow> {
  children?: React.ReactNode;
}

export const DefaultTableRow = ({
  children,
  className,
  ...rest
}: DefaultTableRowProps) => {
  return (
    <TableRow
      className={cn(
        "odd:rounded-md [&>td:first-child]:odd:rounded-l-md [&>td:last-child]:odd:rounded-r-md border-none hover:bg-inherit",
        className
      )}
      {...rest}
    >
      {children}
    </TableRow>
  );
};
