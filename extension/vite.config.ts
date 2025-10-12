// @ts-nocheck
// todo(nickbar01234): Ignoring typecheck is never good, but this file is deprecated and is only kept around for
// running tests, which we eventually should deprecate.

/// <reference types="vitest" />
import react from "@vitejs/plugin-react";
import { join, resolve } from "path";
import tailwindcss from "tailwindcss";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig(() => {
  // https://github.com/vitejs/vite/issues/12203
  const input =
    process.env.TYPE === "content_script"
      ? "./src/main/content_script.tsx"
      : process.env.TYPE === "service_worker"
        ? "./src/main/service_worker/background.ts"
        : null;

  if (input == null) {
    throw new Error("Invalid entry point");
  }

  return {
    plugins: [react()],
    publicDir: "public",
    base: "./",
    css: {
      postcss: {
        plugins: [tailwindcss()],
      },
    },
    resolve: {
      alias: [
        { find: /@cb(.*)/, replacement: join(resolve(__dirname, "src"), "$1") },
      ],
    },
    build: {
      outDir: "dist",
      emptyOutDir: false,
      cssCodeSplit: false,
      rollupOptions: {
        input: input,
        output: {
          entryFileNames: "assets/[name].js",
          assetFileNames: (assetInfo) => {
            if (assetInfo.names[0] === "style.css") {
              return "assets/index.css";
            }
            return `assets/[name][extname]`;
          },
        },
      },
    },
    test: {
      environment: "jsdom",
    },
  };
});
