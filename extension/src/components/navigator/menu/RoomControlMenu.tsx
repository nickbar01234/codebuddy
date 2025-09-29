import { SignOutIcon } from "@cb/components/icons";
import { useSignOut } from "@cb/hooks/auth";
import { _AppControlMenu } from "./AppControlMenu";
import { DropdownMenuItem } from "./DropdownMenuItem";
import { Menu } from "./Menu";

export const RoomControlMenu = () => {
  const signout = useSignOut();

  return (
    <Menu>
      <DropdownMenuItem onSelect={signout}>
        <span className="flex items-center gap-2">
          <SignOutIcon /> <span>Sign Out</span>
        </span>
      </DropdownMenuItem>
      <_AppControlMenu />
    </Menu>
  );
};
