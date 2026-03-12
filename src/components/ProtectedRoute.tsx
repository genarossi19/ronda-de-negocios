import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../hooks/useAuth";
import Cookies from "js-cookie";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredAdmin?: boolean;
}

const TOKEN_COOKIE_NAME = "token";

const decodeToken = (token: string) => {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const decoded = JSON.parse(atob(parts[1]));
    return decoded;
  } catch (error) {
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
  const { user } = useAuth();
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    // Verificar cookie directamente
    const token = Cookies.get(TOKEN_COOKIE_NAME);

    if (!token || !isTokenValid(token)) {
      navigate("/login", { replace: true });
      return;
    }

    // Si se requiere admin y el usuario no es superuser
    if (requiredAdmin && user && !user.is_superuser) {
      navigate("/", { replace: true });
      return;
    }

    setIsVerified(true);
  }, [navigate, user, requiredAdmin]);

  // Mostrar nada mientras se verifica
  if (!isVerified) {
    return null;
  }

  return <>{children}</>;
};
