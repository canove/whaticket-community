import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

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
          "material-ui": [
            "@mui/material",
            "@mui/icons-material",
            "@mui/lab",
            "@mui/styles",
            "@emotion/react",
            "@emotion/styled",
          ],
          "recharts": ["recharts"],
          "emoji": ["@emoji-mart/data", "emoji-mart"],
          "react-vendor": ["react", "react-dom", "react-router-dom"],
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
