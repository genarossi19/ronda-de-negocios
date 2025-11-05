import React, { useState } from "react";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Building2,
  Mail,
  Phone,
  CheckCircle2,
  Sparkles,
  User,
  FileText,
  Image as ImageIcon,
  ChevronRight,
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
import { Card, CardContent } from "../components/ui/card";
import { useNavigate } from "react-router";

const SECTORS = [
  "Tecnología",
  "Manufactura",
  "Servicios",
  "Comercio",
  "Agropecuario",
  "Construcción",
  "Educación",
  "Salud",
  "Turismo",
  "Otro",
];

const PROVINCES = [
  { id: 1, name: "Buenos Aires" },
  { id: 2, name: "Córdoba" },
  { id: 3, name: "Santa Fe" },
];

const LOCALITIES = {
  1: ["La Plata", "Mar del Plata", "Bahía Blanca"],
  2: ["Córdoba Capital", "Villa Carlos Paz", "Río Cuarto"],
  3: ["Rosario", "Santa Fe", "Rafaela"],
};

const STEPS = [
  { id: 1, title: "Datos de la empresa", icon: Building2 },
  { id: 2, title: "Descripción y sector", icon: FileText },
  { id: 3, title: "Persona de contacto", icon: User },
  { id: 4, title: "Logo (opcional)", icon: ImageIcon },
  { id: 5, title: "Credenciales", icon: Mail },
];

