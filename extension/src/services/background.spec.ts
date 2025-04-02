import { beforeEach, describe, expect, test, vi } from "vitest";
import { getLanguageExtension } from "./background";

describe("serviceRequest", () => {
  describe("getLanguageExtension", () => {
    beforeEach(vi.unstubAllGlobals);

    test("returnUndefineWhenMonacoIsNotInitialized", () => {
      vi.stubGlobal("window", {});
      expect(getLanguageExtension()).toHaveLength(0);
    });

    test("returnUndefinedWhenLanguageIsNotInitialized", () => {
      vi.stubGlobal("window", { monaco: {} });
      expect(getLanguageExtension()).toHaveLength(0);
    });

    test("returnUndefinedWhenNoGetterIsInitialized", () => {
      vi.stubGlobal("window", { monaco: { languages: {} } });
      expect(getLanguageExtension()).toHaveLength(0);
    });

    test("returnUndefinedWhenNoLanguageExtensionIsDefined", () => {
      vi.stubGlobal("window", {
        monaco: { languages: { getLanguages: () => [] } },
      });
      expect(getLanguageExtension()).toHaveLength(0);
    });

    test("returnFirstLanguageExtensionFound", () => {
      const languages = {
        id: "typescript",
        extensions: ["ts"],
      };
      vi.stubGlobal("window", {
        monaco: { languages: { getLanguages: () => languages } },
      });
      expect(getLanguageExtension()).toBe(languages);
    });
  });
});
