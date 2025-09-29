import react from "@vitejs/plugin-react";
import { join, resolve } from "path";
import tailwindcss from "tailwindcss";
import { defineConfig } from "wxt";

const SRC_DIR = "src";

const USER_PROFILE = process.env.USER_PROFILE;

export default defineConfig({
  srcDir: SRC_DIR,
  outDir: "dist",
  webExt: {
    startUrls: ["https://leetcode.com/problems/two-sum/"],
    chromiumArgs: [
      "--disable-web-security",
      `--user-data-dir=./.wxt/chrome-data/${USER_PROFILE}`,
      "--auto-open-devtools-for-tabs",
    ],
  },
  manifestVersion: 3,
  manifest: {
    name: "CodeBuddy",
    description: "Leetcode together",
    version: "2.2.0",
    action: {},
    icons: {
      "16": "icons/16.png",
      "32": "icons/32.png",
      "48": "icons/48.png",
      "128": "icons/128.png",
    },
    host_permissions: ["https://leetcode.com/problems/*"],
    permissions: ["scripting", "tabs"],
    content_security_policy: {
      extension_pages: "script-src 'self'; object-src 'self';",
    },
    web_accessible_resources: [
      {
        resources: ["images/*.png"],
        matches: ["<all_urls>"],
      },
      {
        resources: ["proxy.js"],
        matches: ["https://leetcode.com/*"],
      },
    ],
  },
  vite: () => ({
    plugins: [react()],
    css: {
      postcss: {
        plugins: [tailwindcss()],
      },
    },
    resolve: {
      alias: [
        {
          find: /@cb(.*)/,
          replacement: join(resolve(__dirname, SRC_DIR), "$1"),
        },
      ],
    },
  }),
});
