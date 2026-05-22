import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import "./index.css";
import App from "./App.tsx";

// Firma de build — visible en DevTools > Console en producción
const _version = `${import.meta.env.VITE_APP_VERSION ?? __APP_VERSION__} beta`;
console.log(
  `%c Ronda de Negocios %c ${_version} — Build ${new Date(__BUILD_DATE__).toLocaleDateString("es-AR")} `,
  "background:#15803d;color:#fff;font-weight:bold;font-size:13px;padding:4px 8px;border-radius:4px 0 0 4px",
  "background:#374151;color:#e5e7eb;font-size:12px;padding:4px 8px;border-radius:0 4px 4px 0",
);
console.log(
  "%cDesarrollado por:\n" +
    `  Frontend  → ${__BUILD_AUTHORS__.frontend.name}\n` +
    `  Backend   → ${__BUILD_AUTHORS__.backend.name}\n` +
    `  Stakeholder → ${__BUILD_AUTHORS__.stakeholder.name}\n\n` +
    `  ${__BUILD_AUTHORS__.organization.name}\n` +
    `  ${__BUILD_AUTHORS__.organization.location}`,
  "color:#6b7280;font-size:11px;line-height:1.6",
);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
