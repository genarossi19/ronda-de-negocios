import Cookies from "js-cookie";
import { useCallback } from "react";
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
  const { setUser, clearUser } = useUserStore();

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

  const isAuthenticated = useCallback(() => {
    const token = getToken();
    if (!token) return false;

    const decoded = decodeToken(token);
    if (!decoded) return false;

    // Verificar si el token ha expirado
    const now = Date.now() / 1000;
    return decoded.exp > now;
  }, [getToken]);

  return {
    login,
    logout,
    getToken,
    isAuthenticated,
  };
};
