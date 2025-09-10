import { TableBody } from "@cb/lib/components/ui/table";

interface DefaultTableBodyProps {
  children?: React.ReactNode;
}

export const DefaultTableBody = ({ children }: DefaultTableBodyProps) => {
  return (
    <TableBody className="[&>tr:nth-child(odd)]:bg-quaternary">
      {children}
    </TableBody>
  );
};
