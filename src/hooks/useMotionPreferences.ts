import { useState, useEffect, useCallback } from "react";

/**
 * Detecta recursos disponibles en el dispositivo
 * Retorna true si los recursos son limitados (animaciones deberían desactivarse)
 */
const detectLimitedResources = (): boolean => {
  // 1. Detección por prefers-reduced-motion (OS accessibility setting)
  const prefersReduced = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  if (prefersReduced) return true;

  // 2. Detección por conexión de red (si es lenta, probablemente en móvil limitado)
  if ("connection" in navigator) {
    const connection = (navigator as any).connection;
    if (connection) {
      const effectiveType = connection.effectiveType;
      // 2g, 3g = conexión lenta
      if (effectiveType === "2g" || effectiveType === "3g") return true;

      // Si está en data saver mode
      if (connection.saveData) return true;
    }
  }

  // 3. Detección por memoria disponible
  if ("deviceMemory" in navigator) {
    const memory = (navigator as any).deviceMemory;
    // Si tiene menos de 4GB de RAM, probablemente sea limitado
    if (memory < 4) return true;
  }

  // 4. Detección por CPU cores (menos cores = dispositivo más lento)
  if ("hardwareConcurrency" in navigator) {
    const cores = navigator.hardwareConcurrency;
    // Si tiene menos de 2 cores, es muy limitado
    if (cores < 2) return true;
  }

  return false;
};

/**
 * Hook para gestionar preferencias de animaciones
 * Detecta automáticamente y permite override manual vía localStorage
 */
export const useMotionPreferences = () => {
  const STORAGE_KEY = "motion-preferences-reduced";

  // Leer del localStorage en la inicialización
  const getInitialPreference = (): {
    override: boolean | null;
    shouldReduce: boolean;
  } => {
    if (typeof window === "undefined") {
      return { override: null, shouldReduce: detectLimitedResources() };
    }

    const stored = localStorage.getItem(STORAGE_KEY);

    if (stored === null) {
      // Auto mode: usar detección automática
      const autoDetected = detectLimitedResources();
      return { override: null, shouldReduce: autoDetected };
    } else if (stored === "true") {
      // Reducir siempre
      return { override: true, shouldReduce: true };
    } else {
      // Mostrar animaciones siempre
      return { override: false, shouldReduce: false };
    }
  };

  const initial = getInitialPreference();
  const [manualOverride, setManualOverride] = useState<boolean | null>(
    initial.override,
  );
  const [autoDetected, setAutoDetected] = useState(detectLimitedResources());
  const [shouldReduceMotion, setShouldReduceMotion] = useState(
    initial.shouldReduce,
  );

  // Escuchar cambios en prefers-reduced-motion del SO
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const handleChange = (e: MediaQueryListEvent | MediaQueryList) => {
      setAutoDetected(e.matches);
      // Si no hay override manual, actualizar automáticamente
      if (manualOverride === null) {
        setShouldReduceMotion(e.matches);
      }
    };

    // Escuchar cambios futuros
    mediaQuery.addEventListener("change", handleChange);

    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [manualOverride]);

  // Actualizar shouldReduceMotion cuando cambia el override manual
  useEffect(() => {
    if (manualOverride === null) {
      setShouldReduceMotion(autoDetected);
    } else {
      setShouldReduceMotion(manualOverride);
    }
  }, [manualOverride, autoDetected]);

  // Listener para cambios de localStorage (ej: desde otro tab o Settings actualiza)
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY) {
        const newStored = event.newValue;

        if (newStored === null) {
          setManualOverride(null);
        } else if (newStored === "true") {
          setManualOverride(true);
        } else {
          setManualOverride(false);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  /**
   * Setter para override manual
   * null = auto, true = reducir, false = normal
   */
  const setPreference = useCallback((value: boolean | null) => {
    if (value === null) {
      localStorage.removeItem(STORAGE_KEY);
      setManualOverride(null);
    } else {
      localStorage.setItem(STORAGE_KEY, String(value));
      setManualOverride(value);
    }
  }, []);

  return {
    shouldReduceMotion,
    autoDetected,
    isAutomatic: manualOverride === null,
    manualOverride,
    setPreference,
  };
};

/**
 * Retorna propiedades de transición optimizadas
 * Si shouldReduceMotion = true, retorna transición sin duración (instant)
 * Si shouldReduceMotion = false, retorna transición normal
 */
export const getOptimizedTransition = (
  shouldReduce: boolean,
  normalTransition: any,
) => {
  if (shouldReduce) {
    return { duration: 0 };
  }
  return normalTransition;
};

/**
 * Retorna la duración optimizada
 */
export const getOptimizedDuration = (
  shouldReduce: boolean,
  normalDuration: number = 0.35,
) => {
  return shouldReduce ? 0 : normalDuration;
};

/**
 * Para usar en animaciones simples de motion
 */
export const getAnimationVariant = (shouldReduce: boolean) => {
  if (shouldReduce) {
    return {
      initial: "visible",
      animate: "visible",
      exit: "hidden",
      variants: {
        visible: { opacity: 1, scale: 1, y: 0 },
        hidden: { opacity: 1, scale: 1, y: 0 },
      },
      transition: { duration: 0 },
    };
  }

  return {
    initial: "hidden",
    animate: "visible",
    exit: "hidden",
    variants: {
      visible: { opacity: 1, scale: 1, y: 0 },
      hidden: { opacity: 0, scale: 0.95, y: 10 },
    },
    transition: { duration: 0.3, type: "spring", stiffness: 200 },
  };
};
