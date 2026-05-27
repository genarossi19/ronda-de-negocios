import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Building2,
  ChevronsUpDown,
  Mail,
  User,
  FileText,
  ChevronRight,
  ChevronLeft,
  Eye,
  EyeOff,
  Check,
  Info,
} from "lucide-react";
import { AnimatePresence, motion as m } from "motion/react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Card, CardContent } from "../components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../components/ui/tooltip";
import { useNavigate } from "react-router";
import type { GenericType } from "../types/GenericType";
import type { LocalidadResponse } from "../types/Localidad";
import type { EmpresaWrite } from "../types/Empresa";
import Navbar from "../components/Navbar";
import ImageCropperNew from "../components/ImageCropperNew";
import { TermsAndConditionsModal } from "../components/TermsAndConditionsModal";
import { PrivacyPolicyModal } from "../components/PrivacyPolicyModal";
import { Checkbox } from "../components/ui/checkbox";
import { getSectors } from "../api/SectorService";
import { getLocalidadesByProvincia } from "../api/LocalidadesService";
import { getProvincias } from "../api/ProvinciaService";
import { createCompany } from "../api/EmpresaService";
import { toast } from "sonner";
import { useMotionContext } from "../context/MotionPreferencesContext";

const STEPS = [
  { id: 1, title: "Empresa", icon: Building2 },
  { id: 2, title: "Marca", icon: FileText },
  { id: 3, title: "Contacto", icon: User },
  { id: 4, title: "Seguridad", icon: Mail },
];

const REGISTER_SUCCESS_EMAIL_STORAGE_KEY = "registerSuccessEmail";
const REGISTER_SUCCESS_NAME_STORAGE_KEY = "registerSuccessName";

const stepTransitionVariants = {
  enter: (direction: number) => ({
    opacity: 0,
    x: direction >= 0 ? 24 : -24,
  }),
  center: {
    opacity: 1,
    x: 0,
  },
  exit: (direction: number) => ({
    opacity: 0,
    x: direction >= 0 ? -24 : 24,
  }),
};

const stepTransition = {
  duration: 0.24,
  ease: [0.22, 1, 0.36, 1] as const,
};

const getCuitDigits = (value: string) => value.replace(/\D/g, "");
const getPhoneDigits = (value: string) => value.replace(/\D/g, "");

const getCuitValidationError = (value: string) => {
  if (!value) {
    return null;
  }

  return getCuitDigits(value).length === 11
    ? null
    : "El CUIT debe tener 11 dígitos";
};

const EMAIL_ALREADY_EXISTS_MESSAGES = new Set([
  "El usuario con este email ya existe.",
  "Ya existe un usuario registrado con ese email",
]);

const EMAIL_ALREADY_EXISTS_FIELD_MESSAGE =
  "Ya existe un usuario registrado con este mail";

const sortByNombre = <T extends { nombre: string }>(items: T[]) =>
  [...items].sort((left, right) => left.nombre.localeCompare(right.nombre));

function RequiredMark() {
  return <span className="text-[var(--accent-strong)]">*</span>;
}

