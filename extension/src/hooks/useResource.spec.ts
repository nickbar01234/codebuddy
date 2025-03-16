import { beforeEach, describe, expect, test, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import useResource, { Resource } from "./useResource";

describe("useResource", () => {
  const RESOURCE = "resource";

  const VALUE = "1";

  let unsubscribe: Resource<string>["unsubscribe"];

  beforeEach(() => {
    unsubscribe = vi.fn();
  });

  test("register_unsubscribePreviousResource", () => {
    const { result } = renderHook(() => useResource<string>({}));
    const { register } = result.current;
    register(RESOURCE, VALUE, unsubscribe);
    register(RESOURCE, VALUE, unsubscribe);
    expect(unsubscribe).toHaveBeenCalledExactlyOnceWith(VALUE);
  });
});
