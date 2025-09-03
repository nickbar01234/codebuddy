import {
  SkelentonWrapperProps,
  SkeletonWrapper,
} from "@cb/components/ui/SkeletonWrapper";
import { DOM, URLS } from "@cb/constants";
import useResource from "@cb/hooks/useResource";
import {
  appendClassIdempotent,
  getQuestionIdFromUrl,
  hideToRoot,
  waitForElement,
} from "@cb/utils";
import React, { useEffect } from "react";

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
      const handleIframeStyle = async (iframeDoc: Document) => {
        waitForElement('button svg[data-icon="sidebar"]', iframeDoc)
          .then((el) => el.closest("button")?.remove())
          .catch(() => {});

        const rowContainer = (await waitForElement("a#\\31 ", iframeDoc))
          .parentNode as Element;
        hideToRoot(rowContainer.parentElement?.parentElement);

        const addButton = async () => {
          const rowList = rowContainer.querySelectorAll("a");
          appendClassIdempotent(rowContainer, ["space-y-1", "mt-4"]);
          for (const anchorContainer of rowList) {
            try {
              const link = anchorContainer.href;
              const questionId = getQuestionIdFromUrl(link);
              if (filterQuestionIds.includes(questionId)) {
                anchorContainer.style.display = "none";
              }

              if (!anchorContainer.hasAttribute(INJECTED_ATTRIBUTE)) {
                anchorContainer.removeAttribute("onclick");
                anchorContainer.addEventListener("click", (e) => {
                  handleQuestionSelect(link);
                  e.preventDefault();
                });
                anchorContainer.setAttribute(INJECTED_ATTRIBUTE, "");
              }
            } catch (e) {
              console.error("Unable to locate question link", e);
            }
          }
        };

        const observer = new MutationObserver(addButton);
        registerObserver("leetcode-table", observer, (obs) => obs.disconnect());
        observer.observe(rowContainer, { childList: true });
        addButton();
      };

      waitForElement(`#${DOM.INJECTED_LEETCODE_PROBLEMSET_IFRAME}`).then(
        (element) => {
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
        }
      );
    }, [handleQuestionSelect, filterQuestionIds, registerObserver]);

    return (
      <SkeletonWrapper
        loading={loading}
        className="w-full h-full"
        {...container}
      >
        <iframe
          src={URLS.PROBLEMSET}
          title="LeetCode Question"
          id={DOM.INJECTED_LEETCODE_PROBLEMSET_IFRAME}
          className="h-full w-full border-2 border-[#78788033]"
          sandbox="allow-scripts allow-same-origin"
        />
      </SkeletonWrapper>
    );
  }
);
