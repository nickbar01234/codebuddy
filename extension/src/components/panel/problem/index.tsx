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

const INJECTED_ATTRIBUTE = "data-injected";

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
      const devMode = import.meta.env.MODE === "development";
      const mode = devMode ? "true" : "false";

      const handleIframeStyle = async (iframeDoc: Document) => {
        const table = await factory[mode].table(iframeDoc);
        hideToRoot(table!.parentElement?.parentElement as Element);
        const problemContainer = await factory[mode].problemContainer(
          table as Document
        );

        const addButton = async () => {
          const rowList =
            factory[mode].rowList(problemContainer as Document) ?? [];
          for (const question of rowList) {
            const target = (await factory[mode].target(
              question
            )) as HTMLElement;
            try {
              target.style.marginBottom = "3px";
              const anchor = (
                devMode
                  ? await waitForElement(
                      "div[role='cell'] a",
                      TIMEOUT,
                      question as unknown as Document
                    )
                  : question
              ) as HTMLAnchorElement;
              const link = anchor.href;
              const questionId = getQuestionIdFromUrl(link);
              if (filterQuestionIds?.includes(questionId)) {
                try {
                  problemContainer!.removeChild(target);
                  return;
                } catch (error) {
                  console.log("cannot remove", error);
                }
              }
              const buttonId = generateId(`question-selector`);
              const oldBtn = target.querySelector(
                `span[${INJECTED_ATTRIBUTE}=${buttonId}]`
              );
              if (oldBtn && devMode) {
                oldBtn.remove();
              } else {
                const injected = document.createElement("span");
                injected.setAttribute(INJECTED_ATTRIBUTE, buttonId);
                target.appendChild(injected);

                createRoot(injected).render(
                  <SelectQuestionButton
                    id={link}
                    onClick={() => {
                      // Handle the question select
                      handleQuestionSelect(link);
                      console.log("Selected question:", link);
                      // Prevent further action
                      return;
                    }}
                  />
                );
              }
            } catch (e) {
              console.error("Unable to locate question link", e);
              // If no link exist, there's no point in displaying the question
              problemContainer!.removeChild(target);
            }
          }
        };
        disablePointerEvents(iframeDoc);
        if (devMode) {
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
        } else {
          addButton(); //don't know why in the new UI, the observer is not triggered in the first load so I have to call it manually. The observer still trigger on scrolling tho
        }
        const observer = new MutationObserver(addButton);
        registerObserver("leetcode-table", observer, (obs) => obs.disconnect());
        observer.observe(problemContainer!, { childList: true });
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
    }, [handleQuestionSelect, filterQuestionIds, registerObserver]);

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
const factory = {
  true: {
    table: async (iframeDoc: Document) =>
      await waitForElement(
        "div[role='table']:nth-child(1)",
        TIMEOUT,
        iframeDoc
      ),
    problemContainer: async (table: Document) =>
      await waitForElement("div[role='rowgroup']", TIMEOUT, table),
    rowList: (problemContainer: Document) =>
      problemContainer.querySelectorAll("div[role='row']"),
    anchor: async (question: Element) =>
      await waitForElement(
        "div[role='cell'] a",
        TIMEOUT,
        question as unknown as Document
      ),
    target: async (question: Element) => question,
  },
  false: {
    table: async (iframeDoc: Document) =>
      (await waitForElement("a#\\31 ", TIMEOUT, iframeDoc)).parentNode,
    problemContainer: async (table: Document) => table,
    rowList: (problemContainer: Document) =>
      problemContainer.querySelectorAll("a"),
    anchor: async (question: Element) => question,
    target: async (question: Element) => {
      const divWrapper = document.createElement("div");
      divWrapper.className = question.className;
      divWrapper.innerHTML = question.innerHTML;
      divWrapper.style.cssText = (question as HTMLElement).style.cssText;
      [...question.attributes].forEach((attr) => {
        if (attr.name.startsWith("data-")) {
          divWrapper.setAttribute(attr.name, attr.value);
        }
      });
      if (question.parentNode) {
        question.parentNode.replaceChild(divWrapper, question);
      }
      return divWrapper.childNodes[0] as HTMLElement;
    },
  },
};
