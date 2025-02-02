interface PollArguments<T> {
  fn: () => Promise<T>;
  until: (arg: T) => boolean;
  ms?: number;
}

export const poll = async <T>({ fn, until, ms = 1000 }: PollArguments<T>) => {
  let result = await fn();
  while (!until(result)) {
    await wait(ms);
    result = await fn();
  }
  return result;
};

const wait = (ms: number) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};
