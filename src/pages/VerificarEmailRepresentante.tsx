import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { motion as m } from "motion/react";
import {
  CheckCircle2,
  MailCheck,
  XCircle,
  Loader2,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import Navbar from "../components/Navbar";
import Footer from "../layout/Footer";
import { Button } from "../components/ui/button";
import { verificarEmailRepresentante } from "../api/RepresentanteService";

type ValidationStatus = "loading" | "success" | "error";

export default function VerificarEmailRepresentante() {
  const { uidb64, token } = useParams<{ uidb64: string; token: string }>();
  const navigate = useNavigate();
  const [status, setStatus] = useState<ValidationStatus>("loading");
  const [message, setMessage] = useState("Estamos validando tu correo...");
  const [countdown, setCountdown] = useState<number | null>(null);
  const hasRun = useRef(false);

  const COUNTDOWN_TOTAL = 10;
  const circumference = 2 * Math.PI * 20;
  const countdownProgress =
    countdown !== null
      ? ((COUNTDOWN_TOTAL - countdown) / COUNTDOWN_TOTAL) * 100
      : 0;
  const dashOffset = circumference - (countdownProgress / 100) * circumference;

  useEffect(() => {
    const runValidation = async () => {
      if (hasRun.current) return;
      hasRun.current = true;

      if (!uidb64 || !token) {
        setStatus("error");
        setMessage("El enlace de validacion es invalido o esta incompleto.");
        toast.error("Enlace de validacion invalido");
        return;
      }

      try {
        const response = await verificarEmailRepresentante(uidb64, token);
        setStatus("success");
        setMessage(
          response?.detail ||
            response?.message ||
            "Tu correo fue validado correctamente. Ya podes iniciar sesion.",
        );
      } catch (err: unknown) {
        setStatus("error");

        let backendMessage: string | undefined;
        if (axios.isAxiosError(err)) {
          backendMessage =
            err.response?.data?.detail || err.response?.data?.message;
        }

        const finalMessage =
          backendMessage ||
          "No pudimos validar tu correo. El enlace puede haber expirado o ya fue usado.";

        setMessage(finalMessage);
        toast.error(finalMessage);
      }
    };

    runValidation();
  }, [uidb64, token]);

  useEffect(() => {
    if (status !== "success") {
      setCountdown(null);
      return;
    }

    setCountdown(10);

    const intervalId = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null) return null;

        if (prev <= 1) {
          clearInterval(intervalId);
          navigate("/representantes");
          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, [status, navigate]);

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a1a15] transition-colors duration-300 flex flex-col">
      <Navbar />

      <main className="flex-1 px-4 pt-20 sm:pt-28 pb-10 sm:pb-14">
        <div className="mx-auto max-w-2xl">
          <m.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="rounded-2xl border border-gray-200 dark:border-[#68A243]/20 bg-white dark:bg-[#143E29] shadow-lg overflow-hidden"
          >
            <div className="bg-gradient-to-r from-[#68A243]/15 via-[#68A243]/10 to-[#143E29]/10 dark:from-[#68A243]/25 dark:via-[#68A243]/15 dark:to-[#143E29]/20 px-6 py-8 sm:px-8 border-b border-gray-200 dark:border-[#68A243]/20">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-[#68A243] text-white flex items-center justify-center shadow-md">
                  <MailCheck className="h-6 w-6" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                    Verificacion de correo del representante
                  </h1>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                    Confirmamos que el enlace sea valido para activar tu cuenta
                    de representante.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 sm:p-8 space-y-6">
              {status === "loading" && (
                <div className="flex items-start gap-4 rounded-xl border border-[#68A243]/25 bg-[#68A243]/5 dark:bg-[#68A243]/10 p-4">
                  <Loader2 className="h-6 w-6 text-[#68A243] animate-spin mt-0.5" />
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      Validando enlace
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {message}
                    </p>
                  </div>
                </div>
              )}

              {status === "success" && (
                <div className="flex items-start gap-4 rounded-xl border border-green-200 dark:border-green-500/30 bg-green-50 dark:bg-green-950/20 p-4">
                  <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400 mt-0.5" />
                  <div>
                    <p className="font-semibold text-green-800 dark:text-green-300">
                      Correo del representante validado con exito
                    </p>
                    <p className="text-sm text-green-700 dark:text-green-200">
                      {message}
                    </p>
                  </div>
                </div>
              )}

              {status === "error" && (
                <div className="flex items-start gap-4 rounded-xl border border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-950/20 p-4">
                  <XCircle className="h-6 w-6 text-red-600 dark:text-red-400 mt-0.5" />
                  <div>
                    <p className="font-semibold text-red-800 dark:text-red-300">
                      No se pudo validar el correo del representante
                    </p>
                    <p className="text-sm text-red-700 dark:text-red-200">
                      {message}
                    </p>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    asChild
                    variant="outline"
                    className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-[#68A243]/40 dark:text-[#68A243] dark:hover:bg-[#68A243]/10 h-11"
                  >
                    <Link to="/">
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Volver al inicio
                    </Link>
                  </Button>
                  <Button
                    onClick={() => navigate("/representantes")}
                    className="flex-1 bg-[#143E29] hover:bg-[#1a5c3a] dark:bg-[#68A243] dark:hover:bg-[#5a8f37] text-white font-semibold h-11 gap-2 transition-colors duration-200"
                  >
                    <ArrowRight className="h-4 w-4" />
                    Volver a representantes
                  </Button>
                </div>

                {status === "success" && countdown !== null && (
                  <div className="flex items-center justify-center gap-2.5 pt-1">
                    <div className="relative h-9 w-9 flex-shrink-0">
                      <svg className="h-9 w-9 -rotate-90" viewBox="0 0 48 48">
                        <circle
                          cx="24"
                          cy="24"
                          r="20"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          className="text-gray-200 dark:text-white/10"
                        />
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
                          style={{
                            transition: "stroke-dashoffset 0.9s linear",
                          }}
                        />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-[#143E29] dark:text-[#9FD27B]">
                        {countdown}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Redirigiendo a representantes…
                    </span>
                  </div>
                )}
              </div>
            </div>
          </m.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
