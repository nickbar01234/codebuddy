import { TableRow } from "@cb/lib/components/ui/table";

interface DefaultTableRowProps {
  children?: React.ReactNode;
}

export const DefaultTableRow = ({ children }: DefaultTableRowProps) => {
  return (
    <TableRow
      className={cn(
        "odd:rounded-md [&>td:first-child]:odd:rounded-l-md [&>td:last-child]:odd:rounded-r-md border-none hover:bg-inherit"
      )}
    >
      {children}
    </TableRow>
  );
};
