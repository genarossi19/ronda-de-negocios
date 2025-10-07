import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// https://vite.dev/config/
export default defineConfig(() => {
  // Leemos la variable desde el entorno (.env.development, .env, etc.)
  const allowNgrok = process.env.VITE_ALLOW_NGROK === "true";

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      host: true, // Permite acceder desde LAN o túneles externos (ngrok)
      allowedHosts: allowNgrok ? [".ngrok-free.app"] : [], // Permitir ngrok solo si está habilitado
    },
  };
});
