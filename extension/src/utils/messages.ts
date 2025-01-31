import { PeerMessage } from "types/peers";
import { Connection, DistributiveOmit } from "types/utils";
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
