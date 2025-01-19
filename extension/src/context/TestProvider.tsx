import { useOnMount, useRTC } from "@cb/hooks";
import { sendServiceRequest } from "@cb/services";
import { WindowMessage } from "types/window";

interface TestProviderProps {
  children?: React.ReactNode;
}

const TestProvider = (props: TestProviderProps) => {
  const { children } = props;
  const { createRoom, joinRoom, leaveRoom } = useRTC();

  useOnMount(() => {
    const onWindowMessage = (message: MessageEvent) => {
      // todo(nickbar01234): Uniquely identify that this is test browser
      if (message.data.action != undefined) {
        const windowMessage = message.data as WindowMessage;
        switch (windowMessage.action) {
          case "createRoom": {
            leaveRoom(windowMessage.roomId).then(() =>
              createRoom({ roomId: windowMessage.roomId })
            );
            break;
          }

          case "joinRoom": {
            leaveRoom(windowMessage.roomId).then(() =>
              joinRoom(windowMessage.roomId)
            );
            break;
          }

          case "reloadExtension": {
            sendServiceRequest({ action: "reloadExtension" }).then(() =>
              window.location.reload()
            );
            break;
          }
        }
      }
    };

    window.addEventListener("message", onWindowMessage);
    return () => window.removeEventListener("message", onWindowMessage);
  });

  return <>{children}</>;
};

export default TestProvider;
