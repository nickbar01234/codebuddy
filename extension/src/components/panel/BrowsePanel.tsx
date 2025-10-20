import { baseButtonClassName } from "@cb/components/dialog/RoomDialog";
import { DefaultTable } from "@cb/components/table/DefaultTable";
import { DefaultTableBody } from "@cb/components/table/DefaultTableBody";
import { DefaultTableHeader } from "@cb/components/table/DefaultTableHeader";
import { DefaultTableRow } from "@cb/components/table/DefaultTableRow";
import { Tooltip } from "@cb/components/tooltip";
import { CSS, ROOM } from "@cb/constants";
import { useRoomActions } from "@cb/hooks/store";
import { Button } from "@cb/lib/components/ui/button";
import InfiniteScroll from "@cb/lib/components/ui/InfiniteScroll";
import { Input } from "@cb/lib/components/ui/input";
import { Spinner } from "@cb/lib/components/ui/spinner";
import { TableCell, TableRow } from "@cb/lib/components/ui/table";
import { roomQuery } from "@cb/services/db";
import { throttle } from "lodash";
import { CornerUpLeft } from "lucide-react";
import React from "react";

const HOOK_LIMIT = 100;

export const BrowsePanel = () => {
  const { home } = useRoomActions();
  const { join } = useRoomActions();
  const [inputRoomId, setInputRoomId] = React.useState("");
  const { data, loading, getNext, hasNext } = usePaginate({
    baseQuery: roomQuery,
    hookLimit: HOOK_LIMIT,
  });

  const onJoinRoom = React.useMemo(() => {
    return throttle(
      async (
        reactEvent: React.MouseEvent<Element> | React.KeyboardEvent<Element>,
        roomId: string
      ) => {
        reactEvent.stopPropagation();
        await join(roomId);
      },
      1000
    );
  }, [join]);

  const onChangeRoomIdInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    setInputRoomId(e.target.value);
  };

  return (
    <div className="h-full w-full flex flex-col">
      <div className="w-full flex flex-row-reverse">
        <Tooltip
          trigger={{
            node: <CornerUpLeft className="cursor-pointer" onClick={home} />,
          }}
          content="Home"
        />
      </div>
      <div className="w-full flex flex-col items-center mt-4 gap-3">
        <h2 className="font-bold text-2xl">Join a private room</h2>
        <div className="flex w-full max-w-sm flex-col items-center">
          <div className="flex w-full items-center overflow-hidden rounded-lg border border-[#78788033] dark:border-[#49494E] justify-between">
            <Input
              id="roomId"
              className="w-full rounded-r-none border border-[#787880] py-2 cursor-text px-3 placeholder:text-gray-400 dark:border-[#4A4A4E] dark:bg-[#2A2A2A] border-transparent"
              placeholder="Enter room ID"
              onChange={onChangeRoomIdInput}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  onJoinRoom(e, inputRoomId);
                  return;
                }
              }}
              autoComplete="off"
            />
            <Button
              className={cn(baseButtonClassName, "rounded-l-none")}
              onClick={(e) => onJoinRoom(e, inputRoomId)}
            >
              Join
            </Button>
          </div>
        </div>
      </div>
      <div
        className={cn("mt-8 flex flex-col h-full w-full", {
          "pb-44": loading,
          "pb-36": !loading,
        })}
      >
        <h2 className="font-bold text-2xl self-center">Browse public rooms</h2>
        <DefaultTable loading={false}>
          <DefaultTableHeader
            headers={["Name", "Current Problem", "Difficulty", "Users"]}
          />
          <DefaultTableBody>
            <InfiniteScroll
              isLoading={loading}
              hasMore={hasNext}
              next={getNext}
              threshold={0.8}
            >
              {data.docs.map((room) => {
                const question = room.questions[room.questions.length - 1];
                return (
                  // todo(nickbar01234): How to make rounded?
                  <DefaultTableRow
                    key={room.id}
                    className="cursor-pointer hover:!bg-[--color-button-hover-background]"
                    onClick={(e) => onJoinRoom(e, room.id)}
                  >
                    <TableCell>{room.name}</TableCell>
                    <TableCell>{question.title}</TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          CSS.DIFFICULTY[question.difficulty],
                          "font-medium"
                        )}
                      >
                        {question.difficulty}
                      </span>
                    </TableCell>
                    <TableCell>
                      {room.usernames.length} / {ROOM.CAPACITY}
                    </TableCell>
                  </DefaultTableRow>
                );
              })}
            </InfiniteScroll>
            {loading && (
              <TableRow className="absolute flex justify-center !bg-transparent border-none left-1/2 transform -translate-x-1/2">
                <TableCell className="w-full">
                  <Spinner className="size-8" />
                </TableCell>
              </TableRow>
            )}
          </DefaultTableBody>
        </DefaultTable>
      </div>
    </div>
  );
};
