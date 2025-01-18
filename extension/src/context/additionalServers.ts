const remoteServers = [
  {
    urls: "stun:stun.relay.metered.ca:80",
  },
  {
    urls: "turn:global.relay.metered.ca:80",
    username: "eb9ec217ac64f46879e5e931",
    credential: "uhHCX1lSii7KbQBE",
  },
  {
    urls: "turn:global.relay.metered.ca:80?transport=tcp",
    username: "eb9ec217ac64f46879e5e931",
    credential: "uhHCX1lSii7KbQBE",
  },
  {
    urls: "turn:global.relay.metered.ca:443",
    username: "eb9ec217ac64f46879e5e931",
    credential: "uhHCX1lSii7KbQBE",
  },
  {
    urls: "turns:global.relay.metered.ca:443?transport=tcp",
    username: "eb9ec217ac64f46879e5e931",
    credential: "uhHCX1lSii7KbQBE",
  },
];
// TODO: Set to true to use the additional servers
const useAdditionalServers = false;
export const additionalServers = useAdditionalServers ? remoteServers : [];
