import { Tooltip } from "@cb/components/tooltip";
import { UserMedata } from "@cb/hooks/store";
import { User as UserType } from "@cb/types";
import { User } from "lucide-react";

interface ColorAwareUserIconProps {
  user?: UserType;
  css: UserMedata["css"];
}

export const ColorAwareUserIcon = ({ user, css }: ColorAwareUserIconProps) => {
  return (
    <Tooltip
      trigger={{
        node: (
          <div className={css.accent}>
            <User className={css.icon} />
          </div>
        ),
      }}
      content={user}
    />
  );
};
