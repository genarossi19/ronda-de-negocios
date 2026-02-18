import { useUserStore } from "../store/userStore";

/**
 * Hook para acceder a la información del usuario autenticado
 * Útil para usar en componentes como Navbar, Dashboard, etc.
 */
export const useCurrentUser = () => {
  const { user, isAuthenticated } = useUserStore();
  return { user, isAuthenticated };
};
