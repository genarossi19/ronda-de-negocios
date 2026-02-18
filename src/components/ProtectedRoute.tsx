import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useUserStore } from "../store/userStore";
import { useAuth } from "../hooks/useAuth";
import Cookies from "js-cookie";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredAdmin?: boolean;
}

/**
 * Componente para proteger rutas que requieren autenticación
 */
export const ProtectedRoute = ({
  children,
  requiredAdmin = false,
}: ProtectedRouteProps) => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useUserStore();
  const { isAuthenticated: checkAuth } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Verificar si hay token y autenticación válida
    const token = Cookies.get("token");
    const isAuth = checkAuth();

    setIsLoading(false);

    if (!isAuth && !token) {
      navigate("/login", { replace: true });
      return;
    }

    if (requiredAdmin && !user?.is_superuser) {
      navigate("/", { replace: true });
      return;
    }
  }, [checkAuth, navigate, requiredAdmin, user?.is_superuser]);

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated && !Cookies.get("token")) {
    return null;
  }

  if (requiredAdmin && !user?.is_superuser) {
    return null;
  }

  return <>{children}</>;
};
