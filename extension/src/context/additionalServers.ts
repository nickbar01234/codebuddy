const remoteServers = [
  {
    urls: "turn:relay1.expressturn.com:3478",
    credential: "n249CgDuYqr0b4Sc",
    username: "efBOWWM4SVBB1JE5CO",
  },
  {
    urls: "turn:13.250.13.83:3478?transport=udp",
    username: "YzYNCouZM1mhqhmseWk6",
    credential: "YzYNCouZM1mhqhmseWk6",
  },
  {
    urls: "stun:stun.relay.metered.ca:80",
  },
  {
    urls: "turn:global.relay.metered.ca:80",
    username: "fe645f487d27702ca414216a",
    credential: "1RgQIEt3W2JcGbLL",
  },
  {
    urls: "turn:global.relay.metered.ca:80?transport=tcp",
    username: "fe645f487d27702ca414216a",
    credential: "1RgQIEt3W2JcGbLL",
  },
  {
    urls: "turn:global.relay.metered.ca:443",
    username: "fe645f487d27702ca414216a",
    credential: "1RgQIEt3W2JcGbLL",
  },
  {
    urls: "turns:global.relay.metered.ca:443?transport=tcp",
    username: "fe645f487d27702ca414216a",
    credential: "1RgQIEt3W2JcGbLL",
  },
];
const useAdditionalServers = false;
export const additionalServers = useAdditionalServers ? remoteServers : [];
