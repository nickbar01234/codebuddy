import { UserMedata } from "@cb/hooks/store";
import { User } from "lucide-react";

interface ColorAwareUserIconProps {
  css: UserMedata["css"];
}

export const ColorAwareUserIcon = ({ css }: ColorAwareUserIconProps) => {
  return (
    <div className={css.accent}>
      <User className={css.icon} />
    </div>
  );
};
