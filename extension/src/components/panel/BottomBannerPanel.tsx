import { useAppActions, useAppPreference } from "@cb/hooks/store";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@cb/lib/components/ui/alert";
import { X } from "lucide-react";

interface BottomBannerPanelProps {
  children?: React.ReactNode;
}

export const BottomBannerPanel = ({ children }: BottomBannerPanelProps) => {
  const { displayBanner } = useAppPreference();
  const { hideBanner } = useAppActions({});

  return (
    <div className="relative h-full w-full">
      {children}
      <div
        className={cn("absolute bottom-4 shadow-lg w-full px-2 z-[2000]", {
          hidden: !displayBanner,
        })}
      >
        <Alert className="bg-primary">
          <div className="w-full flex justify-between">
            <AlertTitle className="text-lg">
              CodeBuddy is in beta release!
            </AlertTitle>
            <X
              className="cursor-pointer self-start"
              size={14}
              onClick={hideBanner}
            />
          </div>
          <AlertDescription className="text-secondary">
            <p>Having issues? Try refreshing your browser.</p>
            <p>
              Got feedback, bug reports, or feature requests? We would love to
              hear from you{" "}
              <a
                href="https://forms.gle/6L1VDHzcGhpEC1Xb9"
                className="font-medium text-primary underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                here
              </a>
              ! You can also submit feedback anytime from the menu in the
              top-right corner.
            </p>
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
};
