import { useCallback, useEffect, useRef } from "react";
import Cookies from "js-cookie";
import { toast } from "sonner";
import { triggerSessionExpired } from "../lib/axios";
import { useUserStore } from "../store/userStore";

const TOKEN_COOKIE_NAME = "token";
const SESSION_EXPIRY_GRACE_MS = 250;
const SESSION_WARNING_THRESHOLD_SECONDS = 60;

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
  const setSessionSecondsRemaining = useUserStore(
    (state) => state.setSessionSecondsRemaining,
  );
  const timeoutRef = useRef<number | null>(null);
  const warningTimeoutRef = useRef<number | null>(null);
  const countdownIntervalRef = useRef<number | null>(null);
  const warnedTokenExpiryRef = useRef<number | null>(null);
  const activeTokenExpiryRef = useRef<number | null>(null);

  const clearScheduledExpiration = useCallback(() => {
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const clearWarningTimeout = useCallback(() => {
    if (warningTimeoutRef.current !== null) {
      window.clearTimeout(warningTimeoutRef.current);
      warningTimeoutRef.current = null;
    }
  }, []);

  const clearCountdownInterval = useCallback(() => {
    if (countdownIntervalRef.current !== null) {
      window.clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    setSessionSecondsRemaining(null);
  }, [setSessionSecondsRemaining]);

  const clearAllSessionTimers = useCallback(() => {
    clearScheduledExpiration();
    clearWarningTimeout();
    clearCountdownInterval();
  }, [clearCountdownInterval, clearScheduledExpiration, clearWarningTimeout]);

  const startCountdown = useCallback(
    (tokenExpirySeconds: number) => {
      clearCountdownInterval();

      const updateCountdown = () => {
        const remainingSeconds = Math.max(
          0,
          Math.ceil(tokenExpirySeconds - Date.now() / 1000),
        );

        if (remainingSeconds <= 0) {
          clearCountdownInterval();
          return;
        }

        setSessionSecondsRemaining(remainingSeconds);
      };

      updateCountdown();
      countdownIntervalRef.current = window.setInterval(updateCountdown, 1000);
    },
    [clearCountdownInterval, setSessionSecondsRemaining],
  );

  const scheduleSessionExpiration = useCallback(() => {
    clearAllSessionTimers();

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

    if (activeTokenExpiryRef.current !== decoded.exp) {
      activeTokenExpiryRef.current = decoded.exp;
      warnedTokenExpiryRef.current = null;
    }

    const millisecondsUntilExpiration = decoded.exp * 1000 - Date.now();

    if (millisecondsUntilExpiration <= 0) {
      triggerSessionExpired();
      return;
    }

    const warningMilliseconds =
      millisecondsUntilExpiration - SESSION_WARNING_THRESHOLD_SECONDS * 1000;

    const triggerOneMinuteWarning = () => {
      if (warnedTokenExpiryRef.current !== decoded.exp) {
        warnedTokenExpiryRef.current = decoded.exp;
        toast.warning("Tu sesión expira en 1 minuto", {
          duration: 7000,
        });
      }
      startCountdown(decoded.exp);
    };

    if (warningMilliseconds <= 0) {
      triggerOneMinuteWarning();
    } else {
      warningTimeoutRef.current = window.setTimeout(
        triggerOneMinuteWarning,
        warningMilliseconds,
      );
    }

    timeoutRef.current = window.setTimeout(() => {
      triggerSessionExpired();
    }, millisecondsUntilExpiration + SESSION_EXPIRY_GRACE_MS);
  }, [clearAllSessionTimers, startCountdown]);

  useEffect(() => {
    if (!isAuthenticated) {
      activeTokenExpiryRef.current = null;
      warnedTokenExpiryRef.current = null;
      clearAllSessionTimers();
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
      clearAllSessionTimers();
      window.removeEventListener("focus", scheduleSessionExpiration);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [clearAllSessionTimers, isAuthenticated, scheduleSessionExpiration]);
}