export default function RegistrationForm() {
  const [sectorList, setSectorList] = useState<GenericType[]>([]);
  const [provinciasList, setProvinciasList] = useState<GenericType[]>([]);
  const [localidadesList, setLocalidadesList] = useState<LocalidadResponse[]>(
    [],
  );
  const [loadingLocalidades, setLoadingLocalidades] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [stepDirection, setStepDirection] = useState(0);
  const [provinceOpen, setProvinceOpen] = useState(false);
  const [localidadOpen, setLocalidadOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [termsModalOpen, setTermsModalOpen] = useState(false);
  const [privacyModalOpen, setPrivacyModalOpen] = useState(false);
  const navigate = useNavigate();
  const { shouldReduceMotion } = useMotionContext();

  const [formData, setFormData] = useState({
    razon_social: "",
    cuit: "",
    email: "",
    direccion: "",
    provincia_id: 0,
    localidad: 0,
    sector: 0,
    telefono_contacto: "",
    password: "",
    password_confirm: "",
    descripcion: "",
  });
  const cuitDigits = getCuitDigits(formData.cuit);
  const phoneDigits = getPhoneDigits(formData.telefono_contacto);
  const cuitValidationError = getCuitValidationError(formData.cuit);
  const sortedSectors = sortByNombre(sectorList);
  const sortedLocalidades = sortByNombre(localidadesList);
  const sortedProvincias = sortByNombre(provinciasList);
  const selectedProvincia = sortedProvincias.find(
    (provincia) => provincia.id === formData.provincia_id,
  );
  const selectedLocalidad = sortedLocalidades.find(
    (localidad) => localidad.id === formData.localidad,
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sectors, provincias] = await Promise.all([
          getSectors(),
          getProvincias(),
        ]);
        setSectorList(sectors);
        setProvinciasList(provincias);
      } catch (error) {
        toast.error("Error al cargar datos del formulario");
        console.error(error);
      } finally {
        setLoadingData(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (formData.provincia_id === 0) {
      setLocalidadesList([]);
      return;
    }
    const fetchLocalidades = async () => {
      setLoadingLocalidades(true);
      try {
        const localidades = await getLocalidadesByProvincia(
          formData.provincia_id,
        );
        setLocalidadesList(localidades);
      } catch (error) {
        toast.error("Error al cargar localidades");
        console.error(error);
      } finally {
        setLoadingLocalidades(false);
      }
    };
    fetchLocalidades();
  }, [formData.provincia_id]);

  const handleImageUpload = (croppedFile: File) => {
    setLogoFile(croppedFile);
    toast.success("Logo guardado correctamente");
  };

  const changeStep = (nextStep: number) => {
    if (nextStep === currentStep) {
      return;
    }

    setStepDirection(nextStep > currentStep ? 1 : -1);
    setCurrentStep(nextStep);
  };

  const getStepForField = (field: string): number => {
    const fieldToStep: Record<string, number> = {
      razon_social: 1,
      cuit: 1,
      direccion: 1,
      provincia_id: 1,
      localidad: 1,
      sector: 2,
      descripcion: 2,
      logo: 2,
      email: 3,
      telefono_contacto: 3,
      password: 4,
      password2: 4,
    };
    return fieldToStep[field] || 1;
  };

  const translateErrorMessage = (message: string): string => {
    const translations: Record<string, string> = {
      "empresa with this cuit already exists.":
        "Ya existe una empresa registrada con ese CUIT",
      "empresa with this email already exists.":
        "Ya existe una empresa registrada con ese email",
      "user with this email already exists.":
        "Ya existe un usuario registrado con ese email",
    };

    return translations[message] || message;
  };

  const getErrorMessage = (errors: Record<string, string[]>): string => {
    const errorEntries = Object.entries(errors);
    return errorEntries
      .map(([field, messages]) => {
        const translatedMessages = messages.map(translateErrorMessage);
        return `${field}: ${translatedMessages.join(", ")}`;
      })
      .join(" | ");
  };

  const hasFieldError = (field: string): boolean => {
    return !!fieldErrors[field] && fieldErrors[field].length > 0;
  };

  const passwordsMismatch = (): boolean => {
    return Boolean(
      formData.password &&
      formData.password_confirm &&
      formData.password !== formData.password_confirm,
    );
  };

  const isStepComplete = () => {
    switch (currentStep) {
      case 1:
        return !!(
          formData.razon_social &&
          formData.cuit &&
          !cuitValidationError &&
          formData.direccion &&
          formData.provincia_id &&
          formData.localidad
        );
      case 2:
        return formData.sector !== 0;
      case 3:
        return !!(formData.email && formData.telefono_contacto);
      case 4:
        return !!(
          formData.password &&
          formData.password_confirm &&
          formData.password === formData.password_confirm
        );
      default:
        return false;
    }
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);

      const companyData: EmpresaWrite = {
        razon_social: formData.razon_social,
        cuit: cuitDigits,
        email: formData.email,
        password: formData.password,
        password2: formData.password_confirm,
        telefono_contacto: phoneDigits,
        direccion: formData.direccion,
        localidad: formData.localidad,
        sector: formData.sector,
        ...(formData.descripcion && {
          descripcion: formData.descripcion,
        }),
        ...(logoFile && {
          logo: logoFile,
        }),
      };

      await createCompany(companyData);
      localStorage.setItem(REGISTER_SUCCESS_EMAIL_STORAGE_KEY, formData.email);
      localStorage.setItem(
        REGISTER_SUCCESS_NAME_STORAGE_KEY,
        formData.razon_social,
      );

      setFieldErrors({});
      navigate("/register-success");
    } catch (error: unknown) {
      let errorMessage = "Error al registrar la empresa";
      const newFieldErrors: Record<string, string[]> = {};

      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as Record<string, unknown>;
        const response = axiosError.response as Record<string, unknown>;
        const responseData = response?.data as Record<string, unknown>;

        // Intentar parsear errores de validación
        if (typeof responseData === "object" && responseData !== null) {
          for (const [key, value] of Object.entries(responseData)) {
            if (Array.isArray(value)) {
              const translatedMessages = (value as string[]).map(
                translateErrorMessage,
              );

              if (
                key === "non_field_errors" &&
                translatedMessages.some((message) =>
                  EMAIL_ALREADY_EXISTS_MESSAGES.has(message),
                )
              ) {
                newFieldErrors.email = [EMAIL_ALREADY_EXISTS_FIELD_MESSAGE];
                continue;
              }

              if (key !== "non_field_errors") {
                newFieldErrors[key] = translatedMessages;
              }
            } else if (typeof value === "string") {
              const translatedMessage = translateErrorMessage(value);

              if (
                key === "non_field_errors" &&
                EMAIL_ALREADY_EXISTS_MESSAGES.has(translatedMessage)
              ) {
                newFieldErrors.email = [EMAIL_ALREADY_EXISTS_FIELD_MESSAGE];
                continue;
              }

              if (key !== "non_field_errors") {
                newFieldErrors[key] = [translatedMessage];
              }
            }
          }
        }

        // Si hay errores de campo, usarlos; si no, usar mensaje general
        if (Object.keys(newFieldErrors).length > 0) {
          errorMessage = getErrorMessage(newFieldErrors);
          setFieldErrors(newFieldErrors);

          // Navegar al primer paso que tenga error
          const firstErrorField = Object.keys(newFieldErrors)[0];
          const stepWithError = getStepForField(firstErrorField);
          changeStep(stepWithError);
        } else {
          errorMessage =
            (responseData?.detail as string) ||
            (responseData?.message as string) ||
            errorMessage;

          if ("non_field_errors" in responseData) {
            errorMessage = "Error al registrar la empresa";
          }

          setFieldErrors({});
        }
      } else {
        setFieldErrors({});
      }

      toast.error(errorMessage);
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep < STEPS.length) {
      changeStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      changeStep(currentStep - 1);
    }
  };

  if (loadingData) {
    return (
      <div className="min-h-screen bg-background dark:bg-[#0a1a15]">
        <Navbar />
        <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
          <div className="w-8 h-8 border-4 border-primary/30 dark:border-[#68A243]/30 border-t-primary dark:border-t-[#68A243] rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background dark:bg-[#0a1a15]">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-8">
        {/* Fila superior: Volver (col1) + Logo/título (col2-4) alineados */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-4">
          <div className="lg:col-span-1 flex items-center">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-primary text-foreground"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver
            </Button>
          </div>
          <div className="lg:col-span-3 flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#68A243] to-[#5a9139] rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
              <img
                src="/simple_blanco_fondo_transparente_recortada.webp"
                alt="Ronda de Negocios"
                className="w-7 h-7 object-contain translate-y-0.5"
              />
            </div>
            <div>
              <h1 className="text-base font-bold text-[#143E29] dark:text-white leading-tight">
                Inscribí tu empresa
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Completá los 4 pasos para participar en la Ronda de Negocios
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar with Steps */}
          <aside className="lg:col-span-1">
            <div className="space-y-4">
              {STEPS.map((step, index) => {
                const isCompleted = index + 1 < currentStep;
                const isCurrent = index + 1 === currentStep;
                const StepIcon = step.icon;

                return (
                  <div key={step.id}>
                    <div
                      className={`flex items-start gap-4 p-4 rounded-lg transition-all ${
                        isCurrent
                          ? "bg-[#68A243] !text-white !shadow-lg dark:bg-[#68A243]"
                          : isCompleted
                            ? "bg-[#68A243]/20 !text-[#68A243] dark:bg-[#1a5032] dark:!text-[#68A243]"
                            : "!bg-slate-200 dark:!bg-slate-700 !text-gray-600 dark:!text-gray-400"
                      }`}
                    >
                      <div
                        className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                          isCurrent
                            ? "!bg-white !text-[#68A243]"
                            : isCompleted
                              ? "!bg-[#68A243] !text-white dark:bg-[#68A243]"
                              : "!bg-gray-400 dark:!bg-slate-600 !text-white dark:!text-gray-300"
                        }`}
                      >
                        {isCompleted ? (
                          <Check className="w-5 h-5" />
                        ) : (
                          <StepIcon className="w-5 h-5" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p
                          className={`text-xs font-semibold ${
                            isCurrent
                              ? "!text-white"
                              : "opacity-75 dark:opacity-90"
                          }`}
                        >
                          Paso {step.id}
                        </p>
                        <p
                          className={`font-semibold ${isCurrent ? "!text-white" : "text-foreground dark:text-white"}`}
                        >
                          {step.title}
                        </p>
                      </div>
                    </div>
                    {index < STEPS.length - 1 && (
                      <div
                        className={`h-6 w-0.5 mx-[calc(1.25rem+1.25rem)] my-2 ${
                          isCompleted
                            ? "!bg-[#68A243]"
                            : "!bg-slate-300 dark:!bg-slate-600"
                        }`}
                      ></div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Progress info */}
            <div className="mt-8 p-4 bg-muted/50 dark:bg-slate-800/50 rounded-lg">
              <p className="text-xs text-muted-foreground dark:text-gray-400">
                Progreso: <span className="font-semibold">{currentStep}</span>{" "}
                de <span className="font-semibold">{STEPS.length}</span>
              </p>
              <div className="mt-2 w-full bg-muted-foreground/20 dark:bg-slate-700/50 rounded-full h-2">
                <div
                  className="bg-primary dark:bg-[#68A243] h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${(currentStep / STEPS.length) * 100}%`,
                  }}
                ></div>
              </div>
            </div>
          </aside>

          {/* Main content */}
          <div className="lg:col-span-3">
            <Card className="!border-slate-200/60 dark:!border-[#68A243]/20 !bg-white dark:!bg-[#0a1a15]">
              <CardContent className="p-8">
                <AnimatePresence
                  mode="wait"
                  initial={false}
                  custom={stepDirection}
                >
                  <m.div
                    key={currentStep}
                    custom={stepDirection}
                    variants={stepTransitionVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={stepTransition}
                    className="will-change-transform"
                  >
                    {currentStep === 1 && (
                      <div className="space-y-6">
                        <div>
                          <h2 className="text-2xl font-bold text-foreground dark:text-white">
                            Datos de tu empresa
                          </h2>
                          <p className="text-sm text-muted-foreground dark:text-gray-400">
                            Información básica y ubicación
                          </p>
                        </div>

                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label
                              htmlFor="razon_social"
                              className="text-gray-700 dark:text-gray-300 font-bold text-sm"
                            >
                              Razón social <RequiredMark />
                            </Label>
                            <Input
                              id="razon_social"
                              value={formData.razon_social}
                              onChange={(e) => {
                                setFormData({
                                  ...formData,
                                  razon_social: e.target.value,
                                });
                                setFieldErrors({
                                  ...fieldErrors,
                                  razon_social: [],
                                });
                              }}
                              placeholder="Ej: TechSolutions SA"
                              className={`h-11 !bg-white dark:!bg-[#0f1419] !text-foreground dark:!text-white !border-slate-200 dark:!border-[#1a5032] dark:placeholder:!text-[#b8c0ca] ${
                                hasFieldError("razon_social")
                                  ? "!border-red-500 focus-visible:!ring-red-500/50"
                                  : "focus-visible:border-[#68A243] dark:focus-visible:!border-[#2d7a52]"
                              }`}
                            />
                            {hasFieldError("razon_social") && (
                              <p className="text-sm text-red-500">
                                {fieldErrors.razon_social.join(", ")}
                              </p>
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label
                              htmlFor="cuit"
                              className="text-gray-700 dark:text-gray-300 font-bold text-sm"
                            >
                              CUIT <RequiredMark />
                            </Label>
                            <Input
                              id="cuit"
                              value={formData.cuit}
                              inputMode="numeric"
                              onChange={(e) => {
                                setFormData({
                                  ...formData,
                                  cuit: e.target.value,
                                });
                                setFieldErrors({ ...fieldErrors, cuit: [] });
                              }}
                              placeholder="30-12345678-9"
                              className={`h-11 !bg-white dark:!bg-[#0f1419] !text-foreground dark:!text-white !border-slate-200 dark:!border-[#1a5032] dark:placeholder:!text-[#b8c0ca] ${
                                hasFieldError("cuit") || cuitValidationError
                                  ? "!border-red-500 focus-visible:!ring-red-500/50"
                                  : "focus-visible:border-[#68A243] dark:focus-visible:!border-[#2d7a52]"
                              }`}
                            />
                            {(cuitValidationError || hasFieldError("cuit")) && (
                              <p className="text-sm text-red-500">
                                {cuitValidationError ??
                                  fieldErrors.cuit.join(", ")}
                              </p>
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label
                              htmlFor="direccion"
                              className="text-gray-700 dark:text-gray-300 font-bold text-sm"
                            >
                              Dirección <RequiredMark />
                            </Label>
                            <Input
                              id="direccion"
                              value={formData.direccion}
                              maxLength={80}
                              onChange={(e) => {
                                setFormData({
                                  ...formData,
                                  direccion: e.target.value,
                                });
                                setFieldErrors({
                                  ...fieldErrors,
                                  direccion: [],
                                });
                              }}
                              placeholder="Ej: Calle Principal 123"
                              className={`h-11 !bg-white dark:!bg-[#0f1419] !text-foreground dark:!text-white !border-slate-200 dark:!border-[#1a5032] dark:placeholder:!text-[#b8c0ca] ${
                                hasFieldError("direccion")
                                  ? "!border-red-500 focus-visible:!ring-red-500/50"
                                  : "focus-visible:border-[#68A243] dark:focus-visible:!border-[#2d7a52]"
                              }`}
                            />
                            {hasFieldError("direccion") && (
                              <p className="text-sm text-red-500">
                                {fieldErrors.direccion.join(", ")}
                              </p>
                            )}
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label
                                htmlFor="provincia"
                                className="text-gray-700 dark:text-gray-300 font-bold text-sm"
                              >
                                Provincia <RequiredMark />
                              </Label>
                              <Popover
                                open={provinceOpen}
                                onOpenChange={setProvinceOpen}
                              >
                                <PopoverTrigger asChild>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={provinceOpen}
                                    className={`h-11 w-full justify-between !bg-white dark:!bg-[#0f1419] !text-foreground dark:!text-white !border-slate-200 dark:!border-[#1a5032] hover:!bg-white dark:hover:!bg-[#0f1419] ${
                                      hasFieldError("provincia_id")
                                        ? "!border-red-500"
                                        : "dark:focus-visible:!border-[#2d7a52]"
                                    }`}
                                  >
                                    <span className="truncate">
                                      {selectedProvincia?.nombre ||
                                        "Seleccioná una provincia"}
                                    </span>
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent
                                  className="w-[var(--radix-popover-trigger-width)] p-0"
                                  align="start"
                                >
                                  <Command>
                                    <CommandInput placeholder="Buscar provincia..." />
                                    <CommandList>
                                      <CommandEmpty>
                                        No se encontró ninguna provincia
                                      </CommandEmpty>
                                      <CommandGroup>
                                        {sortedProvincias.map((provincia) => (
                                          <CommandItem
                                            key={provincia.id}
                                            value={provincia.nombre}
                                            onSelect={() => {
                                              setFormData({
                                                ...formData,
                                                provincia_id: provincia.id,
                                                localidad: 0,
                                              });
                                              setFieldErrors({
                                                ...fieldErrors,
                                                provincia_id: [],
                                                localidad: [],
                                              });
                                              setProvinceOpen(false);
                                            }}
                                          >
                                            <Check
                                              className={`mr-2 h-4 w-4 ${
                                                formData.provincia_id ===
                                                provincia.id
                                                  ? "opacity-100"
                                                  : "opacity-0"
                                              }`}
                                            />
                                            {provincia.nombre}
                                          </CommandItem>
                                        ))}
                                      </CommandGroup>
                                    </CommandList>
                                  </Command>
                                </PopoverContent>
                              </Popover>
                            </div>

                            <div className="space-y-2">
                              <Label
                                htmlFor="localidad"
                                className="text-gray-700 dark:text-gray-300 font-bold text-sm"
                              >
                                Localidad <RequiredMark />
                              </Label>
                              <Popover
                                open={localidadOpen}
                                onOpenChange={(open) => {
                                  if (formData.provincia_id !== 0) {
                                    setLocalidadOpen(open);
                                  }
                                }}
                              >
                                <PopoverTrigger asChild>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={localidadOpen}
                                    disabled={formData.provincia_id === 0}
                                    className={`h-11 w-full justify-between !bg-white dark:!bg-[#0f1419] !text-foreground dark:!text-white !border-slate-200 dark:!border-[#1a5032] disabled:!opacity-50 hover:!bg-white dark:hover:!bg-[#0f1419] ${
                                      hasFieldError("localidad")
                                        ? "!border-red-500"
                                        : "dark:focus-visible:!border-[#2d7a52]"
                                    }`}
                                  >
                                    <span className="truncate">
                                      {selectedLocalidad?.nombre ||
                                        "Seleccioná una localidad"}
                                    </span>
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent
                                  className="w-[var(--radix-popover-trigger-width)] p-0"
                                  align="start"
                                >
                                  <Command>
                                    <CommandInput placeholder="Buscar localidad..." />
                                    <CommandList>
                                      <CommandEmpty>
                                        {loadingLocalidades
                                          ? "Cargando localidades..."
                                          : "No se encontró ninguna localidad"}
                                      </CommandEmpty>
                                      <CommandGroup>
                                        {sortedLocalidades.map((loc) => (
                                          <CommandItem
                                            key={loc.id}
                                            value={loc.nombre}
                                            onSelect={() => {
                                              setFormData({
                                                ...formData,
                                                localidad: loc.id,
                                              });
                                              setFieldErrors({
                                                ...fieldErrors,
                                                localidad: [],
                                              });
                                              setLocalidadOpen(false);
                                            }}
                                          >
                                            <Check
                                              className={`mr-2 h-4 w-4 ${
                                                formData.localidad === loc.id
                                                  ? "opacity-100"
                                                  : "opacity-0"
                                              }`}
                                            />
                                            {loc.nombre}
                                          </CommandItem>
                                        ))}
                                      </CommandGroup>
                                    </CommandList>
                                  </Command>
                                </PopoverContent>
                              </Popover>
                              {hasFieldError("localidad") && (
                                <p className="text-sm text-red-500">
                                  {fieldErrors.localidad.join(", ")}
                                </p>
                              )}
                            </div>
                          </div>
                          {hasFieldError("provincia_id") && (
                            <p className="text-sm text-red-500">
                              {fieldErrors.provincia_id.join(", ")}
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {currentStep === 2 && (
                      <div className="space-y-6">
                        <div>
                          <h2 className="text-2xl font-bold text-foreground dark:text-white">
                            Sector y marca
                          </h2>
                          <p className="text-sm text-muted-foreground dark:text-gray-400">
                            ¿A qué se dedica tu empresa?
                          </p>
                        </div>

                        <div className="space-y-6">
                          <div className="space-y-2">
                            <Label
                              htmlFor="sector"
                              className="text-gray-700 dark:text-gray-300 font-bold text-sm"
                            >
                              Seleccioná el sector <RequiredMark />
                            </Label>
                            <Select
                              value={
                                formData.sector === 0
                                  ? ""
                                  : String(formData.sector)
                              }
                              onValueChange={(v) => {
                                setFormData({
                                  ...formData,
                                  sector: parseInt(v),
                                });
                                setFieldErrors({ ...fieldErrors, sector: [] });
                              }}
                            >
                              <SelectTrigger
                                className={`h-11 !bg-white dark:!bg-[#0f1419] !text-foreground dark:!text-white !border-slate-200 dark:!border-[#1a5032] ${
                                  hasFieldError("sector")
                                    ? "!border-red-500"
                                    : "dark:focus-visible:!border-[#2d7a52]"
                                }`}
                              >
                                <SelectValue placeholder="Seleccioná un sector" />
                              </SelectTrigger>
                              <SelectContent>
                                {sortedSectors.map((sector) => (
                                  <SelectItem
                                    key={sector.id}
                                    value={String(sector.id)}
                                  >
                                    {sector.nombre}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {hasFieldError("sector") && (
                              <p className="text-sm text-red-500">
                                {fieldErrors.sector.join(", ")}
                              </p>
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label
                              htmlFor="descripcion"
                              className="text-gray-700 dark:text-gray-300 font-bold text-sm"
                            >
                              Descripción
                            </Label>
                            <Textarea
                              id="descripcion"
                              value={formData.descripcion}
                              maxLength={500}
                              onChange={(e) => {
                                setFormData({
                                  ...formData,
                                  descripcion: e.target.value,
                                });
                                setFieldErrors({
                                  ...fieldErrors,
                                  descripcion: [],
                                });
                              }}
                              rows={5}
                              placeholder="Cuéntanos más sobre tu empresa..."
                              className={`!resize-none !max-h-40 !bg-white dark:!bg-[#0f1419] !text-foreground dark:!text-white !border-slate-200 dark:!border-[#1a5032] dark:placeholder:!text-[#b8c0ca] ${
                                hasFieldError("descripcion")
                                  ? "!border-red-500 focus-visible:!ring-red-500/50"
                                  : "dark:focus-visible:!ring-[#68A243]/50"
                              }`}
                            />
                            <div className="flex items-center justify-between">
                              {hasFieldError("descripcion") ? (
                                <p className="text-sm text-red-500">
                                  {fieldErrors.descripcion.join(", ")}
                                </p>
                              ) : (
                                <span />
                              )}
                              <p
                                className={`text-xs tabular-nums ${
                                  formData.descripcion.length >= 500
                                    ? "text-red-500 dark:text-red-400"
                                    : formData.descripcion.length >= 450
                                      ? "text-amber-500 dark:text-amber-400"
                                      : "text-muted-foreground dark:text-gray-500"
                                }`}
                              >
                                {formData.descripcion.length}/500
                              </p>
                            </div>
                          </div>

                          <div className="space-y-4 pt-4 border-t dark:border-[#2a3d4d]">
                            <div className="flex items-center gap-2">
                              <Label className="text-gray-700 dark:text-gray-300 font-bold text-sm">
                                Logo de la empresa
                              </Label>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <button
                                      type="button"
                                      className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-primary/20 dark:bg-[#68A243]/20 text-primary dark:text-[#68A243] hover:bg-primary/30 dark:hover:bg-[#68A243]/30 transition-colors"
                                    >
                                      <Info className="w-3 h-3" />
                                    </button>
                                  </TooltipTrigger>
                                  <TooltipContent
                                    side="right"
                                    className="max-w-xs"
                                  >
                                    <p className="text-sm">
                                      La imagen se mostrará en formato cuadrado
                                      (1:1). Recomendamos usar imágenes
                                      cuadradas de al menos 256x256 píxeles (ej:
                                      256x256, 512x512, 1024x1024).
                                    </p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                            <ImageCropperNew
                              onImageSelect={handleImageUpload}
                              initialBlob={logoFile}
                              maxFileSize={5}
                              acceptedFormats={[
                                "image/png",
                                "image/jpeg",
                                "image/webp",
                              ]}
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {currentStep === 3 && (
                      <div className="space-y-6">
                        <div>
                          <h2 className="text-2xl font-bold text-foreground dark:text-white">
                            Persona de contacto
                          </h2>
                          <p className="text-sm text-muted-foreground dark:text-gray-400">
                            Información del representante principal
                          </p>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label
                              htmlFor="email"
                              className="text-gray-700 dark:text-gray-300 font-bold text-sm"
                            >
                              Email <RequiredMark />
                            </Label>
                            <Input
                              id="email"
                              type="email"
                              value={formData.email}
                              onChange={(e) => {
                                setFormData({
                                  ...formData,
                                  email: e.target.value,
                                });
                                setFieldErrors({ ...fieldErrors, email: [] });
                              }}
                              placeholder="contacto@empresa.com"
                              className={`h-11 !bg-white dark:!bg-[#0f1419] !text-foreground dark:!text-white !border-slate-200 dark:!border-[#1a5032] dark:placeholder:!text-[#b8c0ca] ${
                                hasFieldError("email")
                                  ? "!border-red-500 focus-visible:!ring-red-500/50"
                                  : "focus-visible:border-[#68A243] dark:focus-visible:!border-[#2d7a52]"
                              }`}
                            />
                            <p className="border-l-2 border-amber-400/70 pl-3 text-xs leading-5 text-amber-800/90 dark:border-amber-500/50 dark:text-amber-300/90">
                              Recibiras un correo de confirmacion en este email.
                              Asegurate de verificarlo antes de iniciar sesión.
                            </p>
                            {hasFieldError("email") && (
                              <p className="text-sm text-red-500">
                                {fieldErrors.email.join(", ")}
                              </p>
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label
                              htmlFor="telefono_contacto"
                              className="text-gray-700 dark:text-gray-300 font-bold text-sm"
                            >
                              Teléfono <RequiredMark />
                            </Label>
                            <Input
                              id="telefono_contacto"
                              type="tel"
                              value={formData.telefono_contacto}
                              onChange={(e) => {
                                setFormData({
                                  ...formData,
                                  telefono_contacto: e.target.value,
                                });
                                setFieldErrors({
                                  ...fieldErrors,
                                  telefono_contacto: [],
                                });
                              }}
                              placeholder="+54 11 1234-5678"
                              className={`h-11 !bg-white dark:!bg-[#0f1419] !text-foreground dark:!text-white !border-slate-200 dark:!border-[#1a5032] dark:placeholder:!text-[#b8c0ca] ${
                                hasFieldError("telefono_contacto")
                                  ? "!border-red-500 focus-visible:!ring-red-500/50"
                                  : "dark:focus-visible:!ring-[#68A243]/30"
                              }`}
                            />
                            {hasFieldError("telefono_contacto") && (
                              <p className="text-sm text-red-500">
                                {fieldErrors.telefono_contacto.join(", ")}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {currentStep === 4 && (
                      <div className="space-y-6">
                        <div>
                          <h2 className="text-2xl font-bold text-foreground dark:text-white">
                            Crea tu contraseña
                          </h2>
                          <p className="text-sm text-muted-foreground dark:text-gray-400">
                            Esta será tu contraseña de acceso a la plataforma
                          </p>
                        </div>

                        <div className="space-y-5">
                          <div className="grid sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label
                                htmlFor="password"
                                className="text-gray-700 dark:text-gray-300 font-bold text-sm"
                              >
                                Contraseña <RequiredMark />
                              </Label>
                              <div className="relative">
                                <Input
                                  id="password"
                                  type={showPassword ? "text" : "password"}
                                  value={formData.password}
                                  onChange={(e) => {
                                    setFormData({
                                      ...formData,
                                      password: e.target.value,
                                    });
                                    setFieldErrors({
                                      ...fieldErrors,
                                      password: [],
                                    });
                                  }}
                                  placeholder="••••••••"
                                  className={`h-11 pr-10 !bg-white dark:!bg-[#0f1419] !text-foreground dark:!text-white !border-slate-200 dark:!border-[#1a5032] dark:placeholder:!text-[#b8c0ca] ${
                                    hasFieldError("password") ||
                                    passwordsMismatch()
                                      ? "!border-red-500 focus-visible:!ring-red-500/50"
                                      : "dark:focus-visible:!ring-[#68A243]/50"
                                  }`}
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowPassword(!showPassword)}
                                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-[#68A243] transition-colors"
                                >
                                  {showPassword ? (
                                    <EyeOff className="h-4 w-4" />
                                  ) : (
                                    <Eye className="h-4 w-4" />
                                  )}
                                </button>
                              </div>
                              {hasFieldError("password") && (
                                <p className="text-sm text-red-500">
                                  {fieldErrors.password.join(", ")}
                                </p>
                              )}
                            </div>

                            <div className="space-y-2">
                              <Label
                                htmlFor="password_confirm"
                                className="text-gray-700 dark:text-gray-300 font-bold text-sm"
                              >
                                Repetir contraseña <RequiredMark />
                              </Label>
                              <div className="relative">
                                <Input
                                  id="password_confirm"
                                  type={
                                    showPasswordConfirm ? "text" : "password"
                                  }
                                  value={formData.password_confirm}
                                  onChange={(e) => {
                                    setFormData({
                                      ...formData,
                                      password_confirm: e.target.value,
                                    });
                                    setFieldErrors({
                                      ...fieldErrors,
                                      password2: [],
                                    });
                                  }}
                                  placeholder="••••••••"
                                  className={`h-11 pr-10 !bg-white dark:!bg-[#0f1419] !text-foreground dark:!text-white !border-slate-200 dark:!border-[#1a5032] dark:placeholder:!text-[#b8c0ca] ${
                                    hasFieldError("password2") ||
                                    passwordsMismatch()
                                      ? "!border-red-500 focus-visible:!ring-red-500/50"
                                      : "dark:focus-visible:!ring-[#68A243]/50"
                                  }`}
                                />
                                <button
                                  type="button"
                                  onClick={() =>
                                    setShowPasswordConfirm(!showPasswordConfirm)
                                  }
                                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-[#68A243] transition-colors"
                                >
                                  {showPasswordConfirm ? (
                                    <EyeOff className="h-4 w-4" />
                                  ) : (
                                    <Eye className="h-4 w-4" />
                                  )}
                                </button>
                              </div>
                              {(hasFieldError("password2") ||
                                passwordsMismatch()) && (
                                <p className="text-sm text-red-500">
                                  {passwordsMismatch()
                                    ? "Las contraseñas no coinciden"
                                    : fieldErrors.password2.join(", ")}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Checkbox de términos */}
                        <div className="mt-6 flex items-start gap-3 rounded-lg border border-slate-200 dark:border-[#68A243]/20 bg-slate-50 dark:bg-[#143E29]/30 px-4 py-3">
                          <Checkbox
                            id="terms"
                            checked={termsAccepted}
                            onCheckedChange={(checked) =>
                              setTermsAccepted(checked === true)
                            }
                            className="mt-0.5 border-[#68A243] data-[state=checked]:!bg-[#68A243] data-[state=checked]:!border-[#68A243]"
                          />
                          <label
                            htmlFor="terms"
                            className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed cursor-pointer select-none"
                          >
                            He leído y acepto los{" "}
                            <button
                              type="button"
                              onClick={() => setTermsModalOpen(true)}
                              className="font-semibold text-[#68A243] hover:text-[#5a9038] dark:text-[#9FD27B] dark:hover:text-[#68A243] underline underline-offset-2 transition-colors"
                            >
                              Términos y Condiciones de Uso
                            </button>{" "}
                            y la{" "}
                            <button
                              type="button"
                              onClick={() => setPrivacyModalOpen(true)}
                              className="font-semibold text-[#68A243] hover:text-[#5a9038] dark:text-[#9FD27B] dark:hover:text-[#68A243] underline underline-offset-2 transition-colors"
                            >
                              Política de Privacidad
                            </button>{" "}
                            de la plataforma.
                          </label>
                        </div>
                      </div>
                    )}
                  </m.div>
                </AnimatePresence>

                <div className="mt-8 space-y-4">
                  <div className="flex gap-3">
                    {currentStep > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={prevStep}
                        className="flex-1 h-11 bg-transparent text-black border-black/30 dark:text-white  hover:bg-accent hover:border-accent hover:text-white transition-colors duration-200 ease-in-out"
                      >
                        <ChevronLeft className="mr-2 h-4 w-4" />
                        Anterior
                      </Button>
                    )}
                    <Button
                      type="button"
                      onClick={nextStep}
                      disabled={
                        !isStepComplete() ||
                        isLoading ||
                        (currentStep === STEPS.length && !termsAccepted)
                      }
                      className={`${
                        currentStep === 1 ? "w-full" : "flex-1"
                      } relative overflow-hidden h-11 font-semibold text-white transition-colors duration-200 cursor-pointer
                        ${
                          isLoading
                            ? "!cursor-wait bg-primary dark:!bg-[#68A243]"
                            : "disabled:cursor-not-allowed disabled:!bg-gray-200 dark:disabled:!bg-gray-700/60 disabled:!text-gray-400 dark:disabled:!text-gray-500 disabled:!shadow-none"
                        }
                        bg-primary dark:bg-[#68A243] hover:bg-primary-strong dark:hover:bg-[#5a8f38]`}
                    >
                      {/* Relleno animado de izquierda a derecha mientras carga */}
                      {isLoading &&
                        currentStep === STEPS.length &&
                        !shouldReduceMotion && (
                          <m.span
                            className="absolute inset-0 bg-white/20 origin-left"
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: 1 }}
                            transition={{ duration: 2.5, ease: "easeInOut" }}
                            style={{ transformOrigin: "left" }}
                          />
                        )}

                      {isLoading && currentStep === STEPS.length ? (
                        <span className="relative z-10 flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white/60 border-t-white rounded-full animate-spin" />
                          Enviando...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          {currentStep === STEPS.length
                            ? "Registrar empresa"
                            : "Continuar"}
                          {currentStep < STEPS.length && (
                            <ChevronRight className="ml-2 h-4 w-4" />
                          )}
                        </span>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <TermsAndConditionsModal
        open={termsModalOpen}
        onOpenChange={setTermsModalOpen}
        onAccept={() => setTermsAccepted(true)}
      />
      <PrivacyPolicyModal
        open={privacyModalOpen}
        onOpenChange={setPrivacyModalOpen}
        onAccept={() => setTermsAccepted(true)}
      />
    </div>
  );
}
