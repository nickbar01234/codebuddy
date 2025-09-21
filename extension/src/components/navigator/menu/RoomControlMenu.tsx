import { CopyIcon, SignOutIcon } from "@cb/components/icons";
import { useSignOut } from "@cb/hooks/auth";
import { RoomStatus, useRoom } from "@cb/store";
import { _AppControlMenu } from "./AppControlMenu";
import { DropdownMenuItem } from "./DropdownMenuItem";
import { Menu } from "./Menu";

export const RoomControlMenu = () => {
  const roomStatus = useRoom((state) => state.status);
  const signout = useSignOut();
  const copyRoomId = useCopyRoomId();

  return (
    <Menu>
      {roomStatus === RoomStatus.IN_ROOM && (
        <>
          <DropdownMenuItem onSelect={() => copyRoomId()}>
            <span className="flex items-center gap-2">
              <CopyIcon /> Copy Room ID
            </span>
          </DropdownMenuItem>
        </>
      )}
      <DropdownMenuItem onSelect={signout}>
        <span className="flex items-center gap-2">
          <SignOutIcon /> <span>Sign Out</span>
        </span>
      </DropdownMenuItem>
      <_AppControlMenu />
    </Menu>
  );
};
