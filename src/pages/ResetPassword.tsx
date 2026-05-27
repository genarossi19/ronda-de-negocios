import type React from "react";
import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import Navbar from "../components/Navbar";
import { Link, useParams } from "react-router";
import { motion as m } from "motion/react";
import { useTheme } from "../context/ThemeContext";
import { resetPassword } from "../api/LoginService";

export default function ResetPassword() {
  const { resolvedTheme } = useTheme();
  const { uidb, token } = useParams<{ uidb: string; token: string }>();
  const [formData, setFormData] = useState({
    password: "",
    passwordConfirm: "",
  });
  const [errors, setErrors] = useState({
    password: "",
    passwordConfirm: "",
    general: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Validate params
  useEffect(() => {
    if (!uidb || !token) {
      setErrors({
        ...errors,
        general: "Link de recuperación inválido o expirado",
      });
    }
  }, [uidb, token]);

  // Real-time password validation
  useEffect(() => {
    const newErrors = { password: "", passwordConfirm: "", general: "" };

    // Validar longitud de contraseña
    if (formData.password && formData.password.length < 8) {
      newErrors.password = "Mínimo 8 caracteres";
    }

    // Validar coincidencia solo si ambos campos tienen contenido
    if (formData.password && formData.passwordConfirm) {
      if (formData.password !== formData.passwordConfirm) {
        newErrors.passwordConfirm = "Las contraseñas no coinciden";
      }
    }

    setErrors((prev) => ({ ...prev, ...newErrors }));
  }, [formData.password, formData.passwordConfirm]);

  const isFormValid = (): boolean => {
    return (
      formData.password.length >= 8 &&
      formData.passwordConfirm.length >= 8 &&
      formData.password === formData.passwordConfirm &&
      !errors.password &&
      !errors.passwordConfirm
    );
  };

  // Cursor trail effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFormValid()) return;

    if (!uidb || !token) {
      setErrors((prev) => ({
        ...prev,
        general: "Link inválido. Solicitá un nuevo reseteo de contraseña.",
      }));
      return;
    }

    setIsLoading(true);

    try {
      await resetPassword(
        uidb,
        token,
        formData.password,
        formData.passwordConfirm,
      );
      setSuccess(true);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Error al resetear la contraseña";
      setErrors((prev) => ({ ...prev, general: message }));
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

  const isInvalidLink = !uidb || !token;

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
          {!isInvalidLink && (
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
          )}

          {/* Form Container */}
          <m.div
            variants={itemVariants}
            className="bg-white dark:bg-[#143E29] rounded-2xl border border-gray-200 dark:border-[#68A243]/20 p-8 shadow-xl shadow-gray-200/50 dark:shadow-black/50 transition-colors duration-300"
          >
            {isInvalidLink ? (
              /* Invalid Link State */
              <m.div variants={itemVariants} className="space-y-6 text-center">
                <m.div
                  animate={{ scale: [0.8, 1, 0.95, 1] }}
                  transition={{ duration: 0.6 }}
                  className="flex justify-center"
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center shadow-lg shadow-red-600/30">
                    <AlertCircle className="w-8 h-8 text-white" />
                  </div>
                </m.div>

                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-[#143E29] dark:text-white">
                    Link inválido
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    El link de recuperación es inválido o ha expirado. Solicitá
                    uno nuevo.
                  </p>
                </div>

                <m.div
                  variants={itemVariants}
                  className="pt-4 border-t border-gray-200 dark:border-[#68A243]/20"
                >
                  <Link to="/olvide-contraseña">
                    <Button className="w-full bg-gradient-to-r from-[#68A243] via-[#6fb84f] to-[#68A243] hover:from-[#5a9139] hover:via-[#64a342] hover:to-[#5a9139] h-12 rounded-xl font-bold">
                      Solicitar nuevo link
                    </Button>
                  </Link>
                </m.div>
              </m.div>
            ) : success ? (
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
                    ¡Contraseña actualizada!
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    Tu contraseña ha sido cambiada exitosamente. Ahora podés
                    acceder con tu nueva contraseña.
                  </p>
                </div>

                <m.div
                  variants={itemVariants}
                  className="pt-4 border-t border-gray-200 dark:border-[#68A243]/20"
                >
                  <Link to="/login">
                    <Button className="w-full bg-gradient-to-r from-[#68A243] via-[#6fb84f] to-[#68A243] hover:from-[#5a9139] hover:via-[#64a342] hover:to-[#5a9139] h-12 rounded-xl font-bold">
                      Ir al login
                    </Button>
                  </Link>
                </m.div>
              </m.div>
            ) : (
              /* Form State */
              <>
                {/* Header */}
                <div className="space-y-2 mb-8">
                  <h2 className="text-3xl font-bold text-[#143E29] dark:text-white transition-colors">
                    Nueva contraseña
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300 text-sm transition-colors">
                    Ingresá una nueva contraseña para tu cuenta
                  </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Password Field */}
                  <m.div variants={itemVariants} className="space-y-2">
                    <Label
                      htmlFor="password"
                      className="text-sm font-semibold text-gray-700 dark:text-gray-200 transition-colors"
                    >
                      Nueva contraseña
                    </Label>
                    <m.div
                      className="relative"
                      animate={{
                        scale: focusedField === "password" ? 1.02 : 1,
                      }}
                      transition={{ duration: 0.2 }}
                    >
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#68A243] transition-all duration-300" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={(e) =>
                          setFormData({ ...formData, password: e.target.value })
                        }
                        onFocus={() => setFocusedField("password")}
                        onBlur={() => setFocusedField(null)}
                        placeholder="••••••••"
                        aria-invalid={!!errors.password}
                        className={`pl-12 pr-12 h-12 border-2 focus:ring-0 transition-all duration-300 rounded-xl bg-gray-50 dark:bg-[#0f2f25] focus:bg-white dark:focus:bg-[#143E29] font-medium dark:text-white dark:placeholder-[#b8c0ca] ${
                          errors.password
                            ? "border-red-500"
                            : "border-gray-200 dark:border-[#68A243]/20 focus-visible:border-[#68A243]"
                        }`}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-[#68A243] dark:hover:text-[#68A243] transition-colors"
                      >
                        {showPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </m.div>
                    {errors.password && (
                      <p className="text-red-600 dark:text-red-400 text-xs font-medium mt-1">
                        {errors.password}
                      </p>
                    )}
                  </m.div>

                  {/* Password Confirm Field */}
                  <m.div variants={itemVariants} className="space-y-2">
                    <Label
                      htmlFor="passwordConfirm"
                      className="text-sm font-semibold text-gray-700 dark:text-gray-200 transition-colors"
                    >
                      Confirmar contraseña
                    </Label>
                    <m.div
                      className="relative"
                      animate={{
                        scale: focusedField === "passwordConfirm" ? 1.02 : 1,
                      }}
                      transition={{ duration: 0.2 }}
                    >
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#68A243] transition-all duration-300" />
                      <Input
                        id="passwordConfirm"
                        type={showPasswordConfirm ? "text" : "password"}
                        value={formData.passwordConfirm}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            passwordConfirm: e.target.value,
                          })
                        }
                        onFocus={() => setFocusedField("passwordConfirm")}
                        onBlur={() => setFocusedField(null)}
                        placeholder="••••••••"
                        aria-invalid={!!errors.passwordConfirm}
                        className={`pl-12 pr-12 h-12 border-2 focus:ring-0 transition-all duration-300 rounded-xl bg-gray-50 dark:bg-[#0f2f25] focus:bg-white dark:focus:bg-[#143E29] font-medium dark:text-white dark:placeholder-[#b8c0ca] ${
                          errors.passwordConfirm
                            ? "border-red-500"
                            : "border-gray-200 dark:border-[#68A243]/20 focus-visible:border-[#68A243]"
                        }`}
                        required
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowPasswordConfirm(!showPasswordConfirm)
                        }
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-[#68A243] dark:hover:text-[#68A243] transition-colors"
                      >
                        {showPasswordConfirm ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </m.div>
                    {errors.passwordConfirm && (
                      <p className="text-red-600 dark:text-red-400 text-xs font-medium mt-1">
                        {errors.passwordConfirm}
                      </p>
                    )}
                  </m.div>

                  {/* General Error Message */}
                  {errors.general && (
                    <m.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="bg-red-50 dark:bg-red-950/30 border-l-4 border-red-500 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg text-sm font-medium transition-colors"
                    >
                      {errors.general}
                    </m.div>
                  )}

                  {/* Submit Button */}
                  <m.div variants={itemVariants}>
                    <m.button
                      type="submit"
                      disabled={isLoading || !isFormValid()}
                      whileHover={
                        !isLoading && isFormValid() ? { scale: 1.02 } : {}
                      }
                      whileTap={
                        !isLoading && isFormValid() ? { scale: 0.98 } : {}
                      }
                      className="w-full h-12 bg-gradient-to-r from-[#68A243] via-[#6fb84f] to-[#68A243] hover:from-[#5a9139] hover:via-[#64a342] hover:to-[#5a9139] text-white font-bold text-base shadow-lg shadow-[#68A243]/30 transition-all duration-300 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isLoading ? (
                        <m.div
                          className="flex items-center gap-2"
                          animate={{ opacity: [0.6, 1, 0.6] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Actualizando...
                        </m.div>
                      ) : (
                        <>
                          <Lock className="w-5 h-5" />
                          Cambiar contraseña
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
                    La contraseña debe tener al menos 8 caracteres y las dos
                    deben coincidir.
                  </p>
                </m.div>
              </>
            )}
          </m.div>
        </m.div>
      </div>
    </div>
  );
}
