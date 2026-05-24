import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";

const _require = createRequire(import.meta.url);
const pkg = _require("./package.json");
const [major, minor] = pkg.version.split(".");

const runGit = (args) => {
  try {
    return execFileSync("git", args, { encoding: "utf8" }).trim();
  } catch {
    return null;
  }
};

const APP_VERSION =
  process.env.VITE_APP_VERSION ||
  `${major}.${minor}.${runGit(["rev-list", "--count", "HEAD"]) || "0"}`;
const GIT_SHA =
  process.env.VITE_GIT_SHA ||
  runGit(["rev-parse", "--short", "HEAD"]) ||
  "local";
const BUILD_DATE =
  process.env.VITE_BUILD_DATE || new Date().toISOString();

export default defineConfig({
  plugins: [
    react({
      jsxRuntime: "classic",
    }),
  ],
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: "build",
    sourcemap: false,
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        manualChunks: {
          "vendor": [
            "react", "react-dom", "react-router-dom",
            "@mui/material", "@mui/icons-material", "@mui/lab", "@mui/styles",
            "@emotion/react", "@emotion/styled",
          ],
          "recharts": ["recharts"],
          "emoji": ["@emoji-mart/data", "emoji-mart"],
          "socket": ["socket.io-client"],
        },
      },
    },
  },
  envPrefix: "VITE_",
  esbuild: {
    loader: "jsx",
    include: /src\/.*\.[jt]sx?$/,
    exclude: [],
  },
  define: {
    global: "globalThis",
    __APP_VERSION__: JSON.stringify(APP_VERSION),
    __GIT_SHA__: JSON.stringify(GIT_SHA),
    __BUILD_DATE__: JSON.stringify(BUILD_DATE),
  },
  optimizeDeps: {
    include: [
      "mic-recorder-to-mp3",
      "@mui/material",
      "@mui/icons-material",
      "@mui/lab",
      "@mui/styles",
    ],
    exclude: [],
  },
});
