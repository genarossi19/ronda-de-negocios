import type React from "react";

import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Mail,
  Lock,
  LogIn,
  Building2,
  Eye,
  EyeOff,
  Sparkles,
  CalendarClock,
  Target,
  Clock,
  Shield,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import Navbar from "../components/Navbar";
import { useAuth } from "../hooks/useAuth";
import { Link, useNavigate } from "react-router";
import { motion as m } from "motion/react";
import Cookies from "js-cookie";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  useEffect(() => {
    if (Cookies.get("token")) {
      navigate("/", { replace: true });
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      if (!formData.email || !formData.password) {
        setError("Por favor completá todos los campos");
        setIsLoading(false);
        return;
      }

      await login(formData.email, formData.password);
      navigate("/empresas");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error al iniciar sesión";
      setError(errorMessage);
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
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0">
        <m.div
          className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-[#68A243]/30 to-transparent rounded-full blur-3xl"
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
          className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-[#143E29]/20 to-transparent rounded-full blur-3xl"
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 w-full max-w-6xl items-center">
          {/* Left Side - Content */}
          <m.div
            className="hidden lg:flex flex-col space-y-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <m.div variants={itemVariants} className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-[#68A243] to-[#5a9139] rounded-xl flex items-center justify-center shadow-lg">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-[#143E29]">
                  Ronda de Negocios
                </h1>
              </div>
              <p className="text-gray-600 text-lg">
                Conecta con empresas y expande tu red de negocios
              </p>
            </m.div>

            <m.div variants={itemVariants} className="space-y-4">
              {[
                {
                  icon: Target,
                  title: "Oportunidades Ilimitadas",
                  desc: "Accede a empresas participantes de diversos sectores",
                },
                {
                  icon: CalendarClock,
                  title: "Gestión de Turnos",
                  desc: "Administra tus reuniones 1 a 1 de forma sencilla",
                },
                {
                  icon: Clock,
                  title: "Historial Completo",
                  desc: "Mantén registro de todas tus reuniones y contactos",
                },
              ].map((item, idx) => {
                const Icon = item.icon;
                return (
                  <m.div
                    key={idx}
                    variants={itemVariants}
                    className="flex gap-4 p-4 rounded-xl border border-[#68A243]/20 bg-gradient-to-r from-[#68A243]/5 to-transparent hover:border-[#68A243]/40 transition-all duration-300"
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-[#68A243] to-[#5a9139] rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#143E29]">
                        {item.title}
                      </h3>
                      <p className="text-sm text-gray-600">{item.desc}</p>
                    </div>
                  </m.div>
                );
              })}
            </m.div>

            <m.div variants={itemVariants} className="pt-8">
              <p className="text-sm text-gray-500">
                Trenque Lauquen 2025 • Evento de Networking
              </p>
            </m.div>
          </m.div>

          {/* Right Side - Login Form */}
          <m.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8"
          >
            {/* Back Button */}
            <m.div variants={itemVariants}>
              <Link to="/">
                <Button
                  variant="ghost"
                  className="text-gray-600 hover:text-[#68A243] hover:bg-gray-100 transition-all duration-300"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Volver
                </Button>
              </Link>
            </m.div>

            {/* Form Container */}
            <m.div
              variants={itemVariants}
              className="bg-white rounded-2xl border border-gray-200 p-8 shadow-xl shadow-gray-200/50"
            >
              {/* Header */}
              <div className="space-y-2 mb-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-3xl font-bold text-[#143E29]">
                      Bienvenido
                    </h2>
                    <p className="text-gray-600 text-sm mt-1">
                      Accedé a tu cuenta para participar
                    </p>
                  </div>
                  <m.div
                    animate={{
                      rotate: [0, 10, -10, 0],
                      y: [0, -5, 5, 0],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    <Sparkles className="w-6 h-6 text-[#68A243]" />
                  </m.div>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email Field */}
                <m.div variants={itemVariants} className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="text-sm font-semibold text-gray-700"
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
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      onFocus={() => setFocusedField("email")}
                      onBlur={() => setFocusedField(null)}
                      placeholder="tu@empresa.com"
                      className="pl-12 h-12 border-2 border-gray-200 focus:border-[#68A243] focus:ring-0 transition-all duration-300 rounded-xl bg-gray-50 focus:bg-white font-medium"
                      required
                    />
                  </m.div>
                </m.div>

                {/* Password Field */}
                <m.div variants={itemVariants} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label
                      htmlFor="password"
                      className="text-sm font-semibold text-gray-700"
                    >
                      Contraseña
                    </Label>
                    <Link
                      to="#"
                      className="text-xs text-[#68A243] hover:text-[#143E29] font-medium transition-colors"
                    >
                      ¿Olvidaste tu contraseña?
                    </Link>
                  </div>
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
                      className="pl-12 pr-12 h-12 border-2 border-gray-200 focus:border-[#68A243] focus:ring-0 transition-all duration-300 rounded-xl bg-gray-50 focus:bg-white font-medium"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#68A243] transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </m.div>
                </m.div>

                {/* Error Message */}
                {error && (
                  <m.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg text-sm font-medium"
                  >
                    {error}
                  </m.div>
                )}

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
                        Iniciando sesión...
                      </m.div>
                    ) : (
                      <>
                        <LogIn className="w-5 h-5" />
                        Iniciar sesión
                      </>
                    )}
                  </m.button>
                </m.div>
              </form>

              {/* Divider */}
              {/* <m.div variants={itemVariants} className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-3 bg-white text-gray-500 font-medium">
                    O continúa con
                  </span>
                </div>
              </m.div> */}

              {/* Social/Alternative Login */}
              {/* <m.div variants={itemVariants} className="grid grid-cols-2 gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="border-2 border-gray-200 hover:border-[#68A243] transition-all duration-300 h-11 rounded-xl font-medium"
                >
                  <span className="text-lg mr-2">🔗</span>
                  LinkedIn
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="border-2 border-gray-200 hover:border-[#68A243] transition-all duration-300 h-11 rounded-xl font-medium"
                >
                  <span className="text-lg mr-2">📧</span>
                  Google
                </Button>
              </m.div> */}

              {/* Sign Up Link */}
              {/* <m.div
                variants={itemVariants}
                className="text-center pt-6 border-t border-gray-100"
              >
                <p className="text-sm text-gray-600">
                  ¿No tenés una cuenta?{" "}
                  <Link
                    to="/inscribirse"
                    className="text-[#68A243] font-bold hover:text-[#143E29] transition-colors duration-300"
                  >
                    Inscribite aquí
                  </Link>
                </p>
              </m.div> */}
            </m.div>

            {/* Trust Badge */}
            <m.div
              variants={itemVariants}
              className="flex items-center justify-center gap-2 text-xs text-gray-500"
            >
              <Shield className="w-4 h-4 text-[#68A243]" />
              <span>Conexión segura y encriptada</span>
            </m.div>
          </m.div>
        </div>
      </div>
    </div>
  );
}
