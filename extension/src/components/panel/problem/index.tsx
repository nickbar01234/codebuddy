import {
  SkelentonWrapperProps,
  SkeletonWrapper,
} from "@cb/components/ui/SkeletonWrapper";
import useResource from "@cb/hooks/useResource";
import { useHtml } from "@cb/store/htmlStore";
import React, { useCallback, useEffect } from "react";
import { toast } from "sonner";

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
    const { actions: iframeActions } = useHtml();

    // Callback ref that runs side effects when the container is available
    const problemSetContainerRef = useCallback(
      (node: HTMLDivElement | null) => {
        if (node) {
          iframeActions.showHtmlAtContainer(node);
          let animationFrameId: number;
          // repositioning synchronized with browser frames
          const throttledRepositionIframe = () => {
            if (animationFrameId) {
              cancelAnimationFrame(animationFrameId);
            }
            animationFrameId = requestAnimationFrame(() => {
              // Add a small delay to ensure dialog recentering completes
              requestAnimationFrame(() =>
                iframeActions.showHtmlAtContainer(node)
              );
            });
          };

          // Watch for container size changes
          const resizeObserver = new ResizeObserver(throttledRepositionIframe);
          resizeObserver.observe(node);
          window.addEventListener("resize", throttledRepositionIframe);

          return () => {
            if (animationFrameId) {
              cancelAnimationFrame(animationFrameId);
              resizeObserver.disconnect();
              window.removeEventListener("resize", throttledRepositionIframe);
            }
          };
        }
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
            waitForElement('button svg[data-icon="sidebar"]', iframeDoc)
              .then((el) => el.closest("button")?.remove())
              .catch(() => {});

            try {
              const rowContainer = (await waitForElement("a#\\31 ", iframeDoc))
                .parentNode as Element;
              hideToRoot(rowContainer.parentElement?.parentElement);

              const processQuestionLinks = async () => {
                const rowList = rowContainer.querySelectorAll("a");
                appendClassIdempotent(rowContainer, ["space-y-1", "mt-4"]);
                for (const anchorContainer of rowList) {
                  try {
                    const link = anchorContainer.href;
                    if (!link) {
                      continue;
                    }
                    const questionId = getQuestionIdFromUrl(link);
                    if (filterQuestionIds.includes(questionId)) {
                      anchorContainer.style.display = "none";
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
      filterQuestionIds,
      registerObserver,
      iframeActions,
    ]);

    return (
      <SkeletonWrapper
        loading={loading}
        className="w-full h-full"
        {...container}
      >
        <div ref={problemSetContainerRef} className="h-full w-full" />
      </SkeletonWrapper>
    );
  }
);
