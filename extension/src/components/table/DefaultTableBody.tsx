import { TableBody, TableRow } from "@cb/lib/components/ui/table";

interface DefaultTableBodyProps {
  children?: React.ReactNode;
}

export const DefaultTableBody = ({ children }: DefaultTableBodyProps) => {
  return (
    <TableBody className="[&>tr:nth-child(odd)]:bg-quaternary before:block before:h-4 before:content-['']">
      {children}
      {/* Extra padding at the end to prevent rows from being cut off */}
      <TableRow />
    </TableBody>
  );
};
