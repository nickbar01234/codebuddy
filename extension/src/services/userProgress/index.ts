import { LeetCodeStore } from "@cb/store/leetCodeStore";
import {
  ExtractMessage,
  MessagePayload,
  PeerMessage,
  Unsubscribe,
} from "@cb/types";
import { DatabaseService } from "@cb/types/db";

export class UserProgressManager {
  private databaseService: DatabaseService;
  private leetCodeStore: LeetCodeStore;
  private roomId: string;
  private username: string;
  private debounceTimer: NodeJS.Timeout | null = null;
  private subscription: Unsubscribe | null = null;
  private isActive = false;

  constructor(
    databaseService: DatabaseService,
    leetCodeStore: LeetCodeStore,
    roomId: string,
    username: string
  ) {
    this.databaseService = databaseService;
    this.leetCodeStore = leetCodeStore;
    this.roomId = roomId;
    this.username = username;
  }

  async start(): Promise<void> {
    if (this.isActive) return;

    this.isActive = true;
    console.log(
      `Started UserProgressManager for room ${this.roomId}, user ${this.username}`
    );
    this.scheduleAutoSave();
  }

  stop(): void {
    this.isActive = false;

    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }

    if (this.subscription) {
      this.subscription();
      this.subscription = null;
    }
  }

  async saveCurrentProgress(): Promise<void> {
    if (!this.isActive) return;

    try {
      const questionSlug = this.extractQuestionSlug();
      if (!questionSlug) {
        console.log("No active LeetCode question detected");
        return;
      }

      const codeContent = this.extractCodeFromEditor();
      if (!codeContent) {
        console.log("No code content found in editor");
        return;
      }

      const currentProgress = (await this.databaseService.room.getUser(
        this.roomId,
        this.username
      )) || { questions: {} };

      const updatedProgress = {
        ...currentProgress,
        questions: {
          ...currentProgress.questions,
          [questionSlug]: {
            code: codeContent,
            status: "in-progress" as const,
          },
        },
      };

      await this.databaseService.room.setUser(
        this.roomId,
        this.username,
        updatedProgress
      );

      console.log(`Saved progress for question: ${questionSlug}`);
    } catch (error) {
      console.error("Error saving user progress:", error);
    }
  }

  async loadProgress(questionSlug: string): Promise<void> {
    if (!this.isActive) return;

    try {
      const userProgress = await this.databaseService.room.getUser(
        this.roomId,
        this.username
      );

      const questionProgress = userProgress?.questions?.[questionSlug];
      if (questionProgress?.code) {
        console.log(
          `Loaded progress for question: ${questionSlug}`,
          questionProgress
        );
      }
    } catch (error) {
      console.error("Error loading user progress:", error);
    }
  }

  private scheduleAutoSave(): void {
    if (!this.isActive) return;

    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    this.debounceTimer = setTimeout(() => {
      this.saveCurrentProgress();
      if (this.isActive) {
        setTimeout(() => this.scheduleAutoSave(), 5000);
      }
    }, 2000);
  }

  private extractQuestionSlug(): string | null {
    if (typeof window === "undefined") return null;

    const url = window.location.href;
    const match = url.match(/leetcode\.com\/problems\/([^/?]+)/);
    return match ? match[1] : null;
  }
  private extractCodeFromEditor(): MessagePayload<
    ExtractMessage<PeerMessage, "code">
  > | null {
    return this.leetCodeStore.getState().actions.getCodeFromEditor();
  }
}
