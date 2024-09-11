import { Compare } from "@cb/components/ui/Compare";
import { HyperText } from "@cb/components/ui/HyperText";

export function HomePanel() {
  return (
    <div className="p-4 flex flex-col justify-center items-center border rounded-3xl dark:bg-neutral-900 bg-neutral-100  border-neutral-200 dark:border-neutral-800 ">
      <HyperText text="Code Buddy" />
      <Compare
        firstImage="https://miro.medium.com/v2/resize:fit:1400/format:webp/1*DA39FTD8-BNlfJu3kGMSsQ.png"
        secondImage="https://miro.medium.com/v2/resize:fit:1400/format:webp/1*EKeb_lwFZKi3ht-0N8_Diw.png"
        firstImageClassName="object-cover object-left-top"
        secondImageClassname="object-cover object-left-top"
        slideMode="hover"
      />{" "}
      <h2 className="mt-[.5rem] text-[1rem]">
        Let's begin with the <span className="text-[#5046e6]">Top Button</span>
      </h2>
    </div>
  );
}
