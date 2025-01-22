import { useRTC } from "@cb/hooks/index";
import React from "react";

export const RejoinPrompt = () => {
  return (
    <div className="rounded-lg shadow-2xl w-[90%] max-w-sm">
      <h1 className="text-lg font-semibold text-black dark:text-white  mb-4 text-center">
        Do you want to rejoin the room?
      </h1>
      <RenderButton label="No" isYes={false} />
      <RenderButton label="Yes" isYes={true} />
      <div className="flex gap-4 justify-center"></div>
    </div>
  );
};
const RenderButton = ({ label, isYes }: { label: string; isYes: boolean }) => {
  const [loading, setLoading] = React.useState(false);
  const { joiningBackRoom } = useRTC();
  const handleClick = async (join: boolean) => {
    setLoading(true);
    await joiningBackRoom(join);
    setLoading(false);
  };

  return (
    <button
      type="button"
      onClick={() => handleClick(isYes)}
      className={`px-4 py-2 rounded-lg transition-colors flex items-center justify-center ${
        isYes
          ? "bg-blue-600 text-white hover:bg-blue-700"
          : "bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-400 dark:hover:bg-gray-600"
      }`}
    >
      {loading ? (
        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
      ) : (
        label
      )}
    </button>
  );
};
