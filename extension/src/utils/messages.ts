import { DOM } from "@cb/constants";
import { sendServiceRequest } from "@cb/services";
import { PeerMessage } from "@cb/types/peers";
import {
  Connection,
  DistributiveOmit,
  LeetCodeContentChange,
} from "@cb/types/utils";
import { getUnixTs } from "./heartbeat";

export const withPayload = (
  payload: DistributiveOmit<PeerMessage, "timestamp">
) => {
  return (key: string, connection: Connection | undefined) => {
    if (connection == undefined) {
      console.log("Not connected to peer", key);
    } else if (connection.channel.readyState !== "open") {
      console.log("Data channel not created yet");
    } else {
      const message: PeerMessage = { ...payload, timestamp: getUnixTs() };
      connection.channel.send(JSON.stringify(message));
    }
  };
};

export const getTestsPayload = (): PeerMessage => {
  return {
    action: "tests",
    timestamp: getUnixTs(),
    tests: (
      document.querySelector(DOM.LEETCODE_TEST_ID) as HTMLDivElement
    ).innerText.split("\n"),
  };
};

export const getCodePayload = async (
  changes: Partial<LeetCodeContentChange>
): Promise<PeerMessage> => {
  return {
    action: "code",
    timestamp: getUnixTs(),
    code: await sendServiceRequest({ action: "getValue" }),
    changes: JSON.stringify(changes),
  };
};
