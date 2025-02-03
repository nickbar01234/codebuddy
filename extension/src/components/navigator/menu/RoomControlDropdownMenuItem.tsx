import { DropdownMenuItem } from "@cb/lib/components/ui/dropdown-menu";
import { cn } from "@cb/utils/cn";

interface RoomControlDropdownMenuItemProps
  extends React.ComponentProps<typeof DropdownMenuItem> {}

export const RoomControlDropdownMenuItem = ({
  className,
  ...props
}: RoomControlDropdownMenuItemProps) => {
  return (
    <DropdownMenuItem
      className={cn(
        "focus:bg-[--color-tab-hover-background] hover:bg-[--color-tab-hover-background] cursor-pointer",
        className
      )}
      {...props}
    />
  );
};
