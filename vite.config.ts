import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import dotenv from "dotenv";

// Cargar variables del .env.development si corresponde
dotenv.config({ path: ".env.development" }); // ajusta según el modo

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
    allowedHosts: allowNgrok ? true : undefined,
  },
});
