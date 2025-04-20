import { CreateRoomDialog } from "@cb/components/dialog/CreateRoomDialog";
import { JoinRoomDialog } from "@cb/components/dialog/JoinRoomDialog";
import { ThemeAwaredLogo } from "@cb/components/icons/Logo";

const HomePanel = () => {
  return (
    <div className="hide-scrollbar flex h-full w-full flex-col gap-10 overflow-x-auto justify-center mr-4">
      <div className="flex min-w-max flex-col items-center justify-end gap-3">
        <ThemeAwaredLogo
          containerProps={{
            className:
              "aspect-square md:h-[140px] sm:h-[100px] md:w-[140px] sm:w-[100px]",
          }}
        />
        <h1 className="text-2xl">
          Code<span className="text-pinkish-red">Buddy</span>
        </h1>
      </div>

      <div className="flex w-full flex-col items-center gap-3">
        <CreateRoomDialog />
        <JoinRoomDialog />
      </div>
    </div>
  );
};

export default HomePanel;
