import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import dotenv from "dotenv";
import pkg from "./package.json";

// Cargar variables del .env.development si corresponde
dotenv.config({ path: ".env.development" }); // ajusta según el modo

export default defineConfig({
  plugins: [react(), tailwindcss()],
  define: {
    // Metadata de build — disponible en runtime como constantes globales
    __APP_VERSION__: JSON.stringify(pkg.version),
    __APP_NAME__: JSON.stringify(pkg.name),
    __BUILD_DATE__: JSON.stringify(new Date().toISOString()),
    __BUILD_AUTHORS__: JSON.stringify({
      frontend: pkg.author,
      backend: pkg.contributors[0],
      stakeholder: pkg.contributors[1],
      organization: pkg.organization,
    }),
  },
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
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          "vendor-react": ["react", "react-dom", "react/jsx-runtime"],
          "vendor-router": ["react-router"],
          "vendor-ui": [
            "@radix-ui/react-dialog",
            "@radix-ui/react-popover",
            "@radix-ui/react-select",
            "@radix-ui/react-tabs",
            "@radix-ui/react-tooltip",
            "@radix-ui/react-scroll-area",
            "@radix-ui/react-dropdown-menu",
            "@radix-ui/react-alert-dialog",
            "@radix-ui/react-avatar",
          ],
          "vendor-misc": [
            "axios",
            "lucide-react",
            "sonner",
            "clsx",
            "tailwind-merge",
          ],
        },
      },
    },
  },
});
