import { Button } from "@cb/lib/components/ui/button";

export const RenderButton = ({
  label,
  onClick,
}: {
  label: string;
  isYes?: boolean;
  onClick: () => void;
}) => {
  return (
    <Button
      type="button"
      onClick={onClick}
      className="flex items-center justify-center px-4 w-full rounded-md  py-2 font-medium text-base transition text-[#1E1E1E] dark:text-[#FFFFFF] hover:bg-[--color-button-hover-background] bg-[--color-button-background] dark:hover:bg-[--color-button-hover-background] dark:bg-[--color-button-background]"
    >
      {label}
    </Button>
  );
};
