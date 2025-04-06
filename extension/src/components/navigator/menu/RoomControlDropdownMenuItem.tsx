import { DropdownMenuItem } from "@cb/lib/components/ui/dropdown-menu";
import { cn } from "@cb/utils/cn";

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface RoomControlDropdownMenuItemProps
  extends React.ComponentProps<typeof DropdownMenuItem> {}

export const RoomControlDropdownMenuItem = ({
  className,
  ...props
}: RoomControlDropdownMenuItemProps) => {
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
