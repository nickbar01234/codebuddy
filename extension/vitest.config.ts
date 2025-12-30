import { join, resolve } from "path";
import { defineConfig } from "vitest/config";

export default defineConfig(() => {
  return {
    publicDir: "public",
    base: "./",
    resolve: {
      alias: [
        { find: /@cb(.*)/, replacement: join(resolve(__dirname, "src"), "$1") },
      ],
    },
    build: {
      outDir: "dist",
    },
    test: {
      environment: "jsdom",
      include: ["src"],
    },
  };
});
