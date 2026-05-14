import axios, { type AxiosError } from "axios";
import Cookies from "js-cookie";
import { useUserStore } from "../store/userStore";

const TOKEN_COOKIE_NAME = "token";
const UNKNOWN_BACKEND_ERROR_MESSAGE = "Ha ocurrido un error desconocido";
export const SESSION_EXPIRED_STORAGE_KEY = "sessionExpired";
export const SESSION_EXPIRED_MESSAGE =
  "Su sesion expiro. Vuelve a iniciar sesion";
export const SESSION_EXPIRED_REASON = "session-expired";
export const AUTH_SESSION_EXPIRED_EVENT = "auth:session-expired";
const AUTH_REDIRECT_HANDLED_FLAG = "__authRedirectHandled";
const AUTH_MESSAGE_FRAGMENTS = [
  "authentication credentials were not provided",
  "given token not valid",
  "token is invalid or expired",
  "token not valid",
  "not authenticated",
  "credenciales de autenticacion no se proveyeron",
];

type AxiosErrorWithAuthFlag = AxiosError & {
  [AUTH_REDIRECT_HANDLED_FLAG]?: boolean;
};

function isHtmlErrorPayload(payload: unknown): payload is string {
  if (typeof payload !== "string") {
    return false;
  }

  const normalized = payload.trim().toLowerCase();

  return (
    normalized.startsWith("<!doctype html") ||
    normalized.startsWith("<html") ||
    normalized.startsWith("<head") ||
    normalized.startsWith("<body") ||
    /<html[\s>]|<head[\s>]|<body[\s>]|<title[\s>]/i.test(normalized)
  );
}

function collectErrorMessages(payload: unknown): string[] {
  if (typeof payload === "string") {
    return [payload];
  }

  if (Array.isArray(payload)) {
    return payload.flatMap((item) => collectErrorMessages(item));
  }

  if (payload && typeof payload === "object") {
    return Object.values(payload).flatMap((value) =>
      collectErrorMessages(value),
    );
  }

  return [];
}

function getResponseMessages(error: AxiosError): string[] {
  return collectErrorMessages(error.response?.data).filter(Boolean);
}

function hasAuthenticationMessage(messages: string[]) {
  return messages.some((message) => {
    const normalized = message.toLowerCase();
    return AUTH_MESSAGE_FRAGMENTS.some((fragment) =>
      normalized.includes(fragment),
    );
  });
}

function markAuthRedirectHandled(error: AxiosError) {
  (error as AxiosErrorWithAuthFlag)[AUTH_REDIRECT_HANDLED_FLAG] = true;
}

export function triggerSessionExpired(
  message = SESSION_EXPIRED_MESSAGE,
  reason = SESSION_EXPIRED_REASON,
) {
  // Si el usuario ya cerró sesión manualmente, no tratar como expiración automática
  const alreadyLoggedOut =
    !Cookies.get(TOKEN_COOKIE_NAME) && !useUserStore.getState().isAuthenticated;

  if (alreadyLoggedOut) {
    return;
  }

  localStorage.setItem(SESSION_EXPIRED_STORAGE_KEY, "true");
  Cookies.remove(TOKEN_COOKIE_NAME);
  useUserStore.getState().clearUser();

  const authEvent = new CustomEvent(AUTH_SESSION_EXPIRED_EVENT, {
    cancelable: true,
    detail: {
      message,
      reason,
    },
  });

  const handledByRouter = !window.dispatchEvent(authEvent);

  if (!handledByRouter && window.location.pathname !== "/login") {
    window.location.assign(`/login?reason=${reason}`);
  }
}

function isAuthenticationFailure(error: unknown): error is AxiosError {
  if (!axios.isAxiosError(error)) {
    return false;
  }

  const status = error.response?.status;
  const messages = getResponseMessages(error);

  if (status === 401) {
    return true;
  }

  if (
    (status === 403 || status === 400) &&
    hasAuthenticationMessage(messages)
  ) {
    return true;
  }

  return false;
}

export function isSessionExpiredError(error: unknown) {
  if (!axios.isAxiosError(error)) {
    return false;
  }

  return (
    Boolean((error as AxiosErrorWithAuthFlag)[AUTH_REDIRECT_HANDLED_FLAG]) ||
    isAuthenticationFailure(error)
  );
}

export function getApiErrorMessage(error: unknown, fallback: string) {
  if (isSessionExpiredError(error)) {
    return null;
  }

  if (axios.isAxiosError(error)) {
    if (isHtmlErrorPayload(error.response?.data)) {
      return UNKNOWN_BACKEND_ERROR_MESSAGE;
    }

    const [firstMessage] = getResponseMessages(error);

    if (isHtmlErrorPayload(firstMessage)) {
      return UNKNOWN_BACKEND_ERROR_MESSAGE;
    }

    return firstMessage || error.message || fallback;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

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
    if (
      isAuthenticationFailure(error) &&
      useUserStore.getState().isAuthenticated
    ) {
      markAuthRedirectHandled(error);
      triggerSessionExpired();
    }

    return Promise.reject(error);
  },
);

export default api;
