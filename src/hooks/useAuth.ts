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
    // Solo ejecutar si aún no está autenticado
    if (isAuthenticated) return;

    const token = Cookies.get(TOKEN_COOKIE_NAME);

    if (!token) {
      clearUser();
      return;
    }

    // Decodificar y validar el token
    const decoded = decodeToken(token);

    if (!decoded) {
      clearUser();
      Cookies.remove(TOKEN_COOKIE_NAME);
      return;
    }

    // Verificar que el token no haya expirado
    const now = Date.now() / 1000;
    if (decoded.exp <= now) {
      clearUser();
      Cookies.remove(TOKEN_COOKIE_NAME);
      return;
    }

    // Token válido, establecer usuario en el store
    setUser({
      user_id: decoded.user_id,
      empresa_id: decoded.empresa_id,
      razon_social: decoded.razon_social,
      is_superuser: decoded.is_superuser,
      token_type: decoded.token_type,
    });
  }, [isAuthenticated, setUser, clearUser]);

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
        throw error;
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
    isAuthenticated: checkIsAuthenticated,
  };
};
