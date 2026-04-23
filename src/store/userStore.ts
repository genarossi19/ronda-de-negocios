import { create } from "zustand";

export interface User {
  user_id: number;
  empresa_id: number;
  razon_social: string;
  email: string;
  is_superuser: boolean;
  aprobada: boolean;
  token_type: string;
}

interface UserStore {
  user: User | null;
  isAuthenticated: boolean;
  sessionSecondsRemaining: number | null;
  setUser: (user: User) => void;
  setSessionSecondsRemaining: (seconds: number | null) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserStore>((set) => ({
  user: null,
  isAuthenticated: false,
  sessionSecondsRemaining: null,
  setUser: (user: User) =>
    set({
      user,
      isAuthenticated: true,
    }),
  setSessionSecondsRemaining: (seconds: number | null) =>
    set({
      sessionSecondsRemaining: seconds,
    }),
  clearUser: () =>
    set({
      user: null,
      isAuthenticated: false,
      sessionSecondsRemaining: null,
    }),
}));
