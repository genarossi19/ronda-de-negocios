import { useUserStore } from "../store/userStore";

/**
 * Hook para acceder a la información del usuario autenticado
 * Útil para usar en componentes como Navbar, Dashboard, etc.
 */
export const useCurrentUser = () => {
  const { user, isAuthenticated } = useUserStore();
  const isAdmin = user?.is_superuser ?? false;
  const isApprovedCompany = user?.aprobada ?? false;
  const isPendingApproval = Boolean(user) && !isAdmin && !isApprovedCompany;
  return {
    user,
    isAuthenticated,
    isAdmin,
    isApprovedCompany,
    isPendingApproval,
  };
};
