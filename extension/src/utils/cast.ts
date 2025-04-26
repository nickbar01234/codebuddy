export const defaultTo = <T>(value: T | undefined | null, base: T) =>
  value ?? base;

export const identity = <T>(input: T) => input;

export const promisedIdentity = <T>(input: T) => Promise.resolve(input);
