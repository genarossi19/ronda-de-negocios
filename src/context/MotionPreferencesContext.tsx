import React, { createContext, useContext } from "react";
import { useMotionPreferences } from "../hooks/useMotionPreferences";

interface MotionPreferencesContextType {
  shouldReduceMotion: boolean;
  autoDetected: boolean;
  isAutomatic: boolean;
  manualOverride: boolean | null;
  setPreference: (value: boolean | null) => void;
}

const MotionPreferencesContext = createContext<
  MotionPreferencesContextType | undefined
>(undefined);

export const MotionPreferencesProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const preferences = useMotionPreferences();

  return (
    <MotionPreferencesContext.Provider value={preferences}>
      {children}
    </MotionPreferencesContext.Provider>
  );
};

export const useMotionContext = () => {
  const context = useContext(MotionPreferencesContext);
  if (!context) {
    throw new Error(
      "useMotionContext debe ser usado dentro de MotionPreferencesProvider",
    );
  }
  return context;
};
