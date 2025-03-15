import React from "react";
import { useOnMount } from "@cb/hooks";
import { waitForElement } from "@cb/utils";

export default function QuestionSelector() {
  useOnMount(() => {
    waitForElement("#leetcode_question", 2000).then((element) => {
      const iframe = element as HTMLIFrameElement;

      iframe.onload = async () => {
        const iframeDoc =
          iframe.contentDocument ?? iframe.contentWindow?.document;
        if (iframeDoc) {
          waitForElement(
            "div[role='rowgroup']",
            3000,
            iframeDoc as Document
          ).then((element) => {
            const style = document.createElement("style");
            style.textContent = "a { pointer-events: none; }";
            iframeDoc.head.appendChild(style);

            const listOfTable = iframeDoc.querySelectorAll(
              "div[role='table']"
            ) as NodeListOf<HTMLDivElement>;
            const table = listOfTable[2];

            const grandParent = table?.parentElement?.parentElement;

            if (grandParent) {
              let current: HTMLElement | null = grandParent;
              while (current) {
                current.style.display = "block";

                if (current.parentElement) {
                  Array.from(current.parentElement.children).forEach(
                    (sibling) => {
                      if (sibling !== current) {
                        (sibling as HTMLElement).style.display = "none";
                      }
                    }
                  );
                }

                current = current.parentElement;
              }
            }

            const questions = iframeDoc.querySelectorAll(
              "div[role='row']"
            ) as NodeListOf<HTMLDivElement>;
            if (questions != null) {
              for (let i = 0; i < questions.length; i++) {
                waitForElement(
                  "a",
                  3000,
                  questions[i] as unknown as Document
                ).then((element) => {
                  const link = questions[i].querySelector("a");
                  if (link) {
                    const questionTitle = link as HTMLAnchorElement;

                    const plusIcon = document.createElement("span");
                    plusIcon.innerHTML = "+";
                    plusIcon.style.position = "absolute";
                    plusIcon.style.left = "25px";
                    plusIcon.style.top = "50%";
                    plusIcon.style.transform = "translateY(-50%)";
                    plusIcon.style.marginLeft = "8px";
                    plusIcon.style.cursor = "pointer";
                    plusIcon.style.fontSize = "20px";
                    plusIcon.style.fontWeight = "bold";
                    questions[i].style.position = "relative";
                    questions[i].prepend(plusIcon);

                    questions[i].addEventListener("click", (e) => {
                      console.log(questionTitle.href);
                    });
                  }
                });
              }
            }
          });
        }
      };
    });
  });
  return (
    <iframe
      src="https://leetcode.com/problemset/"
      title="LeetCode Question"
      id="leetcode_question"
      className="z-100 h-full w-full"
      sandbox="allow-scripts allow-same-origin"
    />
  );
}
