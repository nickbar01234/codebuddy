import { renderHook } from "@testing-library/react";
import {
  DocumentReference,
  DocumentSnapshot,
  QueryDocumentSnapshot,
  Unsubscribe,
} from "firebase/firestore";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useFirebaseListener } from "./useFirebaseListener";

const mocks = vi.hoisted(() => ({
  onSnapshot: vi.fn(),
}));

vi.mock("firebase/firestore", () => ({
  onSnapshot: mocks.onSnapshot,
}));

describe("useFirebaseListener", () => {
  const REFERENCE = { id: "id" } as DocumentReference;
  const INITIALIZED = { users: [] };

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("data is initialized", () => {
    const { result } = renderHook(() =>
      useFirebaseListener({ reference: REFERENCE, init: INITIALIZED })
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
      useFirebaseListener({ reference: REFERENCE, init: INITIALIZED })
    );
    expect(result.current.data).toBe(INITIALIZED);
  });

  it("data exists returns", () => {
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
      useFirebaseListener({ reference: REFERENCE, init: INITIALIZED })
    );
    expect(result.current.data).toBe(data);
  });

  it("undefined reference is no-op", () => {
    renderHook(() =>
      useFirebaseListener({ reference: undefined, init: INITIALIZED })
    );
    expect(mocks.onSnapshot).toHaveBeenCalledTimes(0);
  });

  const guard = (data: Partial<DocumentSnapshot>) =>
    ({ ...data }) as DocumentSnapshot;
});
