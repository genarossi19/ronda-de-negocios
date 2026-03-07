import axios from "axios";
import Cookies from "js-cookie";
import { toast } from "sonner";
import { useUserStore } from "../store/userStore";

const TOKEN_COOKIE_NAME = "token";

const api = axios.create({
  baseURL: "https://incomprehensive-nedra-subthoracic.ngrok-free.dev",
  //baseURL: "http://100.100.34.104",
  timeout: 20000,
  headers: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
  },
});

// Instancia pública sin interceptor de token (para endpoints abiertos como /empresas)
export const publicApi = axios.create({
  baseURL: "https://incomprehensive-nedra-subthoracic.ngrok-free.dev",
  //baseURL: "http://100.100.34.104",
  timeout: 20000,
  headers: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
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
    if (error.response?.status === 401 || error.response?.status === 403) {
      const token = Cookies.get(TOKEN_COOKIE_NAME);
      const message = token
        ? "Su sesión expiró. Por favor, inicie sesión nuevamente."
        : "Debes iniciar sesión para acceder a este recurso.";

      // Limpiar cookie y store de Zustand (incluye localStorage persistido)
      Cookies.remove(TOKEN_COOKIE_NAME);
      useUserStore.getState().clearUser();

      toast.error(message);
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export default api;
