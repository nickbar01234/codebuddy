const ALPHA = 0.125;

export const calculateNewRTT = (latency: number, sample: number) => {
  if (latency == 0) return sample;
  return (1 - ALPHA) * latency + ALPHA * sample;
};

export const getUnixTs = () => Math.floor(Date.now() / 1000);

export const timeAgo = (timestamp: number) => {
  const diff = Math.floor((Date.now() - timestamp) / 1000); // Difference in seconds

  if (diff < 60) return "0s";
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;

  return `${Math.floor(diff / 3600)}h`;
};

export const formatTime = (ms: number): string => {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600)
    .toString()
    .padStart(2, "0");
  const minutes = Math.floor((totalSeconds % 3600) / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");

  return `${hours}:${minutes}:${seconds}`;
};
