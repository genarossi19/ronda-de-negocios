import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// Leemos variable de entorno al inicio
const allowNgrok = process.env.VITE_ALLOW_NGROK === "true";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: true,
    allowedHosts: allowNgrok ? true : undefined, // ✅ Compatible con TS
  },
});
