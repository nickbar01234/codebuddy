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
        "rounded-md [&>td:first-child]:rounded-l-md [&>td:last-child]:rounded-r-md border-none hover:bg-inherit",
        className
      )}
      {...rest}
    >
      {children}
    </TableRow>
  );
};
