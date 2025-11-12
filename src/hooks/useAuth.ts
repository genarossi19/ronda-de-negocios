import Cookies from "js-cookie";
import { useCallback } from "react";

export interface DecodedToken {
  token_type: string;
  exp: number;
  iat: number;
  jti: string;
  user_id: string;
  id: number;
  nombre: string;
  apellido: string;
  is_superuser: boolean;
}

export const useAuth = () => {
  const tokenCookieName = "token";
  const getToken = useCallback(
    () => Cookies.get(tokenCookieName) || null,
    [tokenCookieName]
  );

  return {
    user: null,
    login: () => {},
    logout: () => {},
  };
};
