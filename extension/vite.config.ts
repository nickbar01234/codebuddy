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
      ? "./src/index.tsx"
      : process.env.TYPE === "service_worker"
        ? "./src/services/background.ts"
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
      rollupOptions: {
        input: input,
        output: {
          entryFileNames: "assets/[name].js",
          assetFileNames: (assetInfo) => {
            return `assets/[name][extname]`;
          },
        },
      },
    },
  };
});
