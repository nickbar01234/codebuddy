// vite.config.ts
import { defineConfig } from "file:///Users/hung/Documents/coding/SoftwareDevelopment/codebuddy/extension/node_modules/.pnpm/vite@5.2.11_@types+node@20.13.0/node_modules/vite/dist/node/index.js";
import react from "file:///Users/hung/Documents/coding/SoftwareDevelopment/codebuddy/extension/node_modules/.pnpm/@vitejs+plugin-react@4.3.0_vite@5.2.11_@types+node@20.13.0_/node_modules/@vitejs/plugin-react/dist/index.mjs";
import tailwindcss from "file:///Users/hung/Documents/coding/SoftwareDevelopment/codebuddy/extension/node_modules/.pnpm/tailwindcss@3.4.3/node_modules/tailwindcss/lib/index.js";
import { join, resolve } from "path";
var __vite_injected_original_dirname = "/Users/hung/Documents/coding/SoftwareDevelopment/codebuddy/extension";
var vite_config_default = defineConfig(() => {
  const input = process.env.TYPE === "content_script" ? "./src/index.tsx" : process.env.TYPE === "service_worker" ? "./src/services/background.ts" : null;
  if (input == null) {
    throw new Error("Invalid entry point");
  }
  return {
    plugins: [react()],
    publicDir: "public",
    base: "./",
    css: {
      postcss: {
        plugins: [tailwindcss()]
      }
    },
    resolve: {
      alias: [
        { find: /@cb(.*)/, replacement: join(resolve(__vite_injected_original_dirname, "src"), "$1") }
      ]
    },
    build: {
      outDir: "dist",
      emptyOutDir: false,
      rollupOptions: {
        input,
        output: {
          entryFileNames: "assets/[name].js",
          assetFileNames: (assetInfo) => {
            return `assets/[name][extname]`;
          }
        }
      }
    }
  };
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMvaHVuZy9Eb2N1bWVudHMvY29kaW5nL1NvZnR3YXJlRGV2ZWxvcG1lbnQvY29kZWJ1ZGR5L2V4dGVuc2lvblwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL1VzZXJzL2h1bmcvRG9jdW1lbnRzL2NvZGluZy9Tb2Z0d2FyZURldmVsb3BtZW50L2NvZGVidWRkeS9leHRlbnNpb24vdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL1VzZXJzL2h1bmcvRG9jdW1lbnRzL2NvZGluZy9Tb2Z0d2FyZURldmVsb3BtZW50L2NvZGVidWRkeS9leHRlbnNpb24vdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tIFwidml0ZVwiO1xuaW1wb3J0IHJlYWN0IGZyb20gXCJAdml0ZWpzL3BsdWdpbi1yZWFjdFwiO1xuaW1wb3J0IHRhaWx3aW5kY3NzIGZyb20gXCJ0YWlsd2luZGNzc1wiO1xuaW1wb3J0IHsgam9pbiwgcmVzb2x2ZSB9IGZyb20gXCJwYXRoXCI7XG5cbi8vIGh0dHBzOi8vdml0ZWpzLmRldi9jb25maWcvXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoKCkgPT4ge1xuICAvLyBodHRwczovL2dpdGh1Yi5jb20vdml0ZWpzL3ZpdGUvaXNzdWVzLzEyMjAzXG4gIGNvbnN0IGlucHV0ID1cbiAgICBwcm9jZXNzLmVudi5UWVBFID09PSBcImNvbnRlbnRfc2NyaXB0XCJcbiAgICAgID8gXCIuL3NyYy9pbmRleC50c3hcIlxuICAgICAgOiBwcm9jZXNzLmVudi5UWVBFID09PSBcInNlcnZpY2Vfd29ya2VyXCJcbiAgICAgID8gXCIuL3NyYy9zZXJ2aWNlcy9iYWNrZ3JvdW5kLnRzXCJcbiAgICAgIDogbnVsbDtcblxuICBpZiAoaW5wdXQgPT0gbnVsbCkge1xuICAgIHRocm93IG5ldyBFcnJvcihcIkludmFsaWQgZW50cnkgcG9pbnRcIik7XG4gIH1cblxuICByZXR1cm4ge1xuICAgIHBsdWdpbnM6IFtyZWFjdCgpXSxcbiAgICBwdWJsaWNEaXI6IFwicHVibGljXCIsXG4gICAgYmFzZTogXCIuL1wiLFxuICAgIGNzczoge1xuICAgICAgcG9zdGNzczoge1xuICAgICAgICBwbHVnaW5zOiBbdGFpbHdpbmRjc3MoKV0sXG4gICAgICB9LFxuICAgIH0sXG4gICAgcmVzb2x2ZToge1xuICAgICAgYWxpYXM6IFtcbiAgICAgICAgeyBmaW5kOiAvQGNiKC4qKS8sIHJlcGxhY2VtZW50OiBqb2luKHJlc29sdmUoX19kaXJuYW1lLCBcInNyY1wiKSwgXCIkMVwiKSB9LFxuICAgICAgXSxcbiAgICB9LFxuICAgIGJ1aWxkOiB7XG4gICAgICBvdXREaXI6IFwiZGlzdFwiLFxuICAgICAgZW1wdHlPdXREaXI6IGZhbHNlLFxuICAgICAgcm9sbHVwT3B0aW9uczoge1xuICAgICAgICBpbnB1dDogaW5wdXQsXG4gICAgICAgIG91dHB1dDoge1xuICAgICAgICAgIGVudHJ5RmlsZU5hbWVzOiBcImFzc2V0cy9bbmFtZV0uanNcIixcbiAgICAgICAgICBhc3NldEZpbGVOYW1lczogKGFzc2V0SW5mbykgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIGBhc3NldHMvW25hbWVdW2V4dG5hbWVdYDtcbiAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICB9LFxuICB9O1xufSk7XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQThYLFNBQVMsb0JBQW9CO0FBQzNaLE9BQU8sV0FBVztBQUNsQixPQUFPLGlCQUFpQjtBQUN4QixTQUFTLE1BQU0sZUFBZTtBQUg5QixJQUFNLG1DQUFtQztBQU16QyxJQUFPLHNCQUFRLGFBQWEsTUFBTTtBQUVoQyxRQUFNLFFBQ0osUUFBUSxJQUFJLFNBQVMsbUJBQ2pCLG9CQUNBLFFBQVEsSUFBSSxTQUFTLG1CQUNyQixpQ0FDQTtBQUVOLE1BQUksU0FBUyxNQUFNO0FBQ2pCLFVBQU0sSUFBSSxNQUFNLHFCQUFxQjtBQUFBLEVBQ3ZDO0FBRUEsU0FBTztBQUFBLElBQ0wsU0FBUyxDQUFDLE1BQU0sQ0FBQztBQUFBLElBQ2pCLFdBQVc7QUFBQSxJQUNYLE1BQU07QUFBQSxJQUNOLEtBQUs7QUFBQSxNQUNILFNBQVM7QUFBQSxRQUNQLFNBQVMsQ0FBQyxZQUFZLENBQUM7QUFBQSxNQUN6QjtBQUFBLElBQ0Y7QUFBQSxJQUNBLFNBQVM7QUFBQSxNQUNQLE9BQU87QUFBQSxRQUNMLEVBQUUsTUFBTSxXQUFXLGFBQWEsS0FBSyxRQUFRLGtDQUFXLEtBQUssR0FBRyxJQUFJLEVBQUU7QUFBQSxNQUN4RTtBQUFBLElBQ0Y7QUFBQSxJQUNBLE9BQU87QUFBQSxNQUNMLFFBQVE7QUFBQSxNQUNSLGFBQWE7QUFBQSxNQUNiLGVBQWU7QUFBQSxRQUNiO0FBQUEsUUFDQSxRQUFRO0FBQUEsVUFDTixnQkFBZ0I7QUFBQSxVQUNoQixnQkFBZ0IsQ0FBQyxjQUFjO0FBQzdCLG1CQUFPO0FBQUEsVUFDVDtBQUFBLFFBQ0Y7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
