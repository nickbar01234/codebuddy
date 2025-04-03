import { cn } from "@cb/utils/cn";

// export const darkLogo = chrome.runtime.getURL("images/logo_dark.png");
// export const lightLogo = chrome.runtime.getURL("images/logo_light.png");

interface ThemeAwaredLogoProps {
  className?: string;
  darkLogoPath?: string;
  lightLogoPath?: string;
}

export const ThemeAwaredLogo = ({
  className = "",
  darkLogoPath = "images/logo_dark.png",
  lightLogoPath = "images/logo_light.png",
}: ThemeAwaredLogoProps) => {
  const darkLogo = chrome.runtime.getURL(darkLogoPath);
  const lightLogo = chrome.runtime.getURL(lightLogoPath);
  return (
    <>
      <img
        src={lightLogo}
        className={cn("dark:hidden", className)}
        alt="CodeBuddy logo"
      />
      <img
        src={darkLogo}
        className={cn("hidden dark:block", className)}
        alt="CodeBuddy logo"
      />
    </>
  );
};
