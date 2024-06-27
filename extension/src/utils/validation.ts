export const isString = (input: unknown): input is string =>
  typeof input === "string";

export const isValidEmail = (email: unknown): email is string =>
  isString(email) && /^.+@.+$/.test(email);
