import { SendMessageIcon } from "@cb/components/icons/SendMessageIcon";
import {
  SidebarTabHeader,
  SidebarTabLayout,
} from "@cb/components/panel/info/SidebarTabLayout";
import { useAuthUser, useRoomData } from "@cb/hooks/store";
import usePaginate from "@cb/hooks/usePaginate";
import InfiniteScroll from "@cb/lib/components/ui/InfiniteScroll";
import { Input } from "@cb/lib/components/ui/input";
import { Spinner } from "@cb/lib/components/ui/spinner";
import db, { messageQuery } from "@cb/services/db";
import { SidebarTabIdentifier } from "@cb/store";
import { MessageType, type Message } from "@cb/types/db";
import { cn } from "@cb/utils/cn";
import { Timestamp } from "firebase/firestore";
import React from "react";
import { toast } from "sonner";

const HOOK_LIMIT = 20;

export const ChatPanel: React.FC<{ roomId: string }> = ({ roomId }) => {
  const { users } = useRoomData();
  const { username } = useAuthUser();

  const [text, setText] = React.useState("");
  const listRef = React.useRef<HTMLDivElement | null>(null);
  const [scrollContainer, setScrollContainer] =
    React.useState<HTMLDivElement | null>(null);
  const shouldAutoScrollRef = React.useRef<boolean>(true);
  const previousScrollHeightRef = React.useRef<number>(0);
  const [newMessages, setNewMessages] = React.useState<Message[]>([]);
  const [newestTimestamp, setNewestTimestamp] =
    React.useState<Timestamp | null>(null);

  const setListRef = (node: HTMLDivElement | null) => {
    listRef.current = node;
    setScrollContainer(node);
  };

  const { data, loading, getNext, hasNext } = usePaginate<Message>({
    baseQuery: messageQuery(roomId),
    hookLimit: HOOK_LIMIT,
    reverse: true,
  });

  React.useEffect(() => {
    if (data.docs.length > 0) {
      const newest = data.docs[data.docs.length - 1];
      if (newest?.createdAt) {
        setNewestTimestamp(newest.createdAt);
      }
    } else {
      setNewestTimestamp(null);
    }

    if (!listRef.current) return;

    const element = listRef.current;
    const currentScrollHeight = element.scrollHeight;
    const previousScrollHeight = previousScrollHeightRef.current;

    if (
      previousScrollHeight > 0 &&
      currentScrollHeight > previousScrollHeight
    ) {
      const scrollDiff = currentScrollHeight - previousScrollHeight;
      element.scrollTop = element.scrollTop + scrollDiff;
    }

    previousScrollHeightRef.current = currentScrollHeight;
  }, [data.docs]);

  React.useEffect(() => {
    if (loading && data.docs.length === 0) {
      return;
    }
    const unsubscribe = db.room.observeMessages(
      roomId,
      {
        onAdded: (msg) => {
          setNewMessages((prev) => [...prev, msg]);
          shouldAutoScrollRef.current = true;
        },
        onModified: () => {},
        onDeleted: () => {},
      },
      newestTimestamp || undefined
    );
    return () => unsubscribe();
  }, [roomId, newestTimestamp, loading, data.docs.length]);

  const allMessages = React.useMemo<Message[]>(() => {
    return [...data.docs, ...newMessages];
  }, [data.docs, newMessages]);

  React.useEffect(() => {
    if (!listRef.current || !shouldAutoScrollRef.current) return;

    const element = listRef.current;
    element.scrollTop = element.scrollHeight;
    shouldAutoScrollRef.current = false;
  }, [newMessages]);

  const sendMessage = React.useCallback(async () => {
    if (text.trim().length === 0) return;
    try {
      await db.room.addMessage(roomId, {
        from: username,
        text: text.trim(),
        type: MessageType.USER,
      });
      setText("");
      shouldAutoScrollRef.current = true;
    } catch (err) {
      console.error("Failed to send message", err);
      toast.error("Failed to send message. Please try again.");
    }
  }, [roomId, text, username]);

  const onKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    },
    [sendMessage]
  );

  const getUserColorClass = React.useCallback(
    (user: string) => {
      const meta = users.find((u) => u.user === user);
      return meta?.css.icon ?? undefined;
    },
    [users]
  );

  return (
    <SidebarTabLayout forTab={SidebarTabIdentifier.ROOM_CHAT}>
      <div className="h-full w-full flex flex-col gap-3">
        <SidebarTabHeader>
          <div className="text-2xl font-semibold text-foreground">
            Activity Log
          </div>
        </SidebarTabHeader>
        <div
          ref={setListRef}
          className="flex-1 overflow-y-auto hide-scrollbar flex flex-col gap-5 pr-2 mt-4"
        >
          {loading && data.docs.length > 0 && (
            <div className="flex justify-center py-2">
              <Spinner className="size-6" />
            </div>
          )}
          <InfiniteScroll
            isLoading={loading}
            hasMore={hasNext}
            next={getNext}
            threshold={1}
            reverse={true}
            root={scrollContainer}
          >
            {allMessages.map((m, idx) => {
              const isSystemMessage =
                m.type === MessageType.USER_JOINED ||
                m.type === MessageType.USER_LEFT;

              if (isSystemMessage) {
                const actionText =
                  m.type === MessageType.USER_JOINED
                    ? " just joined the room"
                    : " just left the room";

                return (
                  <div
                    key={idx}
                    className="text-center italic text-muted-foreground"
                  >
                    <span className="font-bold">{m.from}</span>
                    {actionText}
                  </div>
                );
              }

              return (
                <div key={idx} className="flex flex-col gap-1">
                  <div className="text-medium">
                    <span
                      className={cn("font-bold", getUserColorClass(m.from))}
                    >
                      {m.from}
                    </span>
                    <span className="text-[#9E9E9E] ml-2">
                      {formatTime(m.createdAt)}
                    </span>
                  </div>
                  <div className="whitespace-pre-wrap break-words">
                    {m.text}
                  </div>
                </div>
              );
            })}
          </InfiniteScroll>
        </div>
        <div className="relative">
          <Input
            placeholder="Enter message..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={onKeyDown}
            className="pr-10"
          />
          <button
            aria-label="Send message"
            onClick={sendMessage}
            disabled={!roomId || text.trim().length === 0}
            className={cn(
              "absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-md",
              "hover:bg-[--color-button-hover-background] disabled:opacity-50"
            )}
          >
            <SendMessageIcon />
          </button>
        </div>
      </div>
    </SidebarTabLayout>
  );
};
