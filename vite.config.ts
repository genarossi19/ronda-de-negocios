import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import dotenv from "dotenv";

// Cargar variables del .env.development si corresponde
dotenv.config({ path: ".env.development" }); // ajusta según el modo

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      "/api": {
        target: "https://incomprehensive-nedra-subthoracic.ngrok-free.dev",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
        // Aquí añadimos el header para que el proxy lo envíe al backend
        configure: (proxy) => {
          proxy.on("proxyReq", (proxyReq) => {
            proxyReq.setHeader("ngrok-skip-browser-warning", "true");
          });
        },
      },
    },
  },
});
