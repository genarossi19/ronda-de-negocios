import axios from "axios";
import Cookies from "js-cookie";

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
    console.log(token);

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export default api;
