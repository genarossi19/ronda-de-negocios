import { createContext, useContext, useState, type ReactNode } from "react";

export interface Representative {
  id: string;
  name: string;
  email: string;
  phone: string;
  position: string;
}

export interface User {
  id: string;
  email: string;
  companyName: string;
  representatives: Representative[];
}
// </CHANGE>

interface AuthContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
  addRepresentative: (representative: Omit<Representative, "id">) => void;
  updateRepresentative: (
    id: string,
    representative: Partial<Representative>
  ) => void;
  deleteRepresentative: (id: string) => void;
  // </CHANGE>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = (userData: User) => {
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
    window.location.href = "#landing";
  };

  const addRepresentative = (representative: Omit<Representative, "id">) => {
    if (!user) return;

    const newRepresentative: Representative = {
      ...representative,
      id: Date.now().toString(),
    };

    setUser({
      ...user,
      representatives: [...user.representatives, newRepresentative],
    });
  };

  const updateRepresentative = (
    id: string,
    updates: Partial<Representative>
  ) => {
    if (!user) return;

    setUser({
      ...user,
      representatives: user.representatives.map((rep) =>
        rep.id === id ? { ...rep, ...updates } : rep
      ),
    });
  };

  const deleteRepresentative = (id: string) => {
    if (!user) return;

    setUser({
      ...user,
      representatives: user.representatives.filter((rep) => rep.id !== id),
    });
  };
  // </CHANGE>

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user,
        addRepresentative,
        updateRepresentative,
        deleteRepresentative,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
