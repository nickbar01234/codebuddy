import { cn } from "@cb/utils/cn";

interface HeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

const Header = ({ className, ...props }: HeaderProps) => {
  const darkLogo = chrome.runtime.getURL("images/logo_dark.png");
  const lightLogo = chrome.runtime.getURL("images/logo_light.png");

  return (
    <div className={cn("flex items-center gap-1", className)} {...props}>
      <div className="h-5 w-5">
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
