import {
  Building2,
  Code2,
  Heart,
  Layers,
  Mail,
  MapPin,
  Phone,
  Sparkles,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useRef, useState } from "react";
import { useTheme } from "@/context/ThemeContext";
import { Link } from "react-router";

/* ─── Easter Egg Modal ─────────────────────────────────────── */

const AUTHORS_DARK = [
  {
    name: "Genaro Rossi",
    role: "Frontend Developer",
    icon: <Code2 className="h-5 w-5" />,
    color: "from-emerald-500/20 to-teal-500/20",
    border: "border-emerald-500/30",
    badge: "bg-emerald-500/20 text-emerald-300",
    iconText: "text-white/70",
  },
  {
    name: "Facundo Rivero",
    role: "Backend Developer",
    icon: <Layers className="h-5 w-5" />,
    color: "from-blue-500/20 to-indigo-500/20",
    border: "border-blue-500/30",
    badge: "bg-blue-500/20 text-blue-300",
    iconText: "text-white/70",
  },
  {
    name: "Jessica Borla",
    role: "Stakeholder · Product Owner",
    icon: <Sparkles className="h-5 w-5" />,
    color: "from-violet-500/20 to-purple-500/20",
    border: "border-violet-500/30",
    badge: "bg-violet-500/20 text-violet-300",
    iconText: "text-white/70",
  },
];

const AUTHORS_LIGHT = [
  {
    name: "Genaro Rossi",
    role: "Frontend Developer",
    icon: <Code2 className="h-5 w-5" />,
    color: "from-emerald-50 to-teal-50",
    border: "border-emerald-200",
    badge: "bg-emerald-100 text-emerald-700",
    iconText: "text-emerald-600",
  },
  {
    name: "Facundo Rivero",
    role: "Backend Developer",
    icon: <Layers className="h-5 w-5" />,
    color: "from-blue-50 to-indigo-50",
    border: "border-blue-200",
    badge: "bg-blue-100 text-blue-700",
    iconText: "text-blue-600",
  },
  {
    name: "Jessica Borla",
    role: "Stakeholder · Product Owner",
    icon: <Sparkles className="h-5 w-5" />,
    color: "from-violet-50 to-purple-50",
    border: "border-violet-200",
    badge: "bg-violet-100 text-violet-700",
    iconText: "text-violet-600",
  },
];

