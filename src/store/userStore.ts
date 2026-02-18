import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface User {
  user_id: number;
  empresa_id: number;
  razon_social: string;
  is_superuser: boolean;
  token_type: string;
}

interface UserStore {
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      setUser: (user: User) =>
        set({
          user,
          isAuthenticated: true,
        }),
      clearUser: () =>
        set({
          user: null,
          isAuthenticated: false,
        }),
    }),
    {
      name: "user-store",
    },
  ),
);
