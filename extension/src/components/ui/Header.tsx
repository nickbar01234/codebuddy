import { ThemeAwaredLogo } from "@cb/components/icons/Logo";
import { cn } from "@cb/utils/cn";

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface HeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

const Header = ({ className, ...props }: HeaderProps) => {
  return (
    <div className={cn("flex items-center gap-1", className)} {...props}>
      <div className="h-5 w-5">
        <ThemeAwaredLogo />
      </div>
      <h2 className="font-medium">CodeBuddy</h2>
    </div>
  );
};

export default Header;
