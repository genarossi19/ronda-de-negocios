import React, { useState } from "react";
import {
  Building2,
  FileText,
  User,
  Lock,
  Image as ImageIcon,
  ChevronRight,
  CheckCircle2,
  ArrowLeft,
  Eye,
  EyeOff,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import Navbar from "../components/Navbar";
import { Link, useNavigate } from "react-router";
import { motion as m } from "motion/react";

const PROVINCES = [
  { id: 1, name: "Buenos Aires" },
  { id: 2, name: "Córdoba" },
  { id: 3, name: "Santa Fe" },
];

const LOCALITIES: Record<number, string[]> = {
  1: ["La Plata", "Mar del Plata", "Bahía Blanca"],
  2: ["Córdoba Capital", "Villa María", "Río Cuarto"],
  3: ["Rosario", "Santa Fe Capital", "Rafaela"],
};

const SECTORS = [
  { id: 1, name: "Tecnología" },
  { id: 2, name: "Manufactura" },
  { id: 3, name: "Servicios" },
  { id: 4, name: "Comercio" },
  { id: 5, name: "Educación" },
];

const STEPS = [
  { id: 1, title: "Empresa", icon: Building2 },
  { id: 2, title: "Sector", icon: FileText },
  { id: 3, title: "Contacto", icon: User },
  { id: 4, title: "Seguridad", icon: Lock },
];

export default function Register() {
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    razon_social: "",
    cuit: "",
    email_empresa: "",
    direccion: "",
    provincia: "",
    localidad: "",
    sector: "",
    nombre_contacto: "",
    apellido_contacto: "",
    telefono_contacto: "",
    email: "",
    password: "",
    password_confirm: "",
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.15 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = () => {
    setIsLoading(true);
    setTimeout(() => {
      console.log("📋 Registro completado con datos:");
      console.log(formData);
      navigate("/iniciar-sesion");
    }, 1200);
  };

  const isStepComplete = (): boolean => {
    const f = formData;
    switch (currentStep) {
      case 1:
        return !!(
          f.razon_social &&
          f.cuit &&
          f.email_empresa &&
          f.direccion &&
          f.provincia &&
          f.localidad
        );
      case 2:
        return f.sector !== "";
      case 3:
        return !!(
          f.nombre_contacto &&
          f.apellido_contacto &&
          f.telefono_contacto &&
          f.email
        );
      case 4:
        return !!(
          f.password &&
          f.password_confirm &&
          f.password === f.password_confirm
        );
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const getLocalities = (): string[] => {
    const province = PROVINCES.find((p) => p.name === formData.provincia)?.id;
    return province && LOCALITIES[province] ? LOCALITIES[province] : [];
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <m.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-5"
          >
            <div>
              <h2 className="text-2xl font-bold text-[#143E29] mb-1">
                Datos de tu empresa
              </h2>
              <p className="text-sm text-gray-600">
                Información básica y ubicación
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {[
                { label: "Razón social", field: "razon_social", type: "text" },
                { label: "CUIT", field: "cuit", type: "text" },
                {
                  label: "Email empresa",
                  field: "email_empresa",
                  type: "email",
                },
                { label: "Dirección", field: "direccion", type: "text" },
              ].map((input) => (
                <m.div
                  key={input.field}
                  variants={itemVariants}
                  className="space-y-2"
                >
                  <Label className="text-sm font-semibold text-gray-700">
                    {input.label}
                  </Label>
                  <Input
                    type={input.type}
                    placeholder={`Ingresá ${input.label.toLowerCase()}`}
                    value={
                      formData[input.field as keyof typeof formData] as string
                    }
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        [input.field]: e.target.value,
                      })
                    }
                    className="h-11 border-2 border-gray-200 focus:border-[#68A243] focus:ring-0 transition-all rounded-lg bg-white"
                  />
                </m.div>
              ))}

              <m.div variants={itemVariants} className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700">
                  Provincia
                </Label>
                <Select
                  value={formData.provincia}
                  onValueChange={(v) =>
                    setFormData({
                      ...formData,
                      provincia: v,
                      localidad: "",
                    })
                  }
                >
                  <SelectTrigger className="h-11 border-2 border-gray-200 focus:border-[#68A243] rounded-lg">
                    <SelectValue placeholder="Seleccioná una provincia" />
                  </SelectTrigger>
                  <SelectContent>
                    {PROVINCES.map((p) => (
                      <SelectItem key={p.id} value={p.name}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </m.div>

              <m.div variants={itemVariants} className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700">
                  Localidad
                </Label>
                <Select
                  value={formData.localidad}
                  onValueChange={(v) =>
                    setFormData({ ...formData, localidad: v })
                  }
                  disabled={!formData.provincia}
                >
                  <SelectTrigger className="h-11 border-2 border-gray-200 focus:border-[#68A243] rounded-lg disabled:opacity-50">
                    <SelectValue placeholder="Seleccioná una localidad" />
                  </SelectTrigger>
                  <SelectContent>
                    {getLocalities().map((loc) => (
                      <SelectItem key={loc} value={loc}>
                        {loc}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </m.div>
            </div>
          </m.div>
        );

      case 2:
        return (
          <m.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
          >
            <div>
              <h2 className="text-2xl font-bold text-[#143E29] mb-1">
                Sector de actividad
              </h2>
              <p className="text-sm text-gray-600">
                ¿A qué se dedica tu empresa?
              </p>
            </div>

            <m.div variants={itemVariants} className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700">
                Seleccioná el sector
              </Label>
              <Select
                value={formData.sector}
                onValueChange={(v) => setFormData({ ...formData, sector: v })}
              >
                <SelectTrigger className="h-11 border-2 border-gray-200 focus:border-[#68A243] rounded-lg">
                  <SelectValue placeholder="Seleccioná un sector" />
                </SelectTrigger>
                <SelectContent>
                  {SECTORS.map((s) => (
                    <SelectItem key={s.id} value={String(s.id)}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </m.div>

            <m.div
              variants={itemVariants}
              className="p-4 bg-[#68A243]/10 border border-[#68A243]/20 rounded-lg"
            >
              <p className="text-xs text-gray-600">
                ✨ El sector nos ayuda a conectarte con empresas afines en la
                ronda
              </p>
            </m.div>
          </m.div>
        );

      case 3:
        return (
          <m.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-5"
          >
            <div>
              <h2 className="text-2xl font-bold text-[#143E29] mb-1">
                Persona de contacto
              </h2>
              <p className="text-sm text-gray-600">
                Información del representante principal
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {[
                { label: "Nombre", field: "nombre_contacto", type: "text" },
                { label: "Apellido", field: "apellido_contacto", type: "text" },
                { label: "Teléfono", field: "telefono_contacto", type: "tel" },
                { label: "Email", field: "email", type: "email" },
              ].map((input) => (
                <m.div
                  key={input.field}
                  variants={itemVariants}
                  className="space-y-2"
                >
                  <Label className="text-sm font-semibold text-gray-700">
                    {input.label}
                  </Label>
                  <Input
                    type={input.type}
                    placeholder={`Ingresá ${input.label.toLowerCase()}`}
                    value={
                      formData[input.field as keyof typeof formData] as string
                    }
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        [input.field]: e.target.value,
                      })
                    }
                    className="h-11 border-2 border-gray-200 focus:border-[#68A243] focus:ring-0 transition-all rounded-lg bg-white"
                  />
                </m.div>
              ))}
            </div>
          </m.div>
        );

      case 4:
        return (
          <m.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
          >
            <div>
              <h2 className="text-2xl font-bold text-[#143E29] mb-1">
                Seguridad y branding
              </h2>
              <p className="text-sm text-gray-600">
                Crea tu contraseña y sube tu logo
              </p>
            </div>

            <div className="space-y-5">
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  { label: "Contraseña", field: "password", type: "password" },
                  {
                    label: "Repetir contraseña",
                    field: "password_confirm",
                    type: "password",
                  },
                ].map((input) => (
                  <m.div
                    key={input.field}
                    variants={itemVariants}
                    className="space-y-2 relative"
                  >
                    <Label className="text-sm font-semibold text-gray-700">
                      {input.label}
                    </Label>
                    <div className="relative">
                      <Input
                        type={
                          input.field === "password" && showPassword
                            ? "text"
                            : input.type
                        }
                        placeholder="••••••••"
                        value={
                          formData[
                            input.field as keyof typeof formData
                          ] as string
                        }
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            [input.field]: e.target.value,
                          })
                        }
                        className="h-11 border-2 border-gray-200 focus:border-[#68A243] focus:ring-0 transition-all rounded-lg bg-white pr-10"
                      />
                      {input.field === "password" && (
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-[#68A243] transition-colors"
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      )}
                    </div>
                  </m.div>
                ))}
              </div>

              {formData.password &&
                formData.password_confirm &&
                formData.password !== formData.password_confirm && (
                  <m.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-3 bg-red-50 border border-red-200 rounded-lg"
                  >
                    <p className="text-xs text-red-600 font-medium">
                      ⚠️ Las contraseñas no coinciden
                    </p>
                  </m.div>
                )}

              <m.div variants={itemVariants} className="space-y-3 pt-4">
                <Label className="text-sm font-semibold text-gray-700">
                  Logo de la empresa (opcional)
                </Label>
                <Input
                  id="logo"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <m.button
                  onClick={() => document.getElementById("logo")?.click()}
                  className="w-full h-32 border-2 border-dashed border-[#68A243]/30 rounded-lg flex flex-col items-center justify-center gap-2 hover:border-[#68A243] hover:bg-[#68A243]/5 transition-all duration-300 cursor-pointer bg-white"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <ImageIcon className="h-8 w-8 text-[#68A243]" />
                  <span className="text-sm font-medium text-gray-600">
                    {logoPreview ? "Cambiar logo" : "Subir logo"}
                  </span>
                </m.button>

                {logoPreview && (
                  <m.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex justify-center p-4 bg-[#68A243]/5 border border-[#68A243]/20 rounded-lg"
                  >
                    <img
                      src={logoPreview}
                      alt="Logo preview"
                      className="max-h-24 object-contain"
                    />
                  </m.div>
                )}
              </m.div>
            </div>
          </m.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0f141a] relative overflow-hidden">
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

      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-12 relative z-10">
        <m.div
          className="w-full max-w-2xl"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="bg-white/80 backdrop-blur-xl border border-gray-200/50 rounded-3xl shadow-2xl p-8 md:p-10 space-y-8">
            {/* Back Button */}
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <Link to="/">
                <Button
                  variant="ghost"
                  className="text-gray-600 hover:text-[#68A243] hover:bg-[#68A243]/10 transition-all"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Volver
                </Button>
              </Link>
            </m.div>

            {/* Progress Steps */}
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="space-y-4"
            >
              {/* Visual Progress Bar */}
              <div className="flex gap-2">
                {STEPS.map((step) => (
                  <m.div
                    key={step.id}
                    layoutId={`progress-${step.id}`}
                    className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
                      step.id <= currentStep
                        ? "bg-gradient-to-r from-[#68A243] to-[#5a9139]"
                        : "bg-gray-200"
                    }`}
                  />
                ))}
              </div>

              {/* Step Indicators */}
              <div className="flex justify-between">
                {STEPS.map((step) => {
                  const Icon = step.icon;
                  const isCompleted = step.id < currentStep;
                  const isCurrent = step.id === currentStep;

                  return (
                    <m.div
                      key={step.id}
                      className="flex flex-col items-center flex-1"
                    >
                      <m.div
                        className={`w-10 h-10 flex items-center justify-center rounded-full border-2 transition-all duration-300 font-bold ${
                          isCompleted
                            ? "bg-[#68A243] text-white border-[#68A243]"
                            : isCurrent
                              ? "bg-white text-[#143E29] border-[#68A243] shadow-lg shadow-[#68A243]/20"
                              : "bg-gray-100 text-gray-400 border-gray-200"
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="h-5 w-5" />
                        ) : (
                          <Icon className="h-5 w-5" />
                        )}
                      </m.div>
                      <span
                        className={`text-xs mt-2 font-medium transition-colors duration-300 ${
                          isCurrent
                            ? "text-[#68A243]"
                            : isCompleted
                              ? "text-[#68A243]"
                              : "text-gray-400"
                        }`}
                      >
                        {step.title}
                      </span>
                    </m.div>
                  );
                })}
              </div>
            </m.div>

            {/* Divider */}
            <div className="border-t border-gray-200" />

            {/* Form Content */}
            <m.div
              key={`step-${currentStep}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4 }}
            >
              {renderStep()}
            </m.div>

            {/* Navigation */}
            <div className="flex justify-between pt-6 border-t border-gray-200 gap-4">
              {currentStep > 1 && (
                <m.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <Button
                    onClick={prevStep}
                    variant="outline"
                    className="border-2 border-gray-300 hover:border-[#68A243] hover:text-[#68A243] transition-all"
                  >
                    Anterior
                  </Button>
                </m.div>
              )}
              <m.div
                className={currentStep === 1 ? "ml-auto" : "ml-auto"}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <Button
                  onClick={nextStep}
                  disabled={!isStepComplete() || isLoading}
                  className="bg-gradient-to-r from-[#68A243] to-[#5a9139] hover:from-[#5a9139] hover:to-[#4a7a2f] text-white font-bold shadow-lg shadow-[#68A243]/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Registrando...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      {currentStep === 4 ? "Registrar" : "Continuar"}
                      {currentStep < 4 && <ChevronRight className="h-4 w-4" />}
                    </span>
                  )}
                </Button>
              </m.div>
            </div>

            {/* Info */}
            <m.p
              className="text-center text-xs text-gray-500 pt-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              ¿Ya tenés cuenta?{" "}
              <Link
                to="/iniciar-sesion"
                className="text-[#68A243] font-bold hover:text-[#143E29] transition-colors"
              >
                Inicia sesión aquí
              </Link>
            </m.p>
          </div>

          {/* Preview de datos */}
          <m.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-8 p-6 bg-gray-900/80 backdrop-blur rounded-xl border border-gray-700 text-gray-100 font-mono text-xs max-h-80 overflow-y-auto"
          >
            <p className="text-[#68A243] font-bold mb-3">
              📋 Preview - Estado actual del formulario:
            </p>
            <pre className="whitespace-pre-wrap break-words text-gray-300">
              {JSON.stringify(formData, null, 2)}
            </pre>
          </m.div>
        </m.div>
      </div>
    </div>
  );
}
