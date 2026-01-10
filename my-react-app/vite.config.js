import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react()],
    server: {
      port: 5173,
      host: true, // Allow network access
      strictPort: false, // Use alternative port if 5173 is busy
      open: false, // Don't auto-open browser
    },
    build: {
      outDir: "dist",
      sourcemap: true
    }
  };
});
