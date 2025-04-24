import { MenuIcon } from "@cb/components/icons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@cb/lib/components/ui/dropdown-menu";
import { AppControlMenu as _AppControlMenu } from "./AppControlMenu";
import { RoomControlMenu as _RoomControlMenu } from "./RoomControlMenu";

interface MenuProps {
  children?: React.ReactNode;
}

const Menu = ({ children }: MenuProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <MenuIcon />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="shadow-level3 dark:shadow-dark-level3 border-border-tertiary dark:border-border-tertiary bg-layer-02 dark:bg-layer-02 absolute right-0 top-2 flex w-max flex-col rounded-lg border">
        {children}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export const RoomControlMenu = () => (
  <Menu>
    <_RoomControlMenu />
  </Menu>
);

export const AppControlMenu = () => (
  <Menu>
    <_AppControlMenu />
  </Menu>
);

export default Menu;
