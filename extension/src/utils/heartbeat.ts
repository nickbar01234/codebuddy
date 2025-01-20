const ALPHA = 0.125;

export const calculateNewRTT = (latency: number, sample: number) => {
  if (latency == 0) return sample;
  return (1 - ALPHA) * latency + ALPHA * sample;
};

export const getUnixTs = () => Math.floor(Date.now() / 1000);
