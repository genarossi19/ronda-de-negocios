import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import dotenv from "dotenv";

// Cargar variables del .env.development si corresponde
dotenv.config({ path: ".env.development" }); // ajusta según el modo

// const allowNgrok = process.env.VITE_ALLOW_NGROK === "true";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // server: {
  //   host: true,
  //   allowedHosts: allowNgrok ? true : undefined,
  // },
  server: {
    proxy: {
      "/api": {
        target:
          "https://script.google.com/macros/s/AKfycbz5JM8AwFD_Q2NFVGZhNcSIhZmCG2yFSjAdrN9Heese2PDAcV63FDmQ1iVo_5N5s6Md/exec",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
});
