import { useEffect, useCallback } from "react";
import Cookies from "js-cookie";
import { login as loginService } from "../api/LoginService";
import { useUserStore, type User } from "../store/userStore";

export interface DecodedToken {
  token_type: string;
  exp: number;
  iat: number;
  jti: string;
  user_id: number;
  empresa_id: number;
  razon_social: string;
  is_superuser: boolean;
}

const TOKEN_COOKIE_NAME = "token";

// Función para decodificar JWT
const decodeToken = (token: string): DecodedToken | null => {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const decoded = JSON.parse(atob(parts[1]));
    return decoded as DecodedToken;
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
};

export const useAuth = () => {
  const { user, setUser, clearUser, isAuthenticated } = useUserStore();

  // Sincronizar token de cookies con el store al cargar
  useEffect(() => {
    const token = Cookies.get(TOKEN_COOKIE_NAME);

    if (!token) {
      console.log("[useAuth] No token found in cookies");
      clearUser();
      return;
    }

    console.log("[useAuth] Token found, decoding...");
    // Decodificar y validar el token
    const decoded = decodeToken(token);

    console.log("[useAuth] Decoded token:", decoded);

    if (!decoded) {
      console.log("[useAuth] Failed to decode token");
      clearUser();
      Cookies.remove(TOKEN_COOKIE_NAME);
      return;
    }

    // Verificar que el token no haya expirado
    const now = Date.now() / 1000;
    if (decoded.exp <= now) {
      console.log("[useAuth] Token expired");
      clearUser();
      Cookies.remove(TOKEN_COOKIE_NAME);
      return;
    }

    // Token válido, establecer usuario en el store
    console.log("[useAuth] Valid token, setting user in store", {
      user_id: decoded.user_id,
      is_superuser: decoded.is_superuser,
    });
    setUser({
      user_id: decoded.user_id,
      empresa_id: decoded.empresa_id,
      razon_social: decoded.razon_social,
      is_superuser: decoded.is_superuser,
      token_type: decoded.token_type,
    });
  }, []); // Solo ejecutar una vez al montar

  const getToken = useCallback(() => {
    return Cookies.get(TOKEN_COOKIE_NAME) || null;
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      try {
        const response = await loginService(email, password);
        const token = response.access;

        if (!token) {
          throw new Error("No token received from server");
        }

        // Decodificar el token
        const decoded = decodeToken(token);
        if (!decoded) {
          throw new Error("Invalid token format");
        }

        // Guardar el token en cookie
        Cookies.set(TOKEN_COOKIE_NAME, token, {
          expires: new Date(decoded.exp * 1000),
          secure: true,
          sameSite: "strict",
        });

        // Actualizar el store con los datos del usuario
        const userData: User = {
          user_id: decoded.user_id,
          empresa_id: decoded.empresa_id,
          razon_social: decoded.razon_social,
          is_superuser: decoded.is_superuser,
          token_type: decoded.token_type,
        };

        setUser(userData);
        return userData;
      } catch (error) {
        clearUser();
        Cookies.remove(TOKEN_COOKIE_NAME);
        // Extraer mensaje específico del backend si existe
        const axiosError = error as {
          response?: { data?: { non_field_errors?: string[] } };
        };
        const backendMessage = axiosError.response?.data?.non_field_errors?.[0];
        throw new Error(
          backendMessage ??
            (error instanceof Error
              ? error.message
              : "Error al iniciar sesión"),
        );
      }
    },
    [setUser, clearUser],
  );

  const logout = useCallback(() => {
    clearUser();
    Cookies.remove(TOKEN_COOKIE_NAME);
  }, [clearUser]);

  const checkIsAuthenticated = useCallback(() => {
    const token = getToken();
    if (!token) return false;

    const decoded = decodeToken(token);
    if (!decoded) return false;

    // Verificar si el token ha expirado
    const now = Date.now() / 1000;
    return decoded.exp > now;
  }, [getToken]);

  return {
    user,
    login,
    logout,
    getToken,
    isAuthenticated,
  };
};
