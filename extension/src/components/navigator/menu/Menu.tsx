import { MenuIcon } from "@cb/components/icons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@cb/lib/components/ui/dropdown-menu";
import { defaultTo as d } from "@cb/utils";

interface MenuProps {
  children?: React.ReactNode;
  trigger?: {
    props?: React.ComponentProps<typeof DropdownMenuTrigger>;
    node?: React.ReactNode;
    customTrigger?: boolean;
  };
}

export const Menu = ({ children, trigger }: MenuProps) => {
  return (
    <DropdownMenu>
      {trigger?.customTrigger ? (
        trigger.node
      ) : (
        <DropdownMenuTrigger {...d(trigger?.props, {})}>
          {trigger?.node ?? <MenuIcon />}
        </DropdownMenuTrigger>
      )}
      <DropdownMenuContent
        className="shadow-level3 dark:shadow-dark-level3 border-border-tertiary dark:border-border-tertiary bg-layer-02 dark:bg-layer-02 absolute right-0 top-2 flex w-max flex-col rounded-lg border"
        align="end"
      >
        {children}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