export default function RegistrationForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    razon_social: "",
    cuit: "",
    email_empresa: "",
    province: "",
    localidad: "",
    description: "",
    sector: "",
    nombre_contacto: "",
    apellido_contacto: "",
    telefono_contacto: "",
    email: "",
    password: "",
    password2: "",
    logo: null,
  });

  const handleSubmit = () => {
    console.log("Form submitted:", formData);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, logo: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const isStepComplete = () => {
    switch (currentStep) {
      case 1:
        return (
          formData.razon_social.trim() !== "" &&
          formData.cuit.trim() !== "" &&
          formData.email_empresa.trim() !== "" &&
          formData.province &&
          formData.localidad
        );
      case 2:
        return formData.description.trim() !== "" && formData.sector !== "";
      case 3:
        return (
          formData.nombre_contacto.trim() !== "" &&
          formData.apellido_contacto.trim() !== "" &&
          formData.telefono_contacto.trim() !== "" &&
          formData.email.trim() !== ""
        );
      case 4:
        return true;
      case 5:
        return (
          formData.password.trim() !== "" &&
          formData.password2.trim() !== "" &&
          formData.password === formData.password2
        );
      default:
        return false;
    }
  };

  const getNextStepInfo = () => {
    switch (currentStep) {
      case 1:
        return "A continuación: descripción de tu empresa y sector";
      case 2:
        return "A continuación: datos de la persona de contacto";
      case 3:
        return "A continuación: cargar el logo de tu empresa (opcional)";
      case 4:
        return "A continuación: configurá tu contraseña";
      case 5:
        return "Tu inscripción será enviada para revisión";
      default:
        return "";
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

  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-primary text-primary-foreground border-b">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Button
            variant="ghost"
            className="mb-6 text-white hover:bg-white/10"
            onClick={() => {
              navigate(-1);
            }}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <aside className="lg:col-span-1 space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="h-5 w-5 text-primary" />
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Ronda de Negocios 2025
                </span>
              </div>
              <h1 className="text-3xl font-bold mb-2">Inscripción</h1>
              <p className="text-sm text-muted-foreground">
                Completá los pasos para registrar tu empresa
              </p>
            </div>

            {/* Stepper desktop */}
            <div className="hidden lg:block">
              <Card className="border-secondary/20">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    {STEPS.map((step) => {
                      const Icon = step.icon;
                      const isCompleted = step.id < currentStep;
                      const isCurrent = step.id === currentStep;
                      return (
                        <div
                          key={step.id}
                          className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${
                            isCurrent ? "bg-primary/10" : ""
                          }`}
                        >
                          <div
                            className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                              isCompleted
                                ? "bg-secondary text-secondary-foreground"
                                : isCurrent
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {isCompleted ? (
                              <CheckCircle2 className="h-4 w-4" />
                            ) : (
                              <Icon className="h-4 w-4" />
                            )}
                          </div>
                          <span
                            className={`text-sm font-medium ${
                              isCurrent
                                ? "text-foreground"
                                : "text-muted-foreground"
                            }`}
                          >
                            {step.title}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Stepper mobile */}
            {/* Stepper mobile estilo Origin UI */}
            <div className="lg:hidden flex items-center justify-between gap-2 px-2">
              {STEPS.map((step, index) => {
                const isCompleted = step.id < currentStep;
                const isCurrent = step.id === currentStep;
                return (
                  <React.Fragment key={step.id}>
                    <div className="flex flex-col items-center flex-1">
                      <div
                        className={`w-7 h-7 flex items-center justify-center rounded-full border-2 font-semibold text-sm transition-colors
                        ${
                          isCompleted
                            ? "bg-secondary border-secondary text-secondary-foreground"
                            : ""
                        }
                        ${
                          isCurrent
                            ? "bg-primary border-primary text-primary-foreground"
                            : ""
                        }
                        ${
                          !isCompleted && !isCurrent
                            ? "bg-white border-muted text-muted-foreground"
                            : ""
                        }
                      `}
                      >
                        {step.id}
                      </div>
                    </div>
                    {index < STEPS.length - 1 && (
                      <div className="flex-1 h-0.5 bg-muted/40 mt-[14px]"></div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </aside>

          <div className="lg:col-span-2">
            <Card className="border-secondary/20">
              <CardContent className="p-8">
                {currentStep === 1 && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="bg-primary/10 rounded-lg p-2">
                        <Building2 className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold">
                          Datos de la empresa
                        </h2>
                        <p className="text-sm text-muted-foreground">
                          Información básica de tu organización
                        </p>
                      </div>
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
                        <Label htmlFor="email_empresa">Email empresa *</Label>
                        <Input
                          id="email_empresa"
                          type="email"
                          value={formData.email_empresa}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              email_empresa: e.target.value,
                            })
                          }
                          placeholder="contacto@empresa.com"
                          className="h-11"
                        />
                      </div>

                      {/* Provincia y Localidad en línea */}
                      <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 space-y-2">
                          <Label htmlFor="province">Provincia *</Label>
                          <Select
                            value={formData.province}
                            onValueChange={(value) =>
                              setFormData({
                                ...formData,
                                province: value,
                                localidad: "",
                              })
                            }
                          >
                            <SelectTrigger className="h-11 w-full">
                              <SelectValue placeholder="Seleccioná una provincia" />
                            </SelectTrigger>
                            <SelectContent>
                              {PROVINCES.map((prov) => (
                                <SelectItem key={prov.id} value={prov.id}>
                                  {prov.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="flex-1 space-y-2">
                          <Label htmlFor="localidad">Localidad *</Label>
                          <Select
                            value={formData.localidad}
                            onValueChange={(value) =>
                              setFormData({ ...formData, localidad: value })
                            }
                            disabled={!formData.province}
                          >
                            <SelectTrigger className="h-11 w-full">
                              <SelectValue placeholder="Seleccioná una localidad" />
                            </SelectTrigger>
                            <SelectContent>
                              {(LOCALITIES[formData.province] || []).map(
                                (loc) => (
                                  <SelectItem key={loc} value={loc}>
                                    {loc}
                                  </SelectItem>
                                )
                              )}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="bg-primary/10 rounded-lg p-2">
                        <FileText className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold">
                          Descripción y sector
                        </h2>
                        <p className="text-sm text-muted-foreground">
                          Contanos sobre tu empresa
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="description">
                          Descripción de la empresa *
                        </Label>
                        <Textarea
                          id="description"
                          value={formData.description}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              description: e.target.value,
                            })
                          }
                          placeholder="Contanos brevemente sobre tu empresa, sus servicios y qué te gustaría lograr en la ronda de negocios"
                          rows={5}
                          className="resize-none"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="sector">Sector de la empresa *</Label>
                        <Select
                          value={formData.sector}
                          onValueChange={(value) =>
                            setFormData({ ...formData, sector: value })
                          }
                        >
                          <SelectTrigger className="h-11">
                            <SelectValue placeholder="Seleccioná un sector" />
                          </SelectTrigger>
                          <SelectContent>
                            {SECTORS.map((sector) => (
                              <SelectItem key={sector} value={sector}>
                                {sector}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                )}

                {currentStep === 3 && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="bg-primary/10 rounded-lg p-2">
                        <User className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold">
                          Persona de contacto
                        </h2>
                        <p className="text-sm text-muted-foreground">
                          ¿Con quién nos comunicamos?
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="nombre_contacto">Nombre *</Label>
                        <Input
                          id="nombre_contacto"
                          value={formData.nombre_contacto}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              nombre_contacto: e.target.value,
                            })
                          }
                          placeholder="Ej: María"
                          className="h-11"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="apellido_contacto">Apellido *</Label>
                        <Input
                          id="apellido_contacto"
                          value={formData.apellido_contacto}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              apellido_contacto: e.target.value,
                            })
                          }
                          placeholder="Ej: González"
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
                    </div>
                  </div>
                )}

                {currentStep === 4 && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="bg-primary/10 rounded-lg p-2">
                        <ImageIcon className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold">
                          Logo de la empresa
                        </h2>
                        <p className="text-sm text-muted-foreground">
                          Opcional - Ayuda a identificar tu marca
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <Input
                        id="logo"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById("logo")?.click()}
                        className="w-full h-32 border-2 border-dashed hover:border-primary hover:bg-primary/5"
                      >
                        <div className="flex flex-col items-center gap-2">
                          <ImageIcon className="h-8 w-8 text-muted-foreground" />
                          <span className="text-sm font-medium">
                            {formData.logo ? "Cambiar logo" : "Subir logo"}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            PNG, JPG hasta 5MB
                          </span>
                        </div>
                      </Button>

                      {formData.logo && (
                        <div className="flex justify-center p-4 bg-muted/30 rounded-lg">
                          <img
                            src={formData.logo}
                            alt="Logo preview"
                            className="max-h-32 object-contain"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {currentStep === 5 && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="bg-primary/10 rounded-lg p-2">
                        <Mail className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold">Credenciales</h2>
                        <p className="text-sm text-muted-foreground">
                          Configurá la contraseña de tu cuenta
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="password">Contraseña *</Label>
                        <Input
                          id="password"
                          type="password"
                          value={formData.password}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              password: e.target.value,
                            })
                          }
                          placeholder="********"
                          className="h-11"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="password2">
                          Confirmar contraseña *
                        </Label>
                        <Input
                          id="password2"
                          type="password"
                          value={formData.password2}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              password2: e.target.value,
                            })
                          }
                          placeholder="********"
                          className="h-11"
                        />
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
                        className="flex-1 h-11"
                      >
                        Anterior
                      </Button>
                    )}
                    <Button
                      type="button"
                      onClick={nextStep}
                      disabled={!isStepComplete()}
                      className={`${
                        currentStep === 1 ? "w-full" : "flex-1"
                      } bg-primary hover:bg-primary-strong h-11 font-semibold`}
                    >
                      {currentStep === STEPS.length
                        ? "Registrar empresa"
                        : "Continuar"}
                      {currentStep < STEPS.length && (
                        <ChevronRight className="ml-2 h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <p className="text-center text-xs text-muted-foreground">
                    {getNextStepInfo()}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
