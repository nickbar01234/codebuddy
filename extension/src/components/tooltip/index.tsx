import {
  TooltipContent,
  Tooltip as TooltipImpl,
  TooltipProvider,
  TooltipTrigger,
} from "@cb/lib/components/ui/tooltip";

interface ToolTipProps {
  trigger: {
    props?: React.ComponentProps<typeof TooltipTrigger>;
    node: React.ReactNode;
  };
  content?: React.ReactNode;
}

export const Tooltip = ({ trigger, content }: ToolTipProps) => {
  return (
    <TooltipProvider>
      <TooltipImpl>
        <TooltipTrigger {...(trigger.props ?? {})} asChild>
          {trigger.node}
        </TooltipTrigger>
        <TooltipContent hidden={content == undefined} className="bg-primary">
          {content}
        </TooltipContent>
      </TooltipImpl>
    </TooltipProvider>
  );
};
