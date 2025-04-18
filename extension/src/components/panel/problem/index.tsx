import {
  SkelentonWrapperProps,
  SkeletonWrapper,
} from "@cb/components/ui/SkeletonWrapper";
import {
  disablePointerEvents,
  getQuestionIdFromUrl,
  hideToRoot,
  waitForElement,
} from "@cb/utils";
import React, { useEffect } from "react";
import { createRoot } from "react-dom/client";
import { SelectQuestionButton } from "./SelectProblemButton";

// We can afford to wait for a bit longer, since it's unlikely that user will complete question that quickly.
const TIMEOUT = 10_000;

interface QuestionSelectorPanelProps {
  handleQuestionSelect: (link: string) => void;
  pastQuestionsId: string[];
  container?: Omit<SkelentonWrapperProps, "loading">;
}
//run useEffect when the entire iframedoc is finished loading
export const QuestionSelectorPanel = React.memo(
  ({
    handleQuestionSelect,
    pastQuestionsId,
    container = {},
  }: QuestionSelectorPanelProps) => {
    const [loading, setLoading] = React.useState(true);
    useEffect(() => {
      let timeOut: ReturnType<typeof setTimeout>;
      const handleIframeStyle = async (iframeDoc: Document) => {
        disablePointerEvents(iframeDoc);

        // A collection of questions - for some reason, leetcode has empty tables
        const table = await waitForElement(
          "div[role='table']:nth-child(1)",
          TIMEOUT,
          iframeDoc
        );
        hideToRoot(table);
        const rows = await waitForElement(
          "div[role='rowgroup']",
          TIMEOUT,
          table as unknown as Document
        );
        // The order currently: status, title, solution, acceptance, difficulty, frequency

        const rowList = rows?.querySelectorAll("div[role='row']") ?? [];
        timeOut = setTimeout(async () => {
          for (const question of rowList) {
            try {
              // Technically, the selector can either match on status (if daily question) or title -- in either cases,
              // we have the link to the actual problem
              const link = (await waitForElement(
                "div[role='cell'] a",
                TIMEOUT,
                question as unknown as Document
              )) as HTMLAnchorElement;

              const currQuestionId = getQuestionIdFromUrl(link.href);
              if (currQuestionId && pastQuestionsId.includes(currQuestionId)) {
                console.log("past question Id", pastQuestionsId);
                try {
                  rows.removeChild(question);
                  console.log("remove ok", question);
                  return;
                } catch (error) {
                  console.log("cannot remove", error);
                }
              }
              const injected = iframeDoc.createElement("span");
              question.append(injected);

              createRoot(injected).render(
                <SelectQuestionButton
                  onClick={() => {
                    // Handle the question select
                    handleQuestionSelect(link.href);
                    // Prevent further action
                    return;
                  }}
                />
              );
            } catch {
              // If no link exist, there's no point in displaying the question
              rows.removeChild(question);
            }
          }
        }, 5000);

        waitForElement(
          "div[role='columnheader']:first-child",
          TIMEOUT,
          iframeDoc
        ).then((element) => {
          // todo(nickbar01234): Append an empty cell to make padding somewhat consistent... we should fix this styling
          const cloned = element.cloneNode(true);
          (cloned as HTMLElement).style.visibility = "hidden";
          element.parentNode?.appendChild(cloned);
        });
      };

      waitForElement("#leetcode_question", TIMEOUT).then((element) => {
        const iframe = element as HTMLIFrameElement;
        iframe.onload = async () => {
          const iframeDoc =
            iframe.contentDocument ?? iframe.contentWindow?.document;
          if (iframeDoc != undefined) {
            handleIframeStyle(iframeDoc)
              .then(() => {
                setLoading(false);
                console.log("Leetcode iframe mounted successfully");
              })
              .catch((e) => {
                console.error("Unable to mount Leetcode iframe", e);
              });
          }
        };
      });
      return () => {
        clearTimeout(timeOut);
      };
    }, [pastQuestionsId, handleQuestionSelect]);

    return (
      <SkeletonWrapper
        loading={loading}
        className="w-full h-full"
        {...container}
      >
        <iframe
          src="https://leetcode.com/problemset/"
          title="LeetCode Question"
          id="leetcode_question"
          className="h-full w-full border-2 border-[#78788033]"
          sandbox="allow-scripts allow-same-origin"
        />
      </SkeletonWrapper>
    );
  }
);
