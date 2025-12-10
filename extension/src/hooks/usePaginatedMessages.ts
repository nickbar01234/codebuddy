import { useRoom } from "@cb/store";
import { ChatMessage } from "@cb/types/db";
import React from "react";
import { useShallow } from "zustand/shallow";

const EMPTY_PAGINATED: ChatMessage[] = [];
const EMPTY_LIVE: ChatMessage[] = [];

interface UsePaginatedMessagesReturn {
  messages: ChatMessage[];
  loading: boolean;
  hasNext: boolean;
  loadMore: () => void;
}

export const usePaginatedMessages = (): UsePaginatedMessagesReturn => {
  const messagesData = useRoom(
    useShallow((state) => {
      if (!state.messages) {
        return {
          paginated: EMPTY_PAGINATED,
          live: EMPTY_LIVE,
          loading: false,
          hasNext: false,
        };
      }
      return {
        paginated: state.messages.paginated,
        live: state.messages.live,
        loading: state.messages.loading,
        hasNext: state.messages.hasNext,
      };
    })
  );

  const loadMore = useRoom((state) => state.actions.messages.loadMore);
  const roomId = useRoom((state) => state.room?.id);

  const messages = React.useMemo(
    () => [...messagesData.paginated, ...messagesData.live],
    [messagesData.paginated, messagesData.live]
  );

  const handleLoadMore = React.useCallback(() => {
    if (roomId) {
      loadMore(roomId);
    }
  }, [roomId, loadMore]);

  return React.useMemo(
    () => ({
      messages,
      loading: messagesData.loading,
      hasNext: messagesData.hasNext,
      loadMore: handleLoadMore,
    }),
    [messages, messagesData.loading, messagesData.hasNext, handleLoadMore]
  );
};
