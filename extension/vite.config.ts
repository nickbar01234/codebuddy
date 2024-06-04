import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "tailwindcss";
import { join, resolve } from "path";

// https://vitejs.dev/config/
export default defineConfig({
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
      { find: /@(.*)/, replacement: join(resolve(__dirname, "src"), "$1") },
    ],
  },
  build: {
    outDir: "dist",
    rollupOptions: {
      input: ["./src/index.tsx", "./src/services/background.ts"],
      output: {
        entryFileNames: "assets/[name].js",
        assetFileNames: (assetInfo) => {
          return `assets/[name][extname]`;
        },
      },
    },
  },
});
