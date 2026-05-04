// ARCHIVO OBSOLETO - Usar hooks/useAuth.ts en su lugar
// Mantenido solo para compatibilidad temporal
// TODO: Eliminar este archivo después de migrar todos los imports

import { createContext, type ReactNode } from "react";

export const AuthContext = createContext(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
