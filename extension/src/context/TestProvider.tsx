import { useOnMount, useRTC } from "@cb/hooks";
import { getLocalStorage } from "@cb/services";

interface TestProviderProps {
  children?: React.ReactNode;
}

const TestProvider = (props: TestProviderProps) => {
  const { children } = props;
  const { createRoom, joinRoom, leaveRoom } = useRTC();

  useOnMount(() => {
    const test = getLocalStorage("test");
    if (test != undefined) {
      const { createRoomOnMount, roomId } = test;
      leaveRoom(roomId).then(() => {
        if (createRoomOnMount) {
          createRoom({ roomId });
        } else {
          joinRoom(roomId);
        }
      });
    }
  });

  return <>{children}</>;
};

export default TestProvider;
