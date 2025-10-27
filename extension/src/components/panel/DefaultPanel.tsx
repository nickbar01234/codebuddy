import { ThemeAwaredLogo } from "@cb/components/icons/ThemeAwaredLogo";

interface DefaultPanelProps {
  children?: React.ReactNode;
}

export const DefaultPanel = ({ children }: DefaultPanelProps) => {
  return (
    <div className="bg-secondary hide-scrollbar flex h-full w-full flex-col gap-10 overflow-x-auto justify-center mr-4">
      <div className="flex min-w-max flex-col items-center justify-end gap-3">
        <ThemeAwaredLogo
          containerProps={{
            className: "aspect-square h-[100px] w-[100px]",
          }}
        />
        <h1 className="text-2xl">
          Code<span className="text-codebuddy-pink">Buddy</span>
        </h1>
      </div>
      {children}
    </div>
  );
};
