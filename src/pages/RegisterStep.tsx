import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Building2,
  Mail,
  User,
  FileText,
  ChevronRight,
  ChevronLeft,
  Eye,
  EyeOff,
  Check,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Card, CardContent } from "../components/ui/card";
import { useNavigate } from "react-router";
import type { GenericType } from "../types/GenericType";
import type { LocalidadResponse } from "../types/Localidad";
import type { EmpresaWrite } from "../types/Empresa";
import Navbar from "../components/Navbar";
import ImageCropperNew from "../components/ImageCropperNew";
import { getSectors } from "../api/SectorService";
import { getLocalidades } from "../api/LocalidadesService";
import { createCompany } from "../api/EmpresaService";
import { toast } from "sonner";

const STEPS = [
  { id: 1, title: "Empresa", icon: Building2 },
  { id: 2, title: "Marca", icon: FileText },
  { id: 3, title: "Contacto", icon: User },
  { id: 4, title: "Seguridad", icon: Mail },
];

export default function RegistrationForm() {
  const [sectorList, setSectorList] = useState<GenericType[]>([]);
  const [localidadesList, setLocalidadesList] = useState<LocalidadResponse[]>(
    [],
  );
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [logoBlob, setLogoBlob] = useState<Blob | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const navigate = useNavigate();

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sectors, localidades] = await Promise.all([
          getSectors(),
          getLocalidades(),
        ]);
        setSectorList(sectors);
        setLocalidadesList(localidades);
      } catch (error) {
        toast.error("Error al cargar datos del formulario");
        console.error(error);
      } finally {
        setLoadingData(false);
      }
    };
    fetchData();
  }, []);

  const handleImageUpload = (croppedBlob: Blob) => {
    setLogoBlob(croppedBlob);
    toast.success("Logo guardado correctamente");
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
    return (
      formData.password &&
      formData.password_confirm &&
      formData.password !== formData.password_confirm
    );
  };

  const isStepComplete = () => {
    switch (currentStep) {
      case 1:
        return !!(
          formData.razon_social &&
          formData.cuit &&
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
        cuit: formData.cuit,
        email: formData.email,
        password: formData.password,
        password2: formData.password_confirm,
        telefono_contacto: formData.telefono_contacto,
        direccion: formData.direccion,
        localidad: formData.localidad,
        sector: formData.sector,
        ...(formData.descripcion && {
          descripcion: formData.descripcion,
        }),
        ...(logoBlob && {
          logo: new File([logoBlob], "logo.png", { type: "image/png" }),
        }),
      };

      await createCompany(companyData);
      toast.success("¡Empresa registrada exitosamente!");
      setFieldErrors({});
      navigate("/");
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
              newFieldErrors[key] = (value as string[]).map(
                translateErrorMessage,
              );
            } else if (typeof value === "string") {
              newFieldErrors[key] = [translateErrorMessage(value)];
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
          setCurrentStep(stepWithError);
        } else {
          errorMessage =
            (responseData?.detail as string) ||
            (responseData?.message as string) ||
            errorMessage;
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
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
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
      <div className="pt-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-primary text-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                          Razón social *
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
                          className={`h-11 !bg-white dark:!bg-[#0f1419] !text-foreground dark:!text-white !border-slate-200 dark:!border-[#1a5032] dark:placeholder:!text-gray-500 ${
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
                          CUIT *
                        </Label>
                        <Input
                          id="cuit"
                          value={formData.cuit}
                          onChange={(e) => {
                            setFormData({ ...formData, cuit: e.target.value });
                            setFieldErrors({ ...fieldErrors, cuit: [] });
                          }}
                          placeholder="30-12345678-9"
                          className={`h-11 !bg-white dark:!bg-[#0f1419] !text-foreground dark:!text-white !border-slate-200 dark:!border-[#1a5032] dark:placeholder:!text-gray-500 ${
                            hasFieldError("cuit")
                              ? "!border-red-500 focus-visible:!ring-red-500/50"
                              : "focus-visible:border-[#68A243] dark:focus-visible:!border-[#2d7a52]"
                          }`}
                        />
                        {hasFieldError("cuit") && (
                          <p className="text-sm text-red-500">
                            {fieldErrors.cuit.join(", ")}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="direccion"
                          className="text-gray-700 dark:text-gray-300 font-bold text-sm"
                        >
                          Dirección *
                        </Label>
                        <Input
                          id="direccion"
                          value={formData.direccion}
                          onChange={(e) => {
                            setFormData({
                              ...formData,
                              direccion: e.target.value,
                            });
                            setFieldErrors({ ...fieldErrors, direccion: [] });
                          }}
                          placeholder="Ej: Calle Principal 123"
                          className={`h-11 !bg-white dark:!bg-[#0f1419] !text-foreground dark:!text-white !border-slate-200 dark:!border-[#1a5032] dark:placeholder:!text-gray-500 ${
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
                            Provincia *
                          </Label>
                          <Select
                            value={
                              formData.provincia_id === 0
                                ? ""
                                : String(formData.provincia_id)
                            }
                            onValueChange={(v) => {
                              setFormData({
                                ...formData,
                                provincia_id: parseInt(v),
                                localidad: 0,
                              });
                              setFieldErrors({
                                ...fieldErrors,
                                provincia_id: [],
                              });
                            }}
                          >
                            <SelectTrigger
                              className={`h-11 w-full !bg-white dark:!bg-[#0f1419] !text-foreground dark:!text-white !border-slate-200 dark:!border-[#1a5032] ${
                                hasFieldError("provincia_id")
                                  ? "!border-red-500"
                                  : "dark:focus-visible:!border-[#2d7a52]"
                              }`}
                            >
                              <SelectValue placeholder="Seleccioná una provincia" />
                            </SelectTrigger>
                            <SelectContent>
                              {Array.from(
                                new Set(
                                  localidadesList.map((l) => l.provincia.id),
                                ),
                              ).map((provinciaId) => {
                                const provincia = localidadesList.find(
                                  (l) => l.provincia.id === provinciaId,
                                )?.provincia;
                                return (
                                  <SelectItem
                                    key={provinciaId}
                                    value={String(provinciaId)}
                                  >
                                    {provincia?.nombre || ""}
                                  </SelectItem>
                                );
                              })}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label
                            htmlFor="localidad"
                            className="text-gray-700 dark:text-gray-300 font-bold text-sm"
                          >
                            Localidad *
                          </Label>
                          <Select
                            value={
                              formData.localidad === 0
                                ? ""
                                : String(formData.localidad)
                            }
                            onValueChange={(v) => {
                              setFormData({
                                ...formData,
                                localidad: parseInt(v),
                              });
                              setFieldErrors({
                                ...fieldErrors,
                                localidad: [],
                              });
                            }}
                            disabled={formData.provincia_id === 0}
                          >
                            <SelectTrigger
                              className={`h-11 w-full !bg-white dark:!bg-[#0f1419] !text-foreground dark:!text-white !border-slate-200 dark:!border-[#1a5032] disabled:!opacity-50 ${
                                hasFieldError("localidad")
                                  ? "!border-red-500"
                                  : "dark:focus-visible:!border-[#2d7a52]"
                              }`}
                            >
                              <SelectValue placeholder="Seleccioná una localidad" />
                            </SelectTrigger>
                            <SelectContent>
                              {localidadesList.map((loc) => (
                                <SelectItem key={loc.id} value={String(loc.id)}>
                                  {loc.nombre}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
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
                          Seleccioná el sector *
                        </Label>
                        <Select
                          value={
                            formData.sector === 0 ? "" : String(formData.sector)
                          }
                          onValueChange={(v) => {
                            setFormData({ ...formData, sector: parseInt(v) });
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
                            {sectorList.map((sector) => (
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
                          placeholder="Cuéntanos más sobre tu empresa..."
                          className={`!bg-white dark:!bg-[#0f1419] !text-foreground dark:!text-white !border-slate-200 dark:!border-[#1a5032] dark:placeholder:!text-gray-500 ${
                            hasFieldError("descripcion")
                              ? "!border-red-500 focus-visible:!ring-red-500/50"
                              : "dark:focus-visible:!ring-[#68A243]/50"
                          }`}
                        />
                        {hasFieldError("descripcion") && (
                          <p className="text-sm text-red-500">
                            {fieldErrors.descripcion.join(", ")}
                          </p>
                        )}
                      </div>

                      <div className="space-y-3 pt-4 border-t dark:border-[#2a3d4d]">
                        <ImageCropperNew
                          onImageSelect={handleImageUpload}
                          initialBlob={logoBlob}
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
                          Email *
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => {
                            setFormData({ ...formData, email: e.target.value });
                            setFieldErrors({ ...fieldErrors, email: [] });
                          }}
                          placeholder="contacto@empresa.com"
                          className={`h-11 !bg-white dark:!bg-[#0f1419] !text-foreground dark:!text-white !border-slate-200 dark:!border-[#1a5032] dark:placeholder:!text-gray-500 ${
                            hasFieldError("email")
                              ? "!border-red-500 focus-visible:!ring-red-500/50"
                              : "focus-visible:border-[#68A243] dark:focus-visible:!border-[#2d7a52]"
                          }`}
                        />
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
                          Teléfono *
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
                          className={`h-11 !bg-white dark:!bg-[#0f1419] !text-foreground dark:!text-white !border-slate-200 dark:!border-[#1a5032] dark:placeholder:!text-gray-500 ${
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
                            Contraseña *
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
                              className={`h-11 pr-10 !bg-white dark:!bg-[#0f1419] !text-foreground dark:!text-white !border-slate-200 dark:!border-[#1a5032] dark:placeholder:!text-gray-500 ${
                                hasFieldError("password") || passwordsMismatch()
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
                            Repetir contraseña *
                          </Label>
                          <Input
                            id="password_confirm"
                            type="password"
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
                            className={`h-11 !bg-white dark:!bg-[#0f1419] !text-foreground dark:!text-white !border-slate-200 dark:!border-[#1a5032] dark:placeholder:!text-gray-500 ${
                              hasFieldError("password2") || passwordsMismatch()
                                ? "!border-red-500 focus-visible:!ring-red-500/50"
                                : "dark:focus-visible:!ring-[#68A243]/50"
                            }`}
                          />
                          {hasFieldError("password2") && (
                            <p className="text-sm text-red-500">
                              {fieldErrors.password2.join(", ")}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

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
                      disabled={!isStepComplete() || isLoading}
                      className={`${
                        currentStep === 1 ? "w-full" : "flex-1"
                      } bg-primary dark:bg-[#68A243] hover:bg-primary-strong dark:hover:bg-[#5a8f38] h-11 font-semibold disabled:opacity-50 disabled:cursor-not-allowed text-white`}
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
    </div>
  );
}
