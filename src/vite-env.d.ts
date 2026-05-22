/// <reference types="vite/client" />

// Constantes inyectadas en tiempo de build por Vite
declare const __APP_VERSION__: string;
declare const __APP_NAME__: string;
declare const __BUILD_DATE__: string;
declare const __BUILD_AUTHORS__: {
  frontend: { name: string; role: string };
  backend: { name: string; role: string };
  stakeholder: { name: string; role: string };
  organization: { name: string; location: string };
};
