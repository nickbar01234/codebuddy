import React from "react";

interface ThemeAwaredLogoProps {
  containerProps?: React.HtmlHTMLAttributes<HTMLDivElement>;
  darkLogoPath?: string;
  lightLogoPath?: string;
}

export const ThemeAwaredLogo = ({
  containerProps,
  darkLogoPath = "images/logo_dark.png",
  lightLogoPath = "images/logo_light.png",
}: ThemeAwaredLogoProps) => {
  const darkLogo = React.useMemo(
    () => chrome.runtime.getURL(darkLogoPath),
    [darkLogoPath]
  );
  const lightLogo = React.useMemo(
    () => chrome.runtime.getURL(lightLogoPath),
    [lightLogoPath]
  );

  return (
    <div {...containerProps}>
      <img src={lightLogo} className="dark:hidden" alt="CodeBuddy logo" />
      <img src={darkLogo} className="hidden dark:block" alt="CodeBuddy logo" />
    </div>
  );
};
