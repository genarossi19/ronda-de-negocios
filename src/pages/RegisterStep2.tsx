import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  User,
  FileText,
  Image as ImageIcon,
  ChevronRight,
  Eye,
  EyeOff,
  Lock,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { useNavigate, Link } from "react-router";
import type { GenericType } from "../types/GenericType";
import Navbar from "../components/Navbar";
import { getSectors } from "../api/SectorService";
import { motion as m } from "motion/react";

const STEPS = [
  { id: 1, title: "Empresa", icon: Building2 },
  { id: 2, title: "Descripción", icon: FileText },
  { id: 3, title: "Contacto", icon: User },
  { id: 4, title: "Logo", icon: ImageIcon },
  { id: 5, title: "Seguridad", icon: Lock },
];

export default function RegisterStep() {
  const initialData = {
    id: 0,
    email: "",
    nombre_contacto: "",
    apellido_contacto: "",
    password: "",
    password2: "",
    razon_social: "",
    cuit: "",
    email_empresa: "",
    telefono_contacto: "",
    descripcion: "",
    direccion: "",
    logo: null as File | null,
    localidad: 0,
    sector: 0,
  };

  const [sectorList, setSectorList] = useState<GenericType[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState(initialData);
  const [previewLogo, setPreviewLogo] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSector = async () => {
      try {
        const sector = await getSectors();
        setSectorList(sector);
      } catch (error) {
        console.error(error);
      }
    };
    fetchSector();
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFormData({ ...formData, logo: file });
    setPreviewLogo(URL.createObjectURL(file));
  };

  const handleSubmit = () => {
    setIsLoading(true);
    setTimeout(() => {
      navigate("/iniciar-sesion");
    }, 1200);
  };

  const isStepComplete = (): boolean => {
    switch (currentStep) {
      case 1:
        return !!(
          formData.razon_social.trim() &&
          formData.cuit.trim() &&
          formData.email_empresa.trim() &&
          formData.direccion.trim()
        );
      case 2:
        return !!(formData.descripcion.trim() && formData.sector !== 0);
      case 3:
        return !!(
          formData.nombre_contacto.trim() &&
          formData.apellido_contacto.trim() &&
          formData.telefono_contacto.trim() &&
          formData.email.trim()
        );
      case 4:
        return true;
      case 5:
        return !!(
          formData.password.trim() &&
          formData.password2.trim() &&
          formData.password === formData.password2
        );
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
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
            </div>
          </m.div>
        );

      case 2:
        return (
          <m.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-5"
          >
            <div>
              <h2 className="text-2xl font-bold text-[#143E29] mb-1">
                Descripción y sector
              </h2>
              <p className="text-sm text-gray-600">Contanos sobre tu empresa</p>
            </div>

            <m.div variants={itemVariants} className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700">
                Descripción
              </Label>
              <Textarea
                value={formData.descripcion}
                onChange={(e) =>
                  setFormData({ ...formData, descripcion: e.target.value })
                }
                placeholder="Contanos brevemente sobre tu empresa..."
                rows={5}
                className="border-2 border-gray-200 focus:border-[#68A243] focus:ring-0 transition-all rounded-lg resize-none"
              />
            </m.div>

            <m.div variants={itemVariants} className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700">
                Sector
              </Label>
              <Select
                value={formData.sector ? formData.sector.toString() : ""}
                onValueChange={(value) =>
                  setFormData({ ...formData, sector: Number(value) })
                }
              >
                <SelectTrigger className="h-11 border-2 border-gray-200 focus:border-[#68A243] rounded-lg">
                  <SelectValue placeholder="Seleccioná un sector" />
                </SelectTrigger>
                <SelectContent>
                  {sectorList.map((sector) => (
                    <SelectItem key={sector.id} value={sector.id.toString()}>
                      {sector.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                Logo de tu empresa
              </h2>
              <p className="text-sm text-gray-600">
                Opcional - Ayuda a identificar tu marca
              </p>
            </div>

            <m.div variants={itemVariants} className="space-y-3">
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
                  {previewLogo ? "Cambiar logo" : "Subir logo"}
                </span>
              </m.button>

              {previewLogo && (
                <m.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex justify-center p-4 bg-[#68A243]/5 border border-[#68A243]/20 rounded-lg"
                >
                  <img
                    src={previewLogo}
                    alt="Logo preview"
                    className="max-h-24 object-contain"
                  />
                </m.div>
              )}
            </m.div>
          </m.div>
        );

      case 5:
        return (
          <m.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-5"
          >
            <div>
              <h2 className="text-2xl font-bold text-[#143E29] mb-1">
                Seguridad
              </h2>
              <p className="text-sm text-gray-600">Crea tu contraseña</p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {[
                { label: "Contraseña", field: "password" },
                { label: "Repetir contraseña", field: "password2" },
              ].map((input) => (
                <m.div
                  key={input.field}
                  variants={itemVariants}
                  className="space-y-2"
                >
                  <Label className="text-sm font-semibold text-gray-700">
                    {input.label}
                  </Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={
                        formData[input.field as keyof typeof formData] as string
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
              formData.password2 &&
              formData.password !== formData.password2 && (
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

      <div className="relative z-10 pt-12">
        <m.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8"
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
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-[calc(100vh-200px)] flex items-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          {/* Sidebar - Stepper */}
          <m.aside
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="lg:col-span-1"
          >
            {/* Desktop stepper */}
            <div className="hidden lg:block space-y-3">
              {STEPS.map((step) => {
                const Icon = step.icon;
                const isCompleted = step.id < currentStep;
                const isCurrent = step.id === currentStep;

                return (
                  <m.div
                    key={step.id}
                    whileHover={{ x: 4 }}
                    className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-300 cursor-pointer ${
                      isCurrent
                        ? "bg-[#68A243]/10 border-l-4 border-[#68A243]"
                        : isCompleted
                          ? "text-[#68A243]"
                          : "text-gray-400"
                    }`}
                  >
                    <div
                      className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                        isCompleted
                          ? "bg-[#68A243] text-white"
                          : isCurrent
                            ? "bg-white text-[#143E29] border-2 border-[#68A243]"
                            : "bg-gray-100 text-gray-400"
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : (
                        <Icon className="h-4 w-4" />
                      )}
                    </div>
                    <span className="text-sm font-medium">{step.title}</span>
                  </m.div>
                );
              })}
            </div>

            {/* Mobile stepper */}
            <div className="lg:hidden flex items-center justify-between gap-2 mb-6">
              {STEPS.map((step, index) => {
                const isCompleted = step.id < currentStep;
                const isCurrent = step.id === currentStep;

                return (
                  <React.Fragment key={step.id}>
                    <m.div
                      whileHover={{ scale: 1.1 }}
                      className={`w-8 h-8 flex items-center justify-center rounded-full font-bold text-xs border-2 transition-all ${
                        isCompleted
                          ? "bg-[#68A243] border-[#68A243] text-white"
                          : isCurrent
                            ? "bg-white border-[#68A243] text-[#143E29]"
                            : "bg-gray-50 border-gray-200 text-gray-400"
                      }`}
                    >
                      {step.id}
                    </m.div>
                    {index < STEPS.length - 1 && (
                      <div className="flex-1 h-0.5 bg-gray-200" />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </m.aside>

          {/* Main form */}
          <m.div
            key={`step-${currentStep}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.4 }}
            className="lg:col-span-3"
          >
            <div className="bg-white/80 backdrop-blur-xl border border-gray-200/50 rounded-3xl shadow-2xl p-8 md:p-10 space-y-8">
              {/* Step content */}
              {renderStep()}

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
                  className="ml-auto"
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
                        {currentStep === STEPS.length
                          ? "Registrar empresa"
                          : "Continuar"}
                        {currentStep < STEPS.length && (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </span>
                    )}
                  </Button>
                </m.div>
              </div>

              {/* Info text */}
              <m.p
                className="text-center text-xs text-gray-500"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                Paso {currentStep} de {STEPS.length}
              </m.p>
            </div>
          </m.div>
        </div>
      </div>

      {/* Preview */}
      <m.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-12"
      >
        <div className="p-6 bg-gray-900/80 backdrop-blur rounded-xl border border-gray-700 text-gray-100 font-mono text-xs max-h-80 overflow-y-auto">
          <p className="text-[#68A243] font-bold mb-3">
            📋 Estado del formulario:
          </p>
          <pre className="whitespace-pre-wrap break-words text-gray-300">
            {JSON.stringify(formData, null, 2)}
          </pre>
        </div>
      </m.div>
    </div>
  );
}
