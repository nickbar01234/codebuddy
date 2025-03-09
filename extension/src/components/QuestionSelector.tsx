import React from 'react';
import { useOnMount } from '@cb/hooks';
import { waitForElement } from '@cb/utils';

export default function QuestionSelector() {
    const [question, setQuestion] = React.useState<string>("");

    useOnMount(() => {
    console.log("mounted");
    waitForElement("#leetcode_question", 2000).then((element) => {
    const iframe =  element as HTMLIFrameElement;
    console.log(iframe);
    iframe.onload = () => {
        iframe.contentDocument?.addEventListener("click", (e) => {
            console.log("clicked");
        }
        );
        const questions = iframe.contentDocument?.querySelectorAll('[role="row"]') as unknown as NodeListOf<HTMLDivElement>;
        if (questions != null) {
            for (let i = 0; i < questions.length; i++) {
                questions[i].addEventListener("click", (e) => {
                    console.log("clicked");
                    const question = e.target as HTMLDivElement;
                    const questionTitle = question.querySelector('a') as HTMLAnchorElement;
                    console.log(questionTitle.href);
                }
                );
            }
        }
    }
    });
    });
    return (
        <iframe 
        src="https://leetcode.com/problemset/"
        title="LeetCode Question"
        id = "leetcode_question"
        className="w-full h-full border-none overflow-auto z-100"
           sandbox="allow-scripts allow-same-origin"
        >
        </iframe>
    )
}
