import { SelectProblemDialog } from "@cb/components/dialog/SelectProblemDialog";
import { Button } from "@cb/lib/components/ui/button";
import { Grid2X2 } from "lucide-react";
import React from "react";

export const RoomInfoTab = () => {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="h-full w-full flex flex-col gap-4 items-center justify-center">
      <SelectProblemDialog
        trigger={{
          customTrigger: true,
          node: (
            <div className="relative inline-block">
              <Button className="bg-[#DD5471] hover:bg-[#DD5471]/80 text-white rounded-md flex items-center gap-2 px-4 py-2 font-medium">
                <Grid2X2 className="h-5 w-5 text-white" />
                Select next problem
              </Button>
              <div className="absolute -top-[0.3rem] -right-[0.3rem] w-3 h-3 bg-[#FF3B30] rounded-full border-[4px] border-background" />
            </div>
          ),
        }}
        open={open}
        setOpen={setOpen}
      />
    </div>
  );
};
