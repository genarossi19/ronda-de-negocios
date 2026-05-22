import { useState } from "react";
import { useNavigate } from "react-router";
import {
  ArrowLeft,
  BookOpen,
  Monitor,
  Zap,
  Wifi,
  Cpu,
  Droplets,
} from "lucide-react";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import Navbar from "../components/Navbar";
import Footer from "../layout/Footer";
import { useMotionContext } from "../context/MotionPreferencesContext";
import { TUTORIALS_DISABLED_KEY } from "../components/SpotlightTour";

export default function Settings() {
  const navigate = useNavigate();
  const { shouldReduceMotion, autoDetected, isAutomatic, setPreference } =
    useMotionContext();

  const [selectedOption, setSelectedOption] = useState<"auto" | "on" | "off">(
    isAutomatic ? "auto" : shouldReduceMotion ? "on" : "off",
  );

  const [tutorialsDisabled, setTutorialsDisabled] = useState(
    localStorage.getItem(TUTORIALS_DISABLED_KEY) === "1",
  );

  const handleTutorialsToggle = () => {
    const next = !tutorialsDisabled;
    setTutorialsDisabled(next);
    if (next) {
      localStorage.setItem(TUTORIALS_DISABLED_KEY, "1");
    } else {
      localStorage.removeItem(TUTORIALS_DISABLED_KEY);
    }
  };

  const handlePreferenceChange = (option: "auto" | "on" | "off") => {
    setSelectedOption(option);

    if (option === "auto") {
      setPreference(null);
    } else if (option === "on") {
      setPreference(true);
    } else {
      setPreference(false);
    }
  };

  const getResourceInfo = () => {
    const info = [];

    // Conexión
    if ("connection" in navigator) {
      const connection = (navigator as any).connection;
      if (connection) {
        info.push({
          icon: Wifi,
          label: "Conexión",
          value: connection.effectiveType?.toUpperCase() || "Desconocida",
          color: "text-blue-600 dark:text-blue-400",
          badge:
            connection.effectiveType === "4g"
              ? "bg-green-100 text-green-800 dark:bg-green-950/30 dark:text-green-400"
              : connection.effectiveType === "3g"
                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-950/30 dark:text-yellow-400"
                : "bg-red-100 text-red-800 dark:bg-red-950/30 dark:text-red-400",
        });
      }
    }

    // Memoria
    if ("deviceMemory" in navigator) {
      const memory = (navigator as any).deviceMemory;
      info.push({
        icon: Droplets,
        label: "RAM",
        value: `${memory}GB`,
        color: "text-purple-600 dark:text-purple-400",
        badge:
          memory >= 8
            ? "bg-green-100 text-green-800 dark:bg-green-950/30 dark:text-green-400"
            : "bg-yellow-100 text-yellow-800 dark:bg-yellow-950/30 dark:text-yellow-400",
      });
    }

    // CPU Cores
    if ("hardwareConcurrency" in navigator) {
      const cores = navigator.hardwareConcurrency;
      info.push({
        icon: Cpu,
        label: "Procesador",
        value: `${cores} cores`,
        color: "text-orange-600 dark:text-orange-400",
        badge:
          cores >= 4
            ? "bg-green-100 text-green-800 dark:bg-green-950/30 dark:text-green-400"
            : "bg-yellow-100 text-yellow-800 dark:bg-yellow-950/30 dark:text-yellow-400",
      });
    }

    return info;
  };

  const resourceInfo = getResourceInfo();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a1a15] transition-colors duration-300 flex flex-col">
      <Navbar />

      <main className="flex-1 pt-24 pb-12 px-4">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <section className="rounded-3xl bg-gradient-to-br from-[#143E29] via-[#1a5236] to-[#143E29] px-6 py-8 text-white shadow-xl shadow-[#143E29]/10">
            <div className="flex items-center gap-4 mb-4">
              <Button
                variant="ghost"
                onClick={() => navigate(-1)}
                className="w-fit px-0 text-white/90 hover:bg-white/10 hover:text-white"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-[#9FD27B] ring-1 ring-white/15 backdrop-blur-sm">
                <Zap className="h-5 w-5" />
              </div>
              <h1 className="text-3xl sm:text-4xl font-semibold">
                Configuración
              </h1>
            </div>
            <p className="text-white/80">
              Personaliza tu experiencia de usuario
            </p>
          </section>

          {/* Motion Preferences Card */}
          <Card className="border-[#68A243]/20 dark:bg-[#143E29]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                <Monitor className="h-5 w-5 text-[#68A243]" />
                Animaciones
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Description */}
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                Controla las animaciones de la interfaz. Reducir animaciones
                mejora el rendimiento en dispositivos con recursos limitados o
                cuando tienes sensibilidad al movimiento.
              </p>

              {/* Options */}
              <div className="space-y-3">
                {/* Auto Option */}
                <label
                  className={`flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedOption === "auto"
                      ? "border-[#68A243] bg-[#68A243]/5 dark:bg-[#68A243]/10"
                      : "border-gray-200 dark:border-[#68A243]/20 hover:border-[#68A243]/50"
                  }`}
                >
                  <div className="flex-shrink-0 mt-1">
                    <input
                      type="radio"
                      checked={selectedOption === "auto"}
                      onChange={() => handlePreferenceChange("auto")}
                      className="h-4 w-4 accent-[#68A243]"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      Automático (Recomendado)
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Detecta automáticamente si tu dispositivo tiene recursos
                      limitados y ajusta las animaciones según corresponda.
                    </p>
                    {autoDetected && (
                      <p className="text-xs text-amber-600 dark:text-amber-400 mt-2 bg-amber-50 dark:bg-amber-950/20 px-2 py-1 rounded-md inline-block">
                        ⚠️ Se detectaron recursos limitados en tu dispositivo
                      </p>
                    )}
                  </div>
                </label>

                {/* Reduce Motion Option */}
                <label
                  className={`flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedOption === "on"
                      ? "border-[#68A243] bg-[#68A243]/5 dark:bg-[#68A243]/10"
                      : "border-gray-200 dark:border-[#68A243]/20 hover:border-[#68A243]/50"
                  }`}
                >
                  <div className="flex-shrink-0 mt-1">
                    <input
                      type="radio"
                      checked={selectedOption === "on"}
                      onChange={() => handlePreferenceChange("on")}
                      className="h-4 w-4 accent-[#68A243]"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      Reducir animaciones
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Desactiva todas las animaciones. Mejora significativamente
                      el rendimiento en dispositivos limitados.
                    </p>
                  </div>
                </label>

                {/* Full Motion Option */}
                <label
                  className={`flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedOption === "off"
                      ? "border-[#68A243] bg-[#68A243]/5 dark:bg-[#68A243]/10"
                      : "border-gray-200 dark:border-[#68A243]/20 hover:border-[#68A243]/50"
                  }`}
                >
                  <div className="flex-shrink-0 mt-1">
                    <input
                      type="radio"
                      checked={selectedOption === "off"}
                      onChange={() => handlePreferenceChange("off")}
                      className="h-4 w-4 accent-[#68A243]"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      Animaciones completas
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Habilita todas las animaciones y efectos visuales.
                      Requiere más recursos del dispositivo.
                    </p>
                  </div>
                </label>
              </div>

              {/* Status */}
              <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/50">
                <p className="text-sm text-blue-900 dark:text-blue-100">
                  <strong>Estado actual:</strong>{" "}
                  {shouldReduceMotion
                    ? "✓ Animaciones reducidas"
                    : "✓ Animaciones habilitadas"}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Tutorials Card */}
          <Card className="border-[#68A243]/20 dark:bg-[#143E29]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                <BookOpen className="h-5 w-5 text-[#68A243]" />
                Tutoriales
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                Los tutoriales interactivos aparecen automáticamente la primera
                vez que visitás una sección nueva para guiarte en el uso del
                panel. Podés desactivarlos si ya no los necesitás.
              </p>

              {/* Toggle row */}
              <div
                className={`flex items-center justify-between gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all select-none ${
                  tutorialsDisabled
                    ? "border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/10"
                    : "border-[#68A243]/30 bg-[#68A243]/5 dark:bg-[#68A243]/10"
                }`}
                onClick={handleTutorialsToggle}
              >
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                    {tutorialsDisabled
                      ? "Tutoriales desactivados"
                      : "Tutoriales activados"}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {tutorialsDisabled
                      ? "No aparecerán tutoriales ni el botón de ayuda en ninguna sección"
                      : "Los tutoriales se mostrarán la primera vez que visites cada sección"}
                  </p>
                </div>
                {/* Switch visual */}
                <div
                  className={`relative flex-shrink-0 h-6 w-11 rounded-full transition-colors duration-200 ${
                    tutorialsDisabled
                      ? "bg-red-400 dark:bg-red-600"
                      : "bg-[#68A243]"
                  }`}
                >
                  <div
                    className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                      tutorialsDisabled ? "translate-x-5" : "translate-x-0.5"
                    }`}
                  />
                </div>
              </div>

              {/* Reset individual tours */}
              {!tutorialsDisabled && (
                <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-950/15 border border-amber-200 dark:border-amber-900/40 space-y-2">
                  <p className="text-xs font-medium text-amber-800 dark:text-amber-300">
                    ¿Querés volver a ver un tutorial específico?
                  </p>
                  <p className="text-xs text-amber-700/80 dark:text-amber-400/70">
                    Usá el botón{" "}
                    <span className="inline-flex items-center gap-1 font-medium">
                      <BookOpen className="h-3 w-3" /> Ayuda
                    </span>{" "}
                    que aparece en la esquina inferior derecha de cada sección
                    del panel de administración.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Device Info Card */}
          {resourceInfo.length > 0 && (
            <Card className="border-[#68A243]/20 dark:bg-[#143E29]">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white">
                  Información del dispositivo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {resourceInfo.map((info, idx) => {
                    const Icon = info.icon;
                    return (
                      <div
                        key={idx}
                        className="p-4 rounded-lg bg-gray-50 dark:bg-[#0f2f25] border border-gray-200 dark:border-[#68A243]/20"
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <Icon className={`h-5 w-5 ${info.color}`} />
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                            {info.label}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold text-gray-900 dark:text-white">
                            {info.value}
                          </span>
                          <span
                            className={`text-xs font-medium px-2 py-1 rounded-md ${info.badge}`}
                          >
                            {info.value === "4G"
                              ? "Óptimo"
                              : info.value === "3G"
                                ? "Limitado"
                                : ""}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Info Card */}
          <Card className="border-[#68A243]/20 dark:bg-[#143E29]">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">
                ¿Por qué reducir animaciones?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
              <p>
                <strong className="text-gray-900 dark:text-white">
                  Mejor rendimiento:
                </strong>{" "}
                Las animaciones consumen recursos del CPU y GPU. Desactivarlas
                mejora la velocidad de respuesta.
              </p>
              <p>
                <strong className="text-gray-900 dark:text-white">
                  Accesibilidad:
                </strong>{" "}
                Algunas personas experimentan mareos o desorientación con
                movimientos excesivos.
              </p>
              <p>
                <strong className="text-gray-900 dark:text-white">
                  Dispositivos limitados:
                </strong>{" "}
                Celulares antiguos, computadoras con pocos recursos, o durante
                batería baja.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
