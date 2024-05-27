import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "tailwindcss";

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
  build: {
    outDir: "dist",
    rollupOptions: {
      input: ["./src/index.tsx"],
      output: {
        entryFileNames: "assets/[name].js",
        assetFileNames: (assetInfo) => {
          return `assets/[name][extname]`;
        },
      },
    },
  },
});
