import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Building2,
  Mail,
  User,
  FileText,
  ChevronRight,
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
      navigate("/");
    } catch (error: unknown) {
      let errorMessage = "Error al registrar la empresa";
      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as Record<string, unknown>;
        const response = axiosError.response as Record<string, unknown>;
        errorMessage =
          (response?.data as Record<string, string>)?.detail ||
          (response?.data as Record<string, string>)?.message ||
          errorMessage;
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
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
          <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="hover:bg-gray-100 hover:text-primary text-foreground"
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
                          ? "bg-primary text-primary-foreground shadow-lg"
                          : isCompleted
                            ? "bg-primary/20 text-primary"
                            : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <div
                        className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                          isCurrent
                            ? "bg-primary-foreground text-primary"
                            : isCompleted
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted-foreground text-muted"
                        }`}
                      >
                        {isCompleted ? (
                          <Check className="w-5 h-5" />
                        ) : (
                          <StepIcon className="w-5 h-5" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-semibold opacity-75">
                          Paso {step.id}
                        </p>
                        <p className="font-semibold">{step.title}</p>
                      </div>
                    </div>
                    {index < STEPS.length - 1 && (
                      <div
                        className={`h-6 w-0.5 mx-[calc(1.25rem+1.25rem)] my-2 ${
                          isCompleted ? "bg-primary" : "bg-muted"
                        }`}
                      ></div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Progress info */}
            <div className="mt-8 p-4 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground">
                Progreso: <span className="font-semibold">{currentStep}</span>{" "}
                de <span className="font-semibold">{STEPS.length}</span>
              </p>
              <div className="mt-2 w-full bg-muted-foreground/20 rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${(currentStep / STEPS.length) * 100}%`,
                  }}
                ></div>
              </div>
            </div>
          </aside>

          {/* Main content */}
          <div className="lg:col-span-3">
            <Card className="border-secondary/20">
              <CardContent className="p-8">
                {currentStep === 1 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold">
                        Datos de tu empresa
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        Información básica y ubicación
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="razon_social">Razón social *</Label>
                        <Input
                          id="razon_social"
                          value={formData.razon_social}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              razon_social: e.target.value,
                            })
                          }
                          placeholder="Ej: TechSolutions SA"
                          className="h-11"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="cuit">CUIT *</Label>
                        <Input
                          id="cuit"
                          value={formData.cuit}
                          onChange={(e) =>
                            setFormData({ ...formData, cuit: e.target.value })
                          }
                          placeholder="XX-XXXXXXXX-X"
                          className="h-11"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="direccion">Dirección *</Label>
                        <Input
                          id="direccion"
                          value={formData.direccion}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              direccion: e.target.value,
                            })
                          }
                          placeholder="Ej: Calle Principal 123"
                          className="h-11"
                        />
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="provincia">Provincia *</Label>
                          <Select
                            value={
                              formData.provincia_id === 0
                                ? ""
                                : String(formData.provincia_id)
                            }
                            onValueChange={(v) =>
                              setFormData({
                                ...formData,
                                provincia_id: parseInt(v),
                                localidad: 0,
                              })
                            }
                          >
                            <SelectTrigger className="h-11">
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
                          <Label htmlFor="localidad">Localidad *</Label>
                          <Select
                            value={
                              formData.localidad === 0
                                ? ""
                                : String(formData.localidad)
                            }
                            onValueChange={(v) =>
                              setFormData({
                                ...formData,
                                localidad: parseInt(v),
                              })
                            }
                            disabled={formData.provincia_id === 0}
                          >
                            <SelectTrigger className="h-11 disabled:opacity-50">
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
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold">Sector y marca</h2>
                      <p className="text-sm text-muted-foreground">
                        ¿A qué se dedica tu empresa?
                      </p>
                    </div>

                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="sector">Seleccioná el sector *</Label>
                        <Select
                          value={
                            formData.sector === 0 ? "" : String(formData.sector)
                          }
                          onValueChange={(v) =>
                            setFormData({ ...formData, sector: parseInt(v) })
                          }
                        >
                          <SelectTrigger className="h-11">
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
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="descripcion">Descripción</Label>
                        <Textarea
                          id="descripcion"
                          value={formData.descripcion}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              descripcion: e.target.value,
                            })
                          }
                          placeholder="Cuéntanos más sobre tu empresa..."
                        />
                      </div>

                      <div className="space-y-3 pt-4 border-t">
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
                      <h2 className="text-2xl font-bold">
                        Persona de contacto
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        Información del representante principal
                      </p>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) =>
                            setFormData({ ...formData, email: e.target.value })
                          }
                          placeholder="contacto@empresa.com"
                          className="h-11"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="telefono_contacto">Teléfono *</Label>
                        <Input
                          id="telefono_contacto"
                          type="tel"
                          value={formData.telefono_contacto}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              telefono_contacto: e.target.value,
                            })
                          }
                          placeholder="+54 11 1234-5678"
                          className="h-11"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {currentStep === 4 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold">Crea tu contraseña</h2>
                      <p className="text-sm text-muted-foreground">
                        Esta será tu contraseña de acceso a la plataforma
                      </p>
                    </div>

                    <div className="space-y-5">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="password">Contraseña *</Label>
                          <div className="relative">
                            <Input
                              id="password"
                              type={showPassword ? "text" : "password"}
                              value={formData.password}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  password: e.target.value,
                                })
                              }
                              placeholder="••••••••"
                              className="h-11 pr-10"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-primary transition-colors"
                            >
                              {showPassword ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="password_confirm">
                            Repetir contraseña *
                          </Label>
                          <Input
                            id="password_confirm"
                            type="password"
                            value={formData.password_confirm}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                password_confirm: e.target.value,
                              })
                            }
                            placeholder="••••••••"
                            className="h-11"
                          />
                        </div>
                      </div>

                      {formData.password &&
                        formData.password_confirm &&
                        formData.password !== formData.password_confirm && (
                          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-xs text-red-600 font-medium">
                              ⚠️ Las contraseñas no coinciden
                            </p>
                          </div>
                        )}
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
                        className="flex-1 h-11"
                      >
                        Anterior
                      </Button>
                    )}
                    <Button
                      type="button"
                      onClick={nextStep}
                      disabled={!isStepComplete() || isLoading}
                      className={`${
                        currentStep === 1 ? "w-full" : "flex-1"
                      } bg-primary hover:bg-primary-strong h-11 font-semibold disabled:opacity-50 disabled:cursor-not-allowed`}
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
