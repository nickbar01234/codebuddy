import { DropdownMenuItem as DropdownMenuItemInternal } from "@cb/lib/components/ui/dropdown-menu";
import { cn } from "@cb/utils/cn";

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface DropdownMenuItemProps
  extends React.ComponentProps<typeof DropdownMenuItemInternal> {}

export const DropdownMenuItem = ({
  className,
  ...props
}: DropdownMenuItemProps) => {
  return (
    <DropdownMenuItemInternal
      className={cn(
        "cursor-pointer hover:bg-[--color-tab-hover-background] focus:bg-[--color-tab-hover-background]",
        className
      )}
      {...props}
    />
  );
};
