import { useState } from "react";
import { BookOpen, Cpu, Droplets, Monitor, Wifi } from "lucide-react";
import { Dialog, DialogContent } from "./ui/dialog";
import { useMotionContext } from "../context/MotionPreferencesContext";
import { TUTORIALS_DISABLED_KEY } from "./SpotlightTour";

// ─── Tipos ────────────────────────────────────────────────────────────────────

type SectionId = "animaciones" | "tutoriales";

interface Section {
  id: SectionId;
  label: string;
  icon: React.ElementType;
}

const SECTIONS: Section[] = [
  { id: "animaciones", label: "Animaciones", icon: Monitor },
  { id: "tutoriales", label: "Tutoriales", icon: BookOpen },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getResourceInfo() {
  const info: {
    icon: React.ElementType;
    label: string;
    value: string;
    color: string;
    badge: string;
  }[] = [];

  if ("connection" in navigator) {
    const connection = (
      navigator as { connection?: { effectiveType?: string } }
    ).connection;
    if (connection) {
      info.push({
        icon: Wifi,
        label: "Conexión",
        value: connection.effectiveType?.toUpperCase() ?? "Desconocida",
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

  if ("deviceMemory" in navigator) {
    const memory = (navigator as { deviceMemory?: number }).deviceMemory;
    if (memory !== undefined) {
      info.push({
        icon: Droplets,
        label: "RAM",
        value: `${memory} GB`,
        color: "text-purple-600 dark:text-purple-400",
        badge:
          memory >= 8
            ? "bg-green-100 text-green-800 dark:bg-green-950/30 dark:text-green-400"
            : "bg-yellow-100 text-yellow-800 dark:bg-yellow-950/30 dark:text-yellow-400",
      });
    }
  }

  if ("hardwareConcurrency" in navigator) {
    const cores = navigator.hardwareConcurrency;
    info.push({
      icon: Cpu,
      label: "Procesador",
      value: `${cores} núcleos`,
      color: "text-orange-600 dark:text-orange-400",
      badge:
        cores >= 4
          ? "bg-green-100 text-green-800 dark:bg-green-950/30 dark:text-green-400"
          : "bg-yellow-100 text-yellow-800 dark:bg-yellow-950/30 dark:text-yellow-400",
    });
  }

  return info;
}

// ─── Secciones de contenido ───────────────────────────────────────────────────

function SectionAnimaciones() {
  const { shouldReduceMotion, autoDetected, isAutomatic, setPreference } =
    useMotionContext();

  const [selectedOption, setSelectedOption] = useState<"auto" | "on" | "off">(
    isAutomatic ? "auto" : shouldReduceMotion ? "on" : "off",
  );

  const handleChange = (option: "auto" | "on" | "off") => {
    setSelectedOption(option);
    if (option === "auto") setPreference(null);
    else if (option === "on") setPreference(true);
    else setPreference(false);
  };

  const options: {
    value: "auto" | "on" | "off";
    title: string;
    desc: string;
  }[] = [
    {
      value: "auto",
      title: "Automático (Recomendado)",
      desc: "Detecta si tu dispositivo tiene recursos limitados y ajusta las animaciones.",
    },
    {
      value: "on",
      title: "Reducir animaciones",
      desc: "Desactiva todas las animaciones. Mejora el rendimiento en dispositivos limitados.",
    },
    {
      value: "off",
      title: "Animaciones completas",
      desc: "Habilita todos los efectos visuales. Requiere más recursos del dispositivo.",
    },
  ];

  const resourceInfo = getResourceInfo();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-semibold text-[#143E29] dark:text-white mb-1">
          Animaciones
        </h2>
        <p className="text-sm text-muted-foreground dark:text-gray-400">
          Controlá las transiciones y efectos de la interfaz.
        </p>
      </div>

      <div className="space-y-2.5">
        {options.map((opt) => (
          <label
            key={opt.value}
            className={`flex items-start gap-3.5 p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
              selectedOption === opt.value
                ? "border-[#68A243] bg-[#68A243]/5 dark:bg-[#68A243]/10"
                : "border-gray-200 dark:border-[#68A243]/15 hover:border-[#68A243]/40 dark:hover:border-[#68A243]/30"
            }`}
          >
            <input
              type="radio"
              checked={selectedOption === opt.value}
              onChange={() => handleChange(opt.value)}
              className="mt-0.5 h-4 w-4 accent-[#68A243] shrink-0"
            />
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {opt.title}
              </p>
              <p className="text-xs text-muted-foreground dark:text-gray-400 mt-0.5">
                {opt.desc}
              </p>
              {opt.value === "auto" && autoDetected && (
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-1.5 bg-amber-50 dark:bg-amber-950/20 px-2 py-1 rounded-md inline-block">
                  ⚠️ Se detectaron recursos limitados
                </p>
              )}
            </div>
          </label>
        ))}
      </div>

      <div className="rounded-xl bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/50 px-4 py-3">
        <p className="text-sm text-blue-900 dark:text-blue-100">
          <strong>Estado actual:</strong>{" "}
          {shouldReduceMotion
            ? "✓ Animaciones reducidas"
            : "✓ Animaciones habilitadas"}
        </p>
      </div>

      {/* Información del dispositivo */}
      {resourceInfo.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground dark:text-gray-500">
            Dispositivo detectado
          </p>
          <div className="divide-y divide-gray-100 dark:divide-[#68A243]/15 rounded-xl border border-gray-200 dark:border-[#68A243]/15 overflow-hidden">
            {resourceInfo.map((info, idx) => {
              const Icon = info.icon;
              return (
                <div
                  key={idx}
                  className="flex items-center justify-between px-4 py-3"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gray-100 dark:bg-[#0f2f25]">
                      <Icon className={`h-3.5 w-3.5 ${info.color}`} />
                    </div>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {info.label}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-900 dark:text-white tabular-nums">
                      {info.value}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${info.badge}`}
                    >
                      {info.value.includes("4G") ||
                      info.value.includes("16") ||
                      (info.label === "RAM" && parseFloat(info.value) >= 8) ||
                      (info.label === "Procesador" && parseInt(info.value) >= 4)
                        ? "Óptimo"
                        : "Limitado"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function SectionTutoriales() {
  const [tutorialsDisabled, setTutorialsDisabled] = useState(
    localStorage.getItem(TUTORIALS_DISABLED_KEY) === "1",
  );

  const handleToggle = () => {
    const next = !tutorialsDisabled;
    setTutorialsDisabled(next);
    if (next) {
      localStorage.setItem(TUTORIALS_DISABLED_KEY, "1");
    } else {
      localStorage.removeItem(TUTORIALS_DISABLED_KEY);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-semibold text-[#143E29] dark:text-white mb-1">
          Tutoriales
        </h2>
        <p className="text-sm text-muted-foreground dark:text-gray-400">
          Los tutoriales interactivos aparecen la primera vez que visitás cada
          sección.
        </p>
      </div>

      <div className="divide-y divide-gray-100 dark:divide-[#68A243]/15">
        <div className="flex items-center justify-between py-4">
          <div className="flex-1 min-w-0 pr-4">
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              Tutoriales interactivos
            </p>
            <p className="text-xs text-muted-foreground dark:text-gray-400 mt-0.5">
              {tutorialsDisabled
                ? "No aparecerán tutoriales ni el botón de ayuda"
                : "Se mostrarán la primera vez que visites cada sección"}
            </p>
          </div>
          {/* Toggle switch */}
          <button
            type="button"
            onClick={handleToggle}
            className={`relative shrink-0 h-6 w-11 rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#68A243] ${
              tutorialsDisabled
                ? "bg-gray-300 dark:bg-gray-600"
                : "bg-[#68A243]"
            }`}
            role="switch"
            aria-checked={!tutorialsDisabled}
          >
            <div
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                tutorialsDisabled ? "translate-x-0.5" : "translate-x-5"
              }`}
            />
          </button>
        </div>
      </div>

      {!tutorialsDisabled && (
        <div className="rounded-xl bg-amber-50 dark:bg-amber-950/15 border border-amber-200 dark:border-amber-900/40 px-4 py-3 space-y-1">
          <p className="text-xs font-medium text-amber-800 dark:text-amber-300">
            ¿Querés volver a ver un tutorial?
          </p>
          <p className="text-xs text-amber-700/80 dark:text-amber-400/70">
            Usá el botón{" "}
            <span className="inline-flex items-center gap-1 font-medium">
              <BookOpen className="h-3 w-3" /> Ayuda
            </span>{" "}
            que aparece en la esquina inferior derecha de cada sección del
            panel.
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Modal principal ───────────────────────────────────────────────────────────

interface SettingsModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function SettingsModal({
  isOpen,
  onOpenChange,
}: SettingsModalProps) {
  const [activeSection, setActiveSection] = useState<SectionId>("animaciones");

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        className="!flex !flex-col p-0 gap-0 overflow-hidden border-gray-200 dark:border-[#68A243]/20 bg-white dark:bg-[#11161d] sm:max-w-3xl w-full"
        style={{ height: "min(600px, 90vh)" }}
      >
        {/* Layout: sidebar + content */}
        <div className="flex flex-1 min-h-0">
          {/* ── Sidebar ────────────────────────────────────── */}
          <div className="w-52 shrink-0 border-r border-gray-100 dark:border-[#68A243]/15 bg-gray-50 dark:bg-[#0e1c16] flex flex-col">
            {/* Header del sidebar */}
            <div className="px-5 pt-5 pb-4 border-b border-gray-100 dark:border-[#68A243]/15">
              <h1 className="text-base font-semibold text-gray-900 dark:text-white">
                Configuración
              </h1>
            </div>

            {/* Navegación */}
            <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
              {SECTIONS.map((section) => {
                const Icon = section.icon;
                const isActive = activeSection === section.id;
                return (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors text-left ${
                      isActive
                        ? "bg-white dark:bg-[#143E29] text-[#143E29] dark:text-white font-medium shadow-sm"
                        : "text-gray-600 dark:text-gray-400 hover:bg-white/70 dark:hover:bg-[#143E29]/50 hover:text-gray-900 dark:hover:text-white"
                    }`}
                  >
                    <Icon
                      className={`h-4 w-4 shrink-0 ${isActive ? "text-[#68A243]" : ""}`}
                    />
                    {section.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* ── Contenido (sin barra extra — el X es del propio DialogContent) ── */}
          <div className="flex-1 flex flex-col min-w-0 pt-10">
            <div className="flex-1 overflow-y-auto px-6 py-5">
              {activeSection === "animaciones" && <SectionAnimaciones />}
              {activeSection === "tutoriales" && <SectionTutoriales />}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
