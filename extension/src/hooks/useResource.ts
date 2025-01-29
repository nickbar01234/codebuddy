import React from "react";
import { useOnMount } from ".";

type Unsubscribe<T> = (resource: T) => void;

interface Resource<T> {
  value: T;
  unsubscribe: Unsubscribe<T>;
}

const useResource = <T>() => {
  const resourceRef = React.useRef<Record<string, Resource<T> | undefined>>({});

  const register = React.useRef(
    (key: string, value: T, unsubscribe: (resource: T) => void) => {
      const previous = resourceRef.current[key];
      resourceRef.current[key] = { value, unsubscribe };
      if (previous != undefined) {
        unsubscribe(previous.value);
      }
    }
  ).current;

  const get = React.useRef((key: string) => resourceRef.current[key]).current;

  const set = React.useRef((key: string, cb: (resource: T) => T) => {
    if (resourceRef.current[key] != undefined) {
      const { unsubscribe, value } = resourceRef.current[key] as Resource<T>;
      resourceRef.current[key] = {
        unsubscribe,
        value: cb(value),
      };
    }
  }).current;

  const evict = React.useRef((key: string) => {
    const resource = resourceRef.current[key];
    if (resource != undefined) {
      const { value, unsubscribe } = resource;
      unsubscribe(value);
    }
  }).current;

  const cleanup = React.useRef(() => {
    const resources = Object.keys(resourceRef.current);
    console.log("Cleaning up", resources);
    resources.forEach(evict);
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

export default useResource;
