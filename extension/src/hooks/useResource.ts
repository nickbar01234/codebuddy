import React from "react";
import { useOnMount } from ".";

type Unsubscribe<T> = (resource: T) => void;

export interface Resource<T> {
  value: T;
  unsubscribe: Unsubscribe<T>;
}

interface UseResourceProps {
  name?: string;
}

export const useResource = <T>({ name }: UseResourceProps) => {
  const resourceRef = React.useRef<Record<string, Resource<T> | undefined>>({});

  const register = React.useRef(
    (key: string, value: T, unsubscribe: (resource: T) => void) => {
      evict(key);
      resourceRef.current[key] = { value, unsubscribe };
    }
  ).current;

  const set = React.useRef((key: string, cb: (resource: T) => T) => {
    if (resourceRef.current[key] != undefined) {
      const { unsubscribe, value } = resourceRef.current[key] as Resource<T>;
      resourceRef.current[key] = {
        unsubscribe,
        value: cb(value),
      };
    }
  }).current;

  const get = React.useRef(
    (): Record<string, T | undefined> =>
      Object.keys(resourceRef.current).reduce(
        (acc, key) => ({
          ...acc,
          [key]: resourceRef.current[key]?.value,
        }),
        {}
      )
  ).current;

  const evict = React.useRef((key: string) => {
    const resource = resourceRef.current[key];
    if (resource != undefined) {
      const { value, unsubscribe } = resource;
      unsubscribe(value);
      delete resourceRef.current[key];
    }
  }).current;

  const cleanup = React.useRef(() => {
    const resources = Object.keys(resourceRef.current);
    console.log(`Cleaning up ${name ?? "resource"}`, resources);
    resources.forEach(evict);
    resourceRef.current = {};
  }).current;

  useOnMount(() => {
    return () => cleanup();
  });

  return {
    register,
    get,
    cleanup,
    set,
    evict,
  };
};
