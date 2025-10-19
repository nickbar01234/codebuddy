import { Tooltip } from "@cb/components/tooltip";
import { useRoomActions } from "@cb/hooks/store";
import { CornerUpLeft } from "lucide-react";

export const BrowsePanel = () => {
  const { home } = useRoomActions();

  return (
    <div className="h-full w-full">
      <div className="w-full flex flex-row-reverse">
        <Tooltip
          trigger={{
            node: <CornerUpLeft className="cursor-pointer" onClick={home} />,
          }}
          content="Home"
        />
      </div>
    </div>
  );
};
