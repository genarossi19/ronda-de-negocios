import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../hooks/useAuth";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredAdmin?: boolean;
}

/**
 * Componente para proteger rutas que requieren autenticación
 * Verifica que exista un usuario autenticado en el store
 * Sincroniza el token de cookies con el store usando useAuth
 */
export const ProtectedRoute = ({
  children,
  requiredAdmin = false,
}: ProtectedRouteProps) => {
  const navigate = useNavigate();
  // Sincronizar autenticación desde cookies e inicializar
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    // Si no está autenticado, redirigir al login
    if (!isAuthenticated || !user) {
      navigate("/login", { replace: true });
      return;
    }

    // Si se requiere admin y el usuario no es superuser, redirigir al home
    if (requiredAdmin && !user.is_superuser) {
      navigate("/", { replace: true });
      return;
    }
  }, [navigate, isAuthenticated, user, requiredAdmin]);

  // Mostrar nada mientras se verifica la autenticación
  if (!isAuthenticated || !user) {
    return null;
  }

  // Si se requiere admin y no lo es, no mostrar nada
  if (requiredAdmin && !user.is_superuser) {
    return null;
  }

  return <>{children}</>;
};
