import { DropdownMenuItem } from "@cb/lib/components/ui/dropdown-menu";
import { cn } from "@cb/utils/cn";

export const RoomControlDropdownMenuItem = ({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuItem>) => {
  return (
    <DropdownMenuItem
      className={cn(
        "cursor-pointer hover:bg-[--color-tab-hover-background] focus:bg-[--color-tab-hover-background]",
        className
      )}
      {...props}
    />
  );
};
