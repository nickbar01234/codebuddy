const BUFFER_TIME_OUT = 1000;
const ALPHA = 0.125;
const BETA = 0.25;

export const calculateNewRTT = (latency: number, sample: number) => {
  if (latency == 0) return sample;
  return (1 - ALPHA) * latency + ALPHA * sample;
};
export const calculateNewDeviation = (
  prevDeviation: number,
  latency: number,
  sample: number
) => {
  if (prevDeviation == 0) return 1 / Math.sqrt(2 * latency);
  return (1 - BETA) * prevDeviation + BETA * Math.abs(latency - sample);
};
export const calculateNewTimeOutInterval = (
  latency: number,
  deviation: number
) => {
  return latency + 4 * deviation + BUFFER_TIME_OUT;
};
