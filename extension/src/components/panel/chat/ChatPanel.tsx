import { SendMessageIcon } from "@cb/components/icons/SendMessageIcon";
import {
  SidebarTabHeader,
  SidebarTabLayout,
} from "@cb/components/panel/info/SidebarTabLayout";
import { useAuthUser, useMessagesActions, useRoomData } from "@cb/hooks/store";
import { usePaginatedMessages } from "@cb/hooks/usePaginatedMessages";
import InfiniteScroll from "@cb/lib/components/ui/InfiniteScroll";
import { Input } from "@cb/lib/components/ui/input";
import { Spinner } from "@cb/lib/components/ui/spinner";
import { SidebarTabIdentifier } from "@cb/store";
import { ChatMessageType } from "@cb/types/db";
import { cn } from "@cb/utils/cn";
import { formatTime } from "@cb/utils/string";
import React from "react";
import { toast } from "sonner";

export const ChatPanel: React.FC<{ roomId: string }> = ({ roomId }) => {
  const { users } = useRoomData();
  const { username } = useAuthUser();
  const { messages, loading, hasNext, loadMore } = usePaginatedMessages();
  const { sendMessage: sendMessageAction } = useMessagesActions();

  const [text, setText] = React.useState("");
  const listRef = React.useRef<HTMLDivElement | null>(null);
  const [scrollRoot, setScrollRoot] = React.useState<HTMLDivElement | null>(
    null
  );
  const shouldAutoScrollRef = React.useRef<boolean>(true);
  const previousScrollHeightRef = React.useRef<number>(0);
  const previousMessageCountRef = React.useRef<number>(0);

  const handleRefChange = React.useCallback((node: HTMLDivElement | null) => {
    listRef.current = node;
    setScrollRoot((prev) => (prev === node ? prev : node));
  }, []);

  React.useEffect(() => {
    if (messages.length > previousMessageCountRef.current) {
      const element = listRef.current;
      if (element) {
        const isNearBottom =
          element.scrollHeight - element.scrollTop - element.clientHeight < 150;

        if (isNearBottom) {
          shouldAutoScrollRef.current = true;
        }
      }
    }
    previousMessageCountRef.current = messages.length;
  }, [messages.length]);

  React.useEffect(() => {
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
  }, [messages]);

  React.useEffect(() => {
    if (!listRef.current || !shouldAutoScrollRef.current) return;

    const element = listRef.current;
    element.scrollTop = element.scrollHeight;
    shouldAutoScrollRef.current = false;
  }, [messages]);

  const sendMessage = React.useCallback(async () => {
    if (text.trim().length === 0) return;
    try {
      await sendMessageAction(roomId, {
        from: username,
        text: text.trim(),
        type: ChatMessageType.USER,
      });
      setText("");
      shouldAutoScrollRef.current = true;
    } catch (err) {
      console.error("Failed to send message", err);
      toast.error("Failed to send message. Please try again.");
    }
  }, [roomId, text, username, sendMessageAction]);

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
          ref={handleRefChange}
          className="flex-1 overflow-y-auto hide-scrollbar flex flex-col gap-5 pr-2 mt-4"
        >
          {loading && messages.length > 0 && (
            <div className="flex justify-center py-2">
              <Spinner className="size-6" />
            </div>
          )}
          <InfiniteScroll
            isLoading={loading}
            hasMore={hasNext}
            next={loadMore}
            threshold={1}
            reverse={true}
            root={scrollRoot}
          >
            {messages.map((m, idx) => {
              if (
                m.type === ChatMessageType.USER_JOINED ||
                m.type === ChatMessageType.USER_LEFT
              ) {
                const actionText =
                  m.type === ChatMessageType.USER_JOINED
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

              if (m.type === ChatMessageType.USER) {
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
              }

              return null;
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
