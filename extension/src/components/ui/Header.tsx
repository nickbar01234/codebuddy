import { cn } from "@cb/utils/cn";

interface HeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

const Header = ({ className, ...props }: HeaderProps) => {
  const darkLogo = chrome.runtime.getURL("images/logo_dark.png");
  const lightLogo = chrome.runtime.getURL("images/logo_light.png");

  return (
    <div className={cn("flex gap-1 items-center", className)} {...props}>
      <div className="h-6 w-6">
        <img src={lightLogo} className="dark:hidden" alt="CodeBuddy logo" />
        <img
          src={darkLogo}
          className="hidden dark:block"
          alt="CodeBuddy logo"
        />
      </div>
      <h2 className="font-medium">CodeBuddy</h2>
    </div>
  );
};

export default Header;
