import { ROOM } from "@cb/constants";
import { messageQuery } from "@cb/services/db";
import { Identifiable } from "@cb/types";
import { ChatMessage } from "@cb/types/db";
import {
  getDocs,
  limit,
  query,
  QueryDocumentSnapshot,
  startAfter,
} from "firebase/firestore";

export interface MessagePage {
  messages: Array<Identifiable<ChatMessage>>;
  lastDoc?: QueryDocumentSnapshot<ChatMessage>;
  hasMore: boolean;
}

export class MessagePaginationService {
  async fetchMessages(
    roomId: string,
    lastDoc?: QueryDocumentSnapshot<ChatMessage>
  ): Promise<MessagePage> {
    const baseQuery = messageQuery(roomId);
    const q = lastDoc
      ? query(baseQuery, startAfter(lastDoc), limit(ROOM.MESSAGES_PAGE_SIZE))
      : query(baseQuery, limit(ROOM.MESSAGES_PAGE_SIZE));
    const snapshot = await getDocs(q);

    const docs = snapshot.docs.filter((doc) => doc.exists());
    const messages = docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    const reversedMessages = [...messages].reverse();

    return {
      messages: reversedMessages,
      lastDoc: docs.length > 0 ? docs[docs.length - 1] : undefined,
      hasMore: docs.length >= ROOM.MESSAGES_PAGE_SIZE,
    };
  }
}

export const messagePaginationService = new MessagePaginationService();