function EasterEggModal({
  onClose,
  isDark,
}: {
  onClose: () => void;
  isDark: boolean;
}) {
  const AUTHORS = isDark ? AUTHORS_DARK : AUTHORS_LIGHT;

  return (
    /* Overlay — AnimatePresence vive FUERA de este componente en EasterEggTrigger */
    <motion.div
      className="fixed inset-0 z-[999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      {/* Modal */}
      <motion.div
        className={`relative w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl ${
          isDark
            ? "border border-white/10"
            : "border border-gray-200 shadow-gray-300/50"
        }`}
        style={{
          background: isDark
            ? "linear-gradient(135deg, #0a1f14 0%, #0f2d1a 50%, #0a1a2e 100%)"
            : "linear-gradient(135deg, #f0fdf4 0%, #f8faff 50%, #faf5ff 100%)",
        }}
        initial={{ opacity: 0, scale: 0.85, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: "spring", stiffness: 280, damping: 22 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Fondo decorativo: puntos/partículas */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(18)].map((_, i) => (
            <motion.div
              key={i}
              className={`absolute rounded-full ${
                isDark ? "bg-emerald-400/10" : "bg-emerald-300/30"
              }`}
              style={{
                width: Math.random() * 6 + 2,
                height: Math.random() * 6 + 2,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
              }}
              animate={{ y: [0, -8, 0], opacity: [0.3, 0.8, 0.3] }}
              transition={{
                duration: 3 + Math.random() * 3,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>

        {/* Borde superior brillante */}
        <div
          className={`absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent ${
            isDark ? "via-emerald-400/60" : "via-emerald-500/40"
          } to-transparent`}
        />

        {/* Cerrar — z-[60] para garantizar que esté sobre el contenido */}
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 z-[60] p-1.5 rounded-full transition-colors ${
            isDark
              ? "text-white/40 hover:text-white/80 hover:bg-white/10"
              : "text-gray-400 hover:text-gray-700 hover:bg-gray-100"
          }`}
          aria-label="Cerrar"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Contenido — z-[50] por debajo del botón de cerrar */}
        <div className="relative z-[50] p-8">
          {/* Header */}
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <motion.div
              className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4 ${
                isDark
                  ? "bg-emerald-500/15 border border-emerald-500/25"
                  : "bg-emerald-100 border border-emerald-200"
              }`}
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              <Code2
                className={`h-7 w-7 ${isDark ? "text-emerald-400" : "text-emerald-600"}`}
              />
            </motion.div>
            <h2
              className={`text-xl font-bold tracking-tight ${isDark ? "text-white" : "text-gray-800"}`}
            >
              Detrás del código
            </h2>
            <p
              className={`text-sm mt-1 ${isDark ? "text-white/40" : "text-gray-400"}`}
            >
              Las personas que hicieron esto posible
            </p>
          </motion.div>

          {/* Cards de autores */}
          <div className="space-y-3 mb-6">
            {AUTHORS.map((author, i) => (
              <motion.div
                key={author.name}
                className={`flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r ${author.color} border ${author.border} backdrop-blur-sm`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  delay: 0.2 + i * 0.1,
                  type: "spring",
                  stiffness: 200,
                }}
              >
                <div
                  className={`p-2 rounded-lg border ${author.border} ${author.iconText}`}
                >
                  {author.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm font-semibold truncate ${isDark ? "text-white" : "text-gray-800"}`}
                  >
                    {author.name}
                  </p>
                  <span
                    className={`inline-block text-xs px-2 py-0.5 rounded-full mt-0.5 ${author.badge}`}
                  >
                    {author.role}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Organización */}
          <motion.div
            className={`rounded-xl p-4 ${
              isDark
                ? "bg-white/5 border border-white/10"
                : "bg-gray-50 border border-gray-200"
            }`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
          >
            <div className="flex items-start gap-3">
              <Building2
                className={`h-5 w-5 mt-0.5 flex-shrink-0 ${isDark ? "text-emerald-400/70" : "text-emerald-600/70"}`}
              />
              <div>
                <p
                  className={`text-xs font-medium leading-relaxed ${isDark ? "text-white/80" : "text-gray-700"}`}
                >
                  Subsecretaría de Desarrollo Económico y Productivo
                </p>
                <p
                  className={`text-xs mt-0.5 ${isDark ? "text-white/40" : "text-gray-400"}`}
                >
                  en conjunto con el Polo Científico Tecnológico
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <MapPin
                    className={`h-3 w-3 ${isDark ? "text-white/30" : "text-gray-400"}`}
                  />
                  <span
                    className={`text-xs ${isDark ? "text-white/30" : "text-gray-400"}`}
                  >
                    Trenque Lauquen, Buenos Aires
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Footer del modal */}
          <motion.div
            className="flex items-center justify-center gap-1.5 mt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <span
              className={`text-xs ${isDark ? "text-white/25" : "text-gray-400"}`}
            >
              Hecho con
            </span>
            <motion.span
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 1.2, repeat: Infinity }}
            >
              <Heart className="h-3 w-3 text-rose-400 fill-rose-400" />
            </motion.span>
            <span
              className={`text-xs ${isDark ? "text-white/25" : "text-gray-400"}`}
            >
              en Trenque Lauquen
            </span>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─── Easter Egg Trigger ───────────────────────────────────── */

function EasterEggTrigger() {
  const [open, setOpen] = useState(false);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const clickCountRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleClick = useCallback(() => {
    clickCountRef.current += 1;
    if (clickCountRef.current >= 2) {
      clickCountRef.current = 0;
      if (timerRef.current) clearTimeout(timerRef.current);
      setOpen(true);
      return;
    }
    // Reiniciar contador si el usuario deja de hacer clic
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      clickCountRef.current = 0;
    }, 1800);
  }, []);

  return (
    <>
      <button
        onClick={handleClick}
        aria-label=""
        title=""
        className="text-white/[0.12] hover:text-white/25 transition-colors duration-500 text-[10px] font-mono select-none cursor-default focus:outline-none"
        tabIndex={-1}
      >
        {"</>"}
      </button>
      <AnimatePresence>
        {open && (
          <EasterEggModal
            key="easter-egg"
            onClose={() => setOpen(false)}
            isDark={isDark}
          />
        )}
      </AnimatePresence>
    </>
  );
}

/* ─── Footer ───────────────────────────────────────────────── */

export default function Footer() {
  return (
    <footer className="relative bg-primary text-white border-t border-primary/80">
      {/* Contenido principal */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Sección 1 - Descripción */}
          <div>
            <div className="flex items-center gap-2 font-semibold text-lg mb-4">
              <Building2 className="h-6 w-6 text-secondary" />
              <span>Ronda de Negocios</span>
            </div>
            <p className="text-gray-300 leading-relaxed text-sm">
              El evento empresarial más importante de Trenque Lauquen
            </p>
          </div>

          {/* Sección 2 - Enlaces */}
          <div>
            <h3 className="font-semibold mb-4">Enlaces</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  to="/"
                  className="text-gray-300 hover:text-accent transition-colors"
                >
                  Inicio
                </Link>
              </li>
              <li>
                <Link
                  to="/empresas"
                  className="text-gray-300 hover:text-accent transition-colors"
                >
                  Empresas
                </Link>
              </li>
              <li>
                <Link
                  to="/register"
                  className="text-gray-300 hover:text-accent transition-colors"
                >
                  Inscribirse
                </Link>
              </li>
            </ul>
          </div>

          {/* Sección 3 - Contacto */}
          <div>
            <h3 className="font-semibold mb-4">Contacto</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2 text-gray-300">
                <MapPin className="h-5 w-5 text-secondary mt-0.5 flex-shrink-0" />
                <span>Trenque Lauquen, Buenos Aires</span>
              </li>
              <li className="flex items-start gap-2 text-gray-300">
                <Mail className="h-5 w-5 text-secondary mt-0.5 flex-shrink-0" />
                <a
                  href="mailto:secretaria.produccion@trenquelauquen.gov.ar"
                  className="hover:text-accent transition-colors"
                >
                  secretaria.produccion@trenquelauquen.gov.ar
                </a>
              </li>
              <li className="flex items-start gap-2 text-gray-300">
                <Phone className="h-5 w-5 text-secondary mt-0.5 flex-shrink-0" />
                <a
                  href="tel:2392549920"
                  className="hover:text-accent transition-colors"
                >
                  2392 549920
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Franja inferior de logos e info institucional */}
      <div className="relative bg-gradient-to-r from-primary/95 via-primary/90 to-primary/95 border-t border-primary/60">
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col lg:flex-row items-center justify-evenly gap-6">
            {/* Izquierda - Logos */}
            <div className="flex items-center gap-4 lg:gap-6">
              <div className="flex items-center gap-3">
                <img
                  src="/logo_muni_blanco.webp"
                  alt="Municipio de Trenque Lauquen"
                  height={60}
                  className="h-10 w-auto opacity-90 hover:opacity-100 transition-opacity duration-300"
                />
                <div className="w-px h-8 bg-white/20 hidden sm:block"></div>
                <img
                  src="/polo_logo.png"
                  alt="Polo Científico Tecnológico"
                  width={200}
                  height={60}
                  className="h-10 w-auto opacity-90 hover:opacity-100 transition-opacity duration-300 filter brightness-0 invert"
                />
                <div className="w-px h-8 bg-white/20 hidden sm:block"></div>
                <div className="flex flex-col text-xs text-gray-300/80 tracking-wide">
                  <span>Municipio de Trenque Lauquen</span>
                  <span className="text-gray-400/60">
                    Subsecretaria de Desarrollo Económico y Productivo
                  </span>
                </div>
              </div>
            </div>

            {/* Centro - Información general */}
            <div className="flex flex-col lg:flex-row items-center gap-2 text-center lg:text-left">
              <p className="text-sm text-gray-100 font-medium">
                Ronda de Negocios
              </p>
              <span className="hidden sm:inline text-gray-400/60">•</span>
              <p className="text-xs text-gray-300/80">
                {new Date().getFullYear()}
              </p>
              <span className="hidden sm:inline text-gray-400/60">•</span>
              <p className="text-xs text-gray-300/80">
                beta {import.meta.env.VITE_APP_VERSION}
              </p>
              <EasterEggTrigger />
            </div>

            {/* Derecha - Sello o frase */}
            <div className="flex items-center">
              <div className="bg-white/10 backdrop-blur-sm rounded-full px-3 py-1 border border-white/20">
                <p className="text-xs font-semibold text-gray-100 tracking-wider">
                  Oficina de Empleo
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Líneas decorativas */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-white/30 via-white/40 to-white/30 opacity-40"></div>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-white/20 via-white/30 to-white/20 opacity-30"></div>
      </div>
    </footer>
  );
}
