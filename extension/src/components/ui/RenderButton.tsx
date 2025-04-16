import { Button } from "@cb/lib/components/ui/button";
import { cn } from "@cb/utils/cn";

export const RenderButton = ({
  label,
  onClick,
  isYes = false,
}: {
  label: string;
  isYes?: boolean;
  onClick: () => void;
}) => {
  return (
    <Button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center justify-center rounded-lg px-4 py-2 transition-colors",
        {
          "bg-blue-600 text-white hover:bg-blue-700": isYes,
          "bg-gray-300 text-gray-700 hover:bg-gray-400 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600":
            !isYes,
        }
      )}
    >
      {label}
    </Button>
  );
};
