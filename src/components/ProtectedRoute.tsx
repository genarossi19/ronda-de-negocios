import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import Cookies from "js-cookie";
import { useUserStore } from "../store/userStore";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredAdmin?: boolean;
}

const TOKEN_COOKIE_NAME = "token";
const PROTECTED_ROUTE_NOTICE =
  "Por favor vuelve a iniciar sesion para continuar";

type DecodedToken = {
  exp: number;
  is_superuser?: boolean;
};

const decodeToken = (token: string) => {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const decoded = JSON.parse(atob(parts[1])) as DecodedToken;
    return decoded;
  } catch {
    return null;
  }
};

const isTokenValid = (token: string): boolean => {
  const decoded = decodeToken(token);
  if (!decoded) return false;
  const now = Date.now() / 1000;
  return decoded.exp > now;
};

/**
 * Componente para proteger rutas que requieren autenticación
 * Verifica que exista un token válido en cookies
 */
export const ProtectedRoute = ({
  children,
  requiredAdmin = false,
}: ProtectedRouteProps) => {
  const navigate = useNavigate();
  const [isVerified, setIsVerified] = useState(false);
  const clearUser = useUserStore((state) => state.clearUser);

  useEffect(() => {
    const redirectToLogin = () => {
      clearUser();
      Cookies.remove(TOKEN_COOKIE_NAME);
      navigate("/login", {
        replace: true,
        state: {
          sessionExpired: true,
          noticeTitle: "Acceso requerido",
          message: PROTECTED_ROUTE_NOTICE,
        },
      });
    };

    // Verificar cookie directamente
    const token = Cookies.get(TOKEN_COOKIE_NAME);

    if (!token || !isTokenValid(token)) {
      redirectToLogin();
      return;
    }

    const decoded = decodeToken(token);

    if (!decoded) {
      redirectToLogin();
      return;
    }

    // Si se requiere admin y el token no corresponde a un superuser,
    // no montamos la ruta para evitar requests protegidos con usuarios empresa.
    if (requiredAdmin && !decoded.is_superuser) {
      navigate("/", { replace: true });
      return;
    }

    setIsVerified(true);
  }, [clearUser, navigate, requiredAdmin]);

  // Mostrar nada mientras se verifica
  if (!isVerified) {
    return null;
  }

  return <>{children}</>;
};
