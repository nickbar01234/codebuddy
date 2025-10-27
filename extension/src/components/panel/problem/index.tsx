import { SkeletonWrapper } from "@cb/components/ui/SkeletonWrapper";
import { DOM, EXTENSION } from "@cb/constants";
import { useHtmlActions } from "@cb/hooks/store";
import useResource from "@cb/hooks/useResource";
import { Question } from "@cb/types";
import React, { useEffect } from "react";
import { toast } from "sonner";

const INJECTED_ATTRIBUTE = "data-injected";

interface QuestionSelectorPanelProps {
  handleQuestionSelect: (link: string) => void;
  filterQuestions: Question[];
}

export const QuestionSelectorPanel = React.memo(
  ({ handleQuestionSelect, filterQuestions }: QuestionSelectorPanelProps) => {
    const [loading, setLoading] = React.useState(true);
    const { register: registerObserver } = useResource<MutationObserver>({
      name: "observer",
    });
    const iframeActions = useHtmlActions();

    const onContainerRefCallback = React.useCallback(
      (node: HTMLElement | null) => {
        if (!node) return;

        let lastRect: DOMRect;
        let animationFrameId: number;
        const repositionIframeOnPositionChange = (terminate: boolean) => {
          const rect = node.getBoundingClientRect();
          if (
            !lastRect ||
            rect.top !== lastRect.top ||
            rect.left !== lastRect.left
          ) {
            iframeActions.showHtml(node);
            lastRect = rect;
          }

          if (!terminate) {
            animationFrameId = requestAnimationFrame(() =>
              repositionIframeOnPositionChange(false)
            );
          }
        };

        animationFrameId = requestAnimationFrame(() =>
          repositionIframeOnPositionChange(false)
        );

        const repositionIframeOnPositionChangeOnce = () =>
          repositionIframeOnPositionChange(true);
        window.addEventListener("resize", repositionIframeOnPositionChangeOnce);

        return () => {
          cancelAnimationFrame(animationFrameId);
          window.removeEventListener(
            "resize",
            repositionIframeOnPositionChangeOnce
          );
        };
      },
      [iframeActions]
    );

    useEffect(() => {
      setLoading(true);

      if (iframeActions.isContentProcessed()) {
        setLoading(false);
      }

      const iframe = iframeActions.getHtmlElement();
      if (iframe) {
        const processIframe = async () => {
          const handleIframeStyle = async (iframeDoc: Document) => {
            if (iframeDoc.head.querySelector(`#${DOM.IFRAME_CSS_ID}`) == null) {
              const link = iframeDoc.createElement("link");
              link.rel = "stylesheet";
              link.href = chrome.runtime.getURL(EXTENSION.CSS_PATH);
              link.id = DOM.IFRAME_CSS_ID;
              iframeDoc.head.appendChild(link);
            }

            waitForElement('button svg[data-icon="sidebar"]', iframeDoc)
              .then((el) => el.closest("button")?.remove())
              .catch(() => {});
            waitForElement('svg[data-icon="magnifying-glass"]', iframeDoc)
              .then((element) => element.remove())
              .catch(() => {});

            try {
              const rowContainer = (await waitForElement("a#\\31 ", iframeDoc))
                .parentNode as Element;
              hideToRoot(rowContainer.parentElement?.parentElement);

              const processQuestionLinks = async () => {
                const zebraStripes = [
                  "codebuddy-row-odd",
                  "codebuddy-row-even",
                ];
                const rowList = rowContainer.querySelectorAll("a");
                appendClassIdempotent(rowContainer, ["space-y-1", "mt-4"]);
                for (const anchorContainer of rowList) {
                  anchorContainer.classList.remove(...zebraStripes);
                  try {
                    const link = anchorContainer.href;
                    if (!link) {
                      continue;
                    }
                    const questionId = getQuestionIdFromUrl(link);
                    if (
                      filterQuestions.some(
                        (question) => question.slug === questionId
                      )
                    ) {
                      anchorContainer.style.display = "none";
                    } else {
                      anchorContainer.style.display = "block";
                      const bg = zebraStripes.shift();
                      if (bg != undefined) {
                        appendClassIdempotent(anchorContainer, [bg]);
                        zebraStripes.push(bg);
                      }
                    }

                    if (!anchorContainer.hasAttribute(INJECTED_ATTRIBUTE)) {
                      const originalHref = anchorContainer.href;
                      anchorContainer.removeAttribute("onclick");
                      anchorContainer.addEventListener(
                        "click",
                        (e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          e.stopImmediatePropagation();
                          handleQuestionSelect(originalHref);
                        },
                        true
                      );
                      anchorContainer.style.cursor = "pointer";
                      anchorContainer.setAttribute("role", "button");
                      anchorContainer.setAttribute(INJECTED_ATTRIBUTE, "");
                    }
                  } catch (e) {
                    console.error("Unable to locate question link", e);
                  }
                }
              };

              const observer = new MutationObserver(processQuestionLinks);
              registerObserver("leetcode-table", observer, (obs) =>
                obs.disconnect()
              );
              observer.observe(rowContainer, { childList: true });
              processQuestionLinks();

              iframeActions.setContentProcessed(true);
              setLoading(false);
            } catch (e) {
              console.error("Unable to mount Leetcode iframe", e);
              toast.error(
                "Unable to show question selector, please try again later."
              );
              setLoading(false);
            }
          };

          // Try to process immediately if iframe is loaded, otherwise wait for load event
          const processIframeDocument = async () => {
            const iframeDoc =
              iframe.contentDocument ?? iframe.contentWindow?.document;
            if (iframeDoc) {
              await handleIframeStyle(iframeDoc);
            } else {
              console.error("No iframe document available");
              setLoading(false);
            }
          };

          if (iframeActions.isHtmlLoaded()) {
            await processIframeDocument();
          } else {
            // Set up load event listener
            const onLoad = async () => {
              iframe.removeEventListener("load", onLoad);
              await processIframeDocument();
            };

            iframe.addEventListener("load", onLoad);
          }
        };

        processIframe();
      }

      return () => iframeActions.setContentProcessed(false);
    }, [
      handleQuestionSelect,
      filterQuestions,
      registerObserver,
      iframeActions,
    ]);

    return (
      <SkeletonWrapper loading={loading} className="w-full h-full">
        <div ref={onContainerRefCallback} className="h-full w-full" />
      </SkeletonWrapper>
    );
  }
);
