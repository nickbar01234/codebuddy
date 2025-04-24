import {
  SkelentonWrapperProps,
  SkeletonWrapper,
} from "@cb/components/ui/SkeletonWrapper";
import useResource from "@cb/hooks/useResource";
import {
  disablePointerEvents,
  generateId,
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
  filterQuestionIds: string[];
  container?: Omit<SkelentonWrapperProps, "loading">;
}

export const QuestionSelectorPanel = React.memo(
  ({
    handleQuestionSelect,
    filterQuestionIds,
    container = {},
  }: QuestionSelectorPanelProps) => {
    const [loading, setLoading] = React.useState(true);
    const { register: registerObserver } = useResource<MutationObserver>({
      name: "observer",
    });

    useEffect(() => {
      const handleIframeStyleDevMode = async (iframeDoc: Document) => {
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
        const observer = new MutationObserver(async () => {
          const rowList = rows?.querySelectorAll("div[role='row']") ?? [];
          for (const question of rowList) {
            try {
              // Technically, the selector can either match on status (if daily question) or title -- in either cases,
              // we have the link to the actual problem
              const link = (await waitForElement(
                "div[role='cell'] a",
                TIMEOUT,
                question as unknown as Document
              )) as HTMLAnchorElement;

              const questionId = getQuestionIdFromUrl(link.href);
              const buttonId = generateId(`select-question-btn-${questionId}`);
              const oldBtn = question.querySelector(`#${buttonId}`);
              if (oldBtn) oldBtn.remove();

              if (filterQuestionIds?.includes(questionId)) {
                try {
                  rows.removeChild(question);
                  return;
                } catch (error) {
                  console.log("cannot remove", error);
                }
              }

              const injected = iframeDoc.createElement("span");
              injected.id = buttonId;
              question.append(injected);

              createRoot(injected).render(
                <SelectQuestionButton
                  id={link.href}
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
        });

        registerObserver("leetcode-table", observer, (obs) => obs.disconnect());
        observer.observe(rows, { childList: true });
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

      const handleIframeStyleProdMode = async (iframeDoc: Document) => {
        disablePointerEvents(iframeDoc);
        const firstQuestion = await waitForElement(
          "a#\\31 ",
          TIMEOUT,
          iframeDoc
        );

        const problemContainer = firstQuestion.parentNode;
        if (problemContainer == null) {
          console.error("Unable to locate problem container");
          return;
        }
        hideToRoot(problemContainer as Element);
        const observer = new MutationObserver(async () => {
          console.log("mutation");
          const rowList = problemContainer?.querySelectorAll("a") ?? [];
          for (const question of rowList) {
            try {
              // Technically, the selector can either match on status (if daily question) or title -- in either cases,
              // we have the link to the actual problem
              const link = question.href;
              const idTag = question.id;
              const questionId = getQuestionIdFromUrl(link);

              if (
                filterQuestionIds?.includes(questionId) ||
                (idTag && !isNaN(Number(idTag)))
              ) {
                try {
                  problemContainer.removeChild(question);
                  return;
                } catch (error) {
                  console.log("cannot remove", error);
                }
              }

              const injected = iframeDoc.createElement("span");
              injected.id = generateId(`select-question-btn-${questionId}`);
              question.append(injected);

              createRoot(injected).render(
                <SelectQuestionButton
                  id={link}
                  onClick={() => {
                    // Handle the question select
                    handleQuestionSelect(link);
                    // Prevent further action
                    return;
                  }}
                />
              );
            } catch {
              // If no link exist, there's no point in displaying the question
              problemContainer.removeChild(question);
            }
          }
        });
        registerObserver("leetcode-table", observer, (obs) => obs.disconnect());
        observer.observe(problemContainer, { childList: true });

        console.log("problemContainer", problemContainer);
      };
      const handleIframeStyle = async (iframeDoc: Document) => {
        if (import.meta.env.MODE === "development") {
          await handleIframeStyleDevMode(iframeDoc);
        } else {
          await handleIframeStyleProdMode(iframeDoc);
        }
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
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [handleQuestionSelect, filterQuestionIds]);

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
