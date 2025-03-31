import { cn } from "@cb/utils/cn";

export const darkLogo = chrome.runtime.getURL("images/logo_dark.png");
export const lightLogo = chrome.runtime.getURL("images/logo_light.png");

interface ThemeAwaredLogoProps {
  className?: string;
  darkLogoPath?: string;
  lightLogoPath?: string;
}

export const ThemeAwaredLogo = ({
  className = "",
  darkLogoPath = darkLogo,
  lightLogoPath = lightLogo,
}: ThemeAwaredLogoProps) => {
  return (
    <>
      <img
        src={lightLogoPath}
        className={cn("dark:hidden", className)}
        alt="CodeBuddy logo"
      />
      <img
        src={darkLogoPath}
        className={cn("hidden dark:block", className)}
        alt="CodeBuddy logo"
      />
    </>
  );
};
