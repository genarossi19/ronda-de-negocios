import type React from "react";
import { useState, useEffect } from "react";
import { ArrowLeft, Mail, CheckCircle2 } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import Navbar from "../components/Navbar";
import { Link } from "react-router";
import { motion as m } from "motion/react";
import { useTheme } from "../context/ThemeContext";
import { requestPasswordReset } from "../api/LoginService";

export default function ForgotPassword() {
  const { resolvedTheme } = useTheme();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Cursor trail effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const validateEmail = (emailToValidate: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(emailToValidate);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email) {
      setError("Por favor ingresá tu email");
      return;
    }

    if (!validateEmail(email)) {
      setError("Por favor ingresá un email válido");
      return;
    }

    setIsLoading(true);

    try {
      await requestPasswordReset(email);
      setSuccess(true);
      setEmail("");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Error al enviar el email";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a1a15] relative overflow-hidden transition-colors duration-300">
      {/* Cursor Trail Effect */}
      <div
        className={`fixed w-64 h-64 rounded-full blur-3xl pointer-events-none z-0 transition-colors duration-300 ${
          resolvedTheme === "dark"
            ? "bg-[#68A243]/20 shadow-2xl shadow-[#68A243]/20"
            : "bg-[#68A243]/15 shadow-2xl shadow-[#68A243]/15"
        }`}
        style={{
          left: `${mousePos.x}px`,
          top: `${mousePos.y}px`,
          transform: "translate(-50%, -50%)",
          transition: "left 0.1s ease-out, top 0.1s ease-out",
        }}
      />

      {/* Animated gradient background */}
      <div className="absolute inset-0">
        <m.div
          className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-[#68A243]/30 dark:from-[#68A243]/20 to-transparent rounded-full blur-3xl"
          animate={{
            y: [0, 50, 0],
            x: [0, 30, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <m.div
          className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-[#143E29]/20 dark:from-[#68A243]/10 to-transparent rounded-full blur-3xl"
          animate={{
            y: [0, -50, 0],
            x: [0, -30, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div
          className="w-full h-full"
          style={{
            backgroundImage:
              "linear-gradient(0deg, transparent 24%, rgba(104, 162, 67, 0.05) 25%, rgba(104, 162, 67, 0.05) 26%, transparent 27%, transparent 74%, rgba(104, 162, 67, 0.05) 75%, rgba(104, 162, 67, 0.05) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(104, 162, 67, 0.05) 25%, rgba(104, 162, 67, 0.05) 26%, transparent 27%, transparent 74%, rgba(104, 162, 67, 0.05) 75%, rgba(104, 162, 67, 0.05) 76%, transparent 77%, transparent)",
            backgroundSize: "50px 50px",
          }}
        />
      </div>

      <Navbar />

      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 pt-20 relative z-10">
        <m.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full max-w-md"
        >
          {/* Back Button */}
          <m.div variants={itemVariants} className="mb-8">
            <Link to="/login">
              <Button
                variant="ghost"
                className="text-gray-600 dark:text-gray-300 hover:text-[#68A243] dark:hover:text-[#68A243] hover:bg-gray-100 dark:hover:bg-[#143E29] transition-all duration-300"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver al login
              </Button>
            </Link>
          </m.div>

          {/* Form Container */}
          <m.div
            variants={itemVariants}
            className="bg-white dark:bg-[#143E29] rounded-2xl border border-gray-200 dark:border-[#68A243]/20 p-8 shadow-xl shadow-gray-200/50 dark:shadow-black/50 transition-colors duration-300"
          >
            {!success ? (
              <>
                {/* Header */}
                <div className="space-y-2 mb-8">
                  <h2 className="text-3xl font-bold text-[#143E29] dark:text-white transition-colors">
                    Recuperar contraseña
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300 text-sm transition-colors">
                    Ingresá tu email para recibir instrucciones de recuperación
                  </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Email Field */}
                  <m.div variants={itemVariants} className="space-y-2">
                    <Label
                      htmlFor="email"
                      className="text-sm font-semibold text-gray-700 dark:text-gray-200 transition-colors"
                    >
                      Email
                    </Label>
                    <m.div
                      className="relative"
                      animate={{
                        scale: focusedField === "email" ? 1.02 : 1,
                      }}
                      transition={{ duration: 0.2 }}
                    >
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#68A243] transition-all duration-300" />
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onFocus={() => setFocusedField("email")}
                        onBlur={() => setFocusedField(null)}
                        placeholder="tu@empresa.com"
                        className={`pl-12 h-12 border-2 focus:ring-0 transition-all duration-300 rounded-xl bg-gray-50 dark:bg-[#0f2f25] focus:bg-white dark:focus:bg-[#143E29] font-medium dark:text-white dark:placeholder-gray-500 ${
                          error
                            ? "border-red-500"
                            : "border-gray-200 dark:border-[#68A243]/20 focus-visible:border-[#68A243]"
                        }`}
                        required
                      />
                    </m.div>
                    {error && (
                      <p className="text-red-600 dark:text-red-400 text-xs font-medium mt-1">
                        {error}
                      </p>
                    )}
                  </m.div>

                  {/* Submit Button */}
                  <m.div variants={itemVariants}>
                    <m.button
                      type="submit"
                      disabled={isLoading}
                      whileHover={!isLoading ? { scale: 1.02 } : {}}
                      whileTap={!isLoading ? { scale: 0.98 } : {}}
                      className="w-full h-12 bg-gradient-to-r from-[#68A243] via-[#6fb84f] to-[#68A243] hover:from-[#5a9139] hover:via-[#64a342] hover:to-[#5a9139] text-white font-bold text-base shadow-lg shadow-[#68A243]/30 transition-all duration-300 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isLoading ? (
                        <m.div
                          className="flex items-center gap-2"
                          animate={{ opacity: [0.6, 1, 0.6] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Enviando...
                        </m.div>
                      ) : (
                        <>
                          <Mail className="w-5 h-5" />
                          Enviar instrucciones
                        </>
                      )}
                    </m.button>
                  </m.div>
                </form>

                {/* Info Text */}
                <m.div
                  variants={itemVariants}
                  className="mt-6 p-4 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-500/30"
                >
                  <p className="text-sm text-blue-700 dark:text-blue-200">
                    Recibirás un email con un link para resetear tu contraseña.
                    Revisa tu carpeta de spam si no lo ves en la bandeja de
                    entrada.
                  </p>
                </m.div>
              </>
            ) : (
              /* Success State */
              <m.div variants={itemVariants} className="space-y-6 text-center">
                <m.div
                  animate={{ scale: [0.8, 1, 0.95, 1] }}
                  transition={{ duration: 0.6 }}
                  className="flex justify-center"
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-[#68A243] rounded-full flex items-center justify-center shadow-lg shadow-[#68A243]/30">
                    <CheckCircle2 className="w-8 h-8 text-white" />
                  </div>
                </m.div>

                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-[#143E29] dark:text-white">
                    ¡Email enviado!
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    Hemos enviado instrucciones de recuperación a tu email.
                    Seguí el link para crear una nueva contraseña.
                  </p>
                </div>

                <m.div
                  variants={itemVariants}
                  className="pt-4 border-t border-gray-200 dark:border-[#68A243]/20"
                >
                  <Link to="/login">
                    <Button className="w-full bg-gradient-to-r from-[#68A243] via-[#6fb84f] to-[#68A243] hover:from-[#5a9139] hover:via-[#64a342] hover:to-[#5a9139] h-12 rounded-xl font-bold">
                      Volver al login
                    </Button>
                  </Link>
                </m.div>
              </m.div>
            )}
          </m.div>
        </m.div>
      </div>
    </div>
  );
}
