import React, { useState } from "react";
import {
  Building2,
  FileText,
  User,
  Lock,
  Image as ImageIcon,
  ChevronRight,
  CheckCircle2,
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
import { Textarea } from "../components/ui/textarea";
import { Card, CardContent } from "../components/ui/card";

const PROVINCES = [
  { id: 1, name: "Buenos Aires" },
  { id: 2, name: "Córdoba" },
  { id: 3, name: "Santa Fe" },
];

const LOCALITIES = {
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
  { id: 1, title: "Datos de la empresa", icon: Building2 },
  { id: 2, title: "Sector", icon: FileText },
  { id: 3, title: "Contacto", icon: User },
  { id: 4, title: "Seguridad y logo", icon: Lock },
];

export default function RegistrationForm() {
  const [currentStep, setCurrentStep] = useState(1);
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
    password2: "",
    logo: null,
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData({ ...formData, logo: reader.result });
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = () => {
    console.log("Form submitted:", formData);
  };

  const isStepComplete = () => {
    const f = formData;
    switch (currentStep) {
      case 1:
        return (
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
        return (
          f.nombre_contacto &&
          f.apellido_contacto &&
          f.telefono_contacto &&
          f.email
        );
      case 4:
        return f.password && f.password2 && f.password === f.password2;
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1);
    else handleSubmit();
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const getLocalities = () => {
    const province = PROVINCES.find((p) => p.name === formData.provincia)?.id;
    return province ? LOCALITIES[province] || [] : [];
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center py-12 px-4">
      <Card className="w-full max-w-3xl border-secondary/30 shadow-sm">
        <CardContent className="p-8 space-y-8">
          {/* Progreso */}
          <div className="flex justify-between items-center">
            {STEPS.map((step) => {
              const Icon = step.icon;
              const isCompleted = step.id < currentStep;
              const isCurrent = step.id === currentStep;
              return (
                <div key={step.id} className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 flex items-center justify-center rounded-full border-2 transition-colors ${
                      isCompleted
                        ? "bg-secondary text-secondary-foreground border-secondary"
                        : isCurrent
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-muted text-muted-foreground"
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      <Icon className="h-5 w-5" />
                    )}
                  </div>
                  <span
                    className={`text-xs mt-2 ${
                      isCurrent
                        ? "text-primary font-semibold"
                        : "text-muted-foreground"
                    }`}
                  >
                    {step.title}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Contenido del paso */}
          {currentStep === 1 && (
            <div className="space-y-5">
              <h2 className="text-xl font-bold text-primary">
                Datos de la empresa
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Razón social *</Label>
                  <Input
                    value={formData.razon_social}
                    onChange={(e) =>
                      setFormData({ ...formData, razon_social: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>CUIT *</Label>
                  <Input
                    value={formData.cuit}
                    onChange={(e) =>
                      setFormData({ ...formData, cuit: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>Email empresa *</Label>
                  <Input
                    type="email"
                    value={formData.email_empresa}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        email_empresa: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label>Dirección *</Label>
                  <Input
                    value={formData.direccion}
                    onChange={(e) =>
                      setFormData({ ...formData, direccion: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>Provincia *</Label>
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
                    <SelectTrigger>
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
                </div>
                <div>
                  <Label>Localidad *</Label>
                  <Select
                    value={formData.localidad}
                    onValueChange={(v) =>
                      setFormData({ ...formData, localidad: v })
                    }
                    disabled={!formData.provincia}
                  >
                    <SelectTrigger>
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
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-5">
              <h2 className="text-xl font-bold text-primary">Sector</h2>
              <div className="space-y-3">
                <Label>Seleccioná el sector *</Label>
                <Select
                  value={formData.sector}
                  onValueChange={(v) => setFormData({ ...formData, sector: v })}
                >
                  <SelectTrigger>
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
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-5">
              <h2 className="text-xl font-bold text-primary">
                Persona de contacto
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Nombre *</Label>
                  <Input
                    value={formData.nombre_contacto}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        nombre_contacto: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label>Apellido *</Label>
                  <Input
                    value={formData.apellido_contacto}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        apellido_contacto: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label>Teléfono *</Label>
                  <Input
                    value={formData.telefono_contacto}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        telefono_contacto: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label>Email *</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-5">
              <h2 className="text-xl font-bold text-primary">
                Seguridad y logo
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Password *</Label>
                  <Input
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>Repetir Password *</Label>
                  <Input
                    type="password"
                    value={formData.password2}
                    onChange={(e) =>
                      setFormData({ ...formData, password2: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label>Logo de la empresa (opcional)</Label>
                <Input
                  id="logo"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  onClick={() => document.getElementById("logo")?.click()}
                  className="w-full h-32 border-2 border-dashed border-secondary text-secondary hover:bg-secondary/10"
                >
                  <div className="flex flex-col items-center gap-2">
                    <ImageIcon className="h-8 w-8" />
                    <span className="text-sm">
                      {formData.logo ? "Cambiar logo" : "Subir logo"}
                    </span>
                  </div>
                </Button>

                {formData.logo && (
                  <div className="flex justify-center p-4 bg-muted/20 rounded-lg">
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

          {/* Navegación */}
          <div className="flex justify-between pt-4 border-t border-secondary/20">
            {currentStep > 1 && (
              <Button variant="outline" onClick={prevStep}>
                Anterior
              </Button>
            )}
            <Button
              onClick={nextStep}
              disabled={!isStepComplete()}
              className="ml-auto bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {currentStep === 4 ? "Registrar" : "Continuar"}
              {currentStep < 4 && <ChevronRight className="ml-2 h-4 w-4" />}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
