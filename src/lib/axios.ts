import axios from "axios";
import Cookies from "js-cookie";
import { useUserStore } from "../store/userStore";

const TOKEN_COOKIE_NAME = "token";

const api = axios.create({
  // baseURL: "https://incomprehensive-nedra-subthoracic.ngrok-free.dev",
  baseURL: "https://rondadenegocios-api.trenquelauquen.gov.ar",
  timeout: 20000,
  headers: {
    "Content-Type": "application/json",
    //"ngrok-skip-browser-warning": "true",
  },
});

// Instancia pública sin interceptor de token (para endpoints abiertos como /empresas)
export const publicApi = axios.create({
  // baseURL: "https://incomprehensive-nedra-subthoracic.ngrok-free.dev",
  baseURL: "https://rondadenegocios-api.trenquelauquen.gov.ar",
  timeout: 20000,
  headers: {
    "Content-Type": "application/json",
    //"ngrok-skip-browser-warning": "true",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = Cookies.get(TOKEN_COOKIE_NAME);

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Detectar errores de autenticación
    if (error.response?.status === 401 || error.response?.status === 403) {
      const token = Cookies.get(TOKEN_COOKIE_NAME);

      if (token) {
        // Guardar en localStorage que la sesión expiró (persiste entre reloads)
        localStorage.setItem("sessionExpired", "true");

        // Limpiar cookie y store de Zustand
        Cookies.remove(TOKEN_COOKIE_NAME);
        useUserStore.getState().clearUser();

        // Redirect a login inmediatamente
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

export default api;
