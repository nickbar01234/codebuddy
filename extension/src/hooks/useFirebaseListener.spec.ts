import { renderHook } from "@testing-library/react";
import {
  DocumentReference,
  DocumentSnapshot,
  QueryDocumentSnapshot,
  Unsubscribe,
} from "firebase/firestore";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  useFirebaseListener,
  UseFirebaseListenerProps,
} from "./useFirebaseListener";

const mocks = vi.hoisted(() => ({
  onSnapshot: vi.fn(),
}));

vi.mock("firebase/firestore", () => ({
  onSnapshot: mocks.onSnapshot,
}));

describe("useFirebaseListener", () => {
  const REFERENCE = { id: "id" } as DocumentReference;
  const INITIALIZED = { users: [] };
  let callback: UseFirebaseListenerProps<unknown>["callback"];

  beforeEach(() => {
    vi.resetAllMocks();
    callback = vi.fn();
  });

  it("data is initialized", () => {
    const { result } = renderHook(() =>
      useFirebaseListener({ reference: REFERENCE, callback, init: INITIALIZED })
    );
    expect(result.current.data).toBe(INITIALIZED);
  });

  it("data does not exist no-op", () => {
    // Mocking overloaded signature is alot of sadness
    mocks.onSnapshot.mockImplementationOnce(
      (
        _reference: DocumentReference,
        onNext: (snapshot: DocumentSnapshot<unknown>) => void
      ) => {
        onNext(guard({ exists: (): this is QueryDocumentSnapshot => false }));
        return (() => {}) as Unsubscribe;
      }
    );
    const { result } = renderHook(() =>
      useFirebaseListener({ reference: REFERENCE, callback, init: INITIALIZED })
    );
    expect(result.current.data).toBe(INITIALIZED);
    expect(callback).toHaveBeenCalledTimes(0);
  });

  it("data exists returns and execute callback", () => {
    const data = { key: "value" };
    // Mocking overloaded signature is alot of sadness
    mocks.onSnapshot.mockImplementationOnce(
      (
        _reference: DocumentReference,
        onNext: (snapshot: DocumentSnapshot<unknown>) => void
      ) => {
        onNext(
          guard({
            exists: (): this is QueryDocumentSnapshot => true,
            data: () => data,
          })
        );
        return (() => {}) as Unsubscribe;
      }
    );
    const { result } = renderHook(() =>
      useFirebaseListener({ reference: REFERENCE, callback, init: INITIALIZED })
    );
    expect(result.current.data).toBe(data);
    expect(callback).toHaveBeenCalledExactlyOnceWith(data);
  });

  const guard = (data: Partial<DocumentSnapshot>) =>
    ({ ...data }) as DocumentSnapshot;
});
