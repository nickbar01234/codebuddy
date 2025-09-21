import { TableHead, TableHeader } from "@cb/lib/components/ui/table";
import { DefaultTableRow } from "./DefaultTableRow";

interface DefaultTableHeaderProps {
  headers: string[];
}

export const DefaultTableHeader = ({ headers }: DefaultTableHeaderProps) => {
  return (
    <TableHeader className={cn("sticky top-0 w-full shadow-xl")}>
      <DefaultTableRow className={cn("w-full bg-secondary")}>
        {headers.map((header) => (
          <TableHead key={header} className="text-tertiary text-lg">
            {header}
          </TableHead>
        ))}
      </DefaultTableRow>
    </TableHeader>
  );
};
