import { useCallback, useEffect, useRef } from "react";
import Cookies from "js-cookie";
import { triggerSessionExpired } from "../lib/axios";
import { useUserStore } from "../store/userStore";

const TOKEN_COOKIE_NAME = "token";
const SESSION_EXPIRY_GRACE_MS = 250;

type TokenExpiryPayload = {
  exp: number;
};

function decodeTokenExpiry(token: string): TokenExpiryPayload | null {
  try {
    const parts = token.split(".");

    if (parts.length !== 3) {
      return null;
    }

    const decoded = JSON.parse(atob(parts[1])) as Partial<TokenExpiryPayload>;

    if (typeof decoded.exp !== "number") {
      return null;
    }

    return { exp: decoded.exp };
  } catch {
    return null;
  }
}

export function useSessionExpiryGuard() {
  const isAuthenticated = useUserStore((state) => state.isAuthenticated);
  const timeoutRef = useRef<number | null>(null);

  const clearScheduledExpiration = useCallback(() => {
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const scheduleSessionExpiration = useCallback(() => {
    clearScheduledExpiration();

    const token = Cookies.get(TOKEN_COOKIE_NAME);

    if (!token) {
      if (useUserStore.getState().isAuthenticated) {
        triggerSessionExpired();
      }
      return;
    }

    const decoded = decodeTokenExpiry(token);

    if (!decoded) {
      triggerSessionExpired();
      return;
    }

    const millisecondsUntilExpiration = decoded.exp * 1000 - Date.now();

    if (millisecondsUntilExpiration <= 0) {
      triggerSessionExpired();
      return;
    }

    timeoutRef.current = window.setTimeout(() => {
      triggerSessionExpired();
    }, millisecondsUntilExpiration + SESSION_EXPIRY_GRACE_MS);
  }, [clearScheduledExpiration]);

  useEffect(() => {
    if (!isAuthenticated) {
      clearScheduledExpiration();
      return;
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        scheduleSessionExpiration();
      }
    };

    scheduleSessionExpiration();
    window.addEventListener("focus", scheduleSessionExpiration);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearScheduledExpiration();
      window.removeEventListener("focus", scheduleSessionExpiration);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [clearScheduledExpiration, isAuthenticated, scheduleSessionExpiration]);
}
