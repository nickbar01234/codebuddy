import { TableHead, TableHeader, TableRow } from "@cb/lib/components/ui/table";

interface DefaultTableHeaderProps {
  headers: string[];
}

export const DefaultTableHeader = ({ headers }: DefaultTableHeaderProps) => {
  return (
    <TableHeader className="text-secondary">
      <TableRow className={cn("border-none")}>
        {headers.map((header) => (
          <TableHead key={header} className="text-tertiary text-lg">
            {header}
          </TableHead>
        ))}
      </TableRow>
    </TableHeader>
  );
};
