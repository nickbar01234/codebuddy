import config from "./vite.config";

// Delete to vite.config.ts, since we have a different build configuration
// for extension/ and background/
process.env.TYPE = "content_script";

export default config;
