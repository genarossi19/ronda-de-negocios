import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { motion as m } from "motion/react";
import { CheckCircle2, Mail, LogIn, Building2, Inbox } from "lucide-react";
import { Button } from "../components/ui/button";
import Navbar from "../components/Navbar";
import Footer from "../layout/Footer";

const EMAIL_KEY = "registerSuccessEmail";
const NAME_KEY = "registerSuccessName";
const COUNTDOWN_SECONDS = 30;

export default function RegisterSuccess() {
  const navigate = useNavigate();
  const [email, setEmail] = useState<string | null>(null);
  const [name, setName] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);

  useEffect(() => {
    const storedEmail = localStorage.getItem(EMAIL_KEY);
    const storedName = localStorage.getItem(NAME_KEY);
    setEmail(storedEmail);
    setName(storedName);
  }, []);

  // Fix: sin hasStarted.current, el cleanup maneja correctamente StrictMode
  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          localStorage.removeItem(EMAIL_KEY);
          localStorage.removeItem(NAME_KEY);
          navigate("/login");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [navigate]);

  const handleGoToLogin = () => {
    localStorage.removeItem(EMAIL_KEY);
    localStorage.removeItem(NAME_KEY);
    navigate("/login");
  };

  const progress = ((COUNTDOWN_SECONDS - countdown) / COUNTDOWN_SECONDS) * 100;
  const circumference = 2 * Math.PI * 20;
  const dashOffset = circumference - (progress / 100) * circumference;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a1a15] transition-colors duration-300 flex flex-col">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-4 pt-20 sm:pt-24 pb-10">
        <m.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-lg lg:max-w-4xl"
        >
          {/* Card — vertical en mobile, horizontal en desktop */}
          <div className="rounded-2xl border border-gray-200 dark:border-[#68A243]/20 bg-white dark:bg-[#0f2416] shadow-xl overflow-hidden flex flex-col lg:flex-row">
            {/* Panel izquierdo / header mobile — gradiente verde */}
            <div className="relative lg:w-5/12 bg-gradient-to-br from-[#143E29] via-[#1a5c3a] to-[#0d2e1e] px-6 py-8 sm:px-8 sm:py-10 lg:py-12 overflow-hidden flex-shrink-0">
              {/* Decoración */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-10 -right-10 h-48 w-48 rounded-full bg-[#68A243]/10" />
                <div className="absolute -bottom-8 -left-8 h-36 w-36 rounded-full bg-[#68A243]/8" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-72 w-72 rounded-full bg-white/[0.03]" />
              </div>

              <div className="relative z-10 flex flex-col items-center text-center lg:items-start lg:text-left gap-5 lg:h-full lg:justify-center">
                {/* Ícono animado */}
                <m.div
                  initial={{ scale: 0, rotate: -15 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{
                    delay: 0.2,
                    type: "spring",
                    stiffness: 200,
                    damping: 15,
                  }}
                  className="h-16 w-16 rounded-2xl bg-[#68A243] flex items-center justify-center shadow-lg shadow-[#68A243]/30 flex-shrink-0"
                >
                  <CheckCircle2 className="h-9 w-9 text-white" />
                </m.div>

                <m.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35, duration: 0.45 }}
                  className="space-y-2"
                >
                  <p className="text-[#9FD27B] text-xs font-semibold uppercase tracking-widest">
                    Registro completado
                  </p>
                  <h1 className="text-2xl sm:text-3xl lg:text-2xl xl:text-3xl font-bold text-white leading-tight">
                    {name ? (
                      <>
                        ¡Bienvenido/a,{" "}
                        <span className="text-[#9FD27B]">{name}</span>!
                      </>
                    ) : (
                      "¡Bienvenido/a a la Ronda de Negocios!"
                    )}
                  </h1>
                  <p className="text-sm text-white/65 leading-relaxed lg:max-w-xs">
                    Tu empresa fue registrada exitosamente. Gracias por sumarte
                    a nuestro evento empresarial.
                  </p>
                </m.div>

                {/* Tagline — solo desktop, queda en el panel verde */}
                <p className="hidden lg:block text-xs text-white/30 mt-auto pt-6">
                  Ronda de Negocios · Evento empresarial
                </p>
              </div>
            </div>

            {/* Panel derecho / cuerpo mobile */}
            <div className="flex-1 p-6 sm:p-8 lg:py-10 lg:px-10 flex flex-col justify-center space-y-5">
              {/* Aviso de email */}
              <m.div
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5, duration: 0.4 }}
                className="flex items-start gap-4 rounded-xl border border-[#68A243]/25 bg-[#68A243]/5 dark:bg-[#68A243]/10 p-4"
              >
                <div className="mt-0.5 flex-shrink-0 h-9 w-9 rounded-lg bg-[#68A243]/15 dark:bg-[#68A243]/20 flex items-center justify-center">
                  <Inbox className="h-5 w-5 text-[#68A243] dark:text-[#9FD27B]" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-gray-900 dark:text-white text-sm">
                    Verificá tu casilla de correo
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-0.5 leading-relaxed">
                    Te enviamos un enlace de activación
                    {email ? (
                      <>
                        {" "}
                        a{" "}
                        <span className="font-medium text-[#143E29] dark:text-[#9FD27B] break-all">
                          {email}
                        </span>
                      </>
                    ) : (
                      ""
                    )}
                    . Hacé clic en ese enlace antes de iniciar sesión.
                  </p>
                </div>
              </m.div>

              {/* Próximos pasos */}
              <m.div
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.62, duration: 0.4 }}
                className="rounded-xl border border-gray-200 dark:border-[#68A243]/15 bg-gray-50 dark:bg-[#0a1a15]/60 p-4 space-y-3"
              >
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Próximos pasos
                </p>
                {[
                  { icon: Mail, text: "Revisá tu bandeja de entrada (y spam)" },
                  {
                    icon: CheckCircle2,
                    text: "Hacé clic en el enlace de activación",
                  },
                  {
                    icon: Building2,
                    text: "Iniciá sesión y gestioná tus representantes",
                  },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="h-6 w-6 rounded-full bg-[#68A243]/15 dark:bg-[#68A243]/20 flex items-center justify-center flex-shrink-0">
                      <item.icon className="h-3.5 w-3.5 text-[#68A243] dark:text-[#9FD27B]" />
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {item.text}
                    </p>
                  </div>
                ))}
              </m.div>

              {/* Botón + countdown */}
              <m.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.75, duration: 0.4 }}
                className="flex flex-col sm:flex-row items-center gap-3 pt-1"
              >
                <Button
                  onClick={handleGoToLogin}
                  className="w-full sm:flex-1 bg-[#143E29] hover:bg-[#1a5c3a] dark:bg-[#68A243] dark:hover:bg-[#5a8f37] text-white font-semibold h-11 gap-2 transition-colors duration-200"
                >
                  <LogIn className="h-4 w-4" />
                  Iniciar sesión
                </Button>

                {/* Countdown circular */}
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 flex-shrink-0">
                  <div className="relative h-10 w-10">
                    <svg className="h-10 w-10 -rotate-90" viewBox="0 0 48 48">
                      {/* Track */}
                      <circle
                        cx="24"
                        cy="24"
                        r="20"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        className="text-gray-200 dark:text-white/10"
                      />
                      {/* Progress */}
                      <circle
                        cx="24"
                        cy="24"
                        r="20"
                        fill="none"
                        stroke="#68A243"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={dashOffset}
                        style={{ transition: "stroke-dashoffset 0.9s linear" }}
                      />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-[#143E29] dark:text-[#9FD27B]">
                      {countdown}
                    </span>
                  </div>
                  <span className="text-xs leading-tight max-w-[90px]">
                    Redirigiendo al login…
                  </span>
                </div>
              </m.div>
            </div>
          </div>

          {/* Tagline mobile */}
          <m.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.5 }}
            className="lg:hidden text-center text-xs text-gray-400 dark:text-gray-500 mt-5"
          >
            Ronda de Negocios · Evento empresarial
          </m.p>
        </m.div>
      </main>

      <Footer />
    </div>
  );
}
