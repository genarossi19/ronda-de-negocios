import type React from "react";

import { useState } from "react";
import { useNavigate } from "react-router";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
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
import { useCompanies } from "../context/CompanyContext";
import {
  ArrowLeft,
  Upload,
  CheckCircle2,
  Calendar,
  MapPin,
} from "lucide-react";

const SECTORS = [
  "Tecnología",
  "Agropecuario",
  "Construcción",
  "Servicios Financieros",
  "Comercio",
  "Industria",
  "Salud",
  "Educación",
  "Turismo",
  "Transporte",
  "Otro",
];

export default function Register() {
  const { addCompany } = useCompanies();
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    email: "",
    contactName: "",
    phone: "",
    sector: "",
    province: "",
    logo: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addCompany(formData);
    setSubmitted(true);
    setTimeout(() => {
      try {
        window.history.pushState({}, "", "/companies");
        // trigger a popstate so our router may react if necessary
        window.dispatchEvent(new PopStateEvent("popstate"));
      } catch {
        window.location.href = "/#/companies";
      }
    }, 2000);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, logo: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <CheckCircle2 className="h-20 w-20 text-primary mx-auto mb-6" />
          <h2 className="text-3xl font-bold mb-4">¡Inscripción exitosa!</h2>
          <p className="text-lg text-muted-foreground mb-6">
            Tu empresa ha sido registrada correctamente
          </p>
          <p className="text-muted-foreground">Redirigiendo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar variant="solid" />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <Button variant="ghost" onClick={() => navigate("/")} className="mb-8">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver al inicio
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Info panel */}
          <aside className="lg:col-span-4 muted-panel p-8 space-y-6">
            <h2 className="text-2xl font-semibold">Inscribite ahora</h2>
            <p className="text-muted-foreground">
              Participá en la Ronda de Negocios Trenque Lauquen. Completa los
              datos y asegurá tu lugar. Nuestro equipo revisará la inscripción y
              te contactará.
            </p>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-primary" />
                <div>
                  <div className="text-sm text-muted-foreground">Fecha</div>
                  <div className="font-medium">25 de noviembre, 2025</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-primary" />
                <div>
                  <div className="text-sm text-muted-foreground">Lugar</div>
                  <div className="font-medium">
                    Centro Cultural Trenque Lauquen
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t">
              <h3 className="text-sm font-semibold text-muted-foreground">
                Contacto
              </h3>
              <p className="text-sm">eventos@rondadenegocios.tl</p>
            </div>
          </aside>

          {/* Form column */}
          <main className="lg:col-span-8">
            <div className="mb-8">
              <h1 className="text-4xl sm:text-5xl font-bold mb-2">
                Inscribir mi empresa
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Completá el formulario para participar en la Ronda de Negocios
                Trenque Lauquen
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-6 form-card p-8 rounded-2xl border">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre de la empresa *</Label>
                  <Input
                    id="name"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Ej: TechSolutions SA"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">
                    Descripción de la empresa *
                  </Label>
                  <Textarea
                    id="description"
                    required
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Contanos brevemente sobre tu empresa y sus servicios"
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="contactName">Nombre del contacto *</Label>
                    <Input
                      id="contactName"
                      required
                      value={formData.contactName}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          contactName: e.target.value,
                        })
                      }
                      placeholder="Ej: María González"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      placeholder="contacto@empresa.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Teléfono *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      placeholder="+54 11 1234-5678"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="province">Provincia *</Label>
                    <Input
                      id="province"
                      required
                      value={formData.province}
                      onChange={(e) =>
                        setFormData({ ...formData, province: e.target.value })
                      }
                      placeholder="Ej: Buenos Aires"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sector">Sector de la empresa *</Label>
                  <Select
                    required
                    value={formData.sector}
                    onValueChange={(value) =>
                      setFormData({ ...formData, sector: value })
                    }
                  >
                    <SelectTrigger>
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

                <div className="space-y-2">
                  <Label htmlFor="logo">Logo de la empresa</Label>
                  <div className="flex items-center gap-4">
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
                      className="w-full"
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      {formData.logo ? "Cambiar logo" : "Subir logo"}
                    </Button>
                  </div>
                  {formData.logo && (
                    <div className="mt-4">
                      <img
                        src={formData.logo || "/placeholder.svg"}
                        alt="Logo preview"
                        className="h-24 w-24 object-contain rounded-lg border"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <Button
                  type="submit"
                  size="lg"
                  className="w-full text-lg py-6 accent-btn"
                >
                  Completar inscripción
                </Button>
              </div>
            </form>
          </main>
        </div>
      </div>

      <Footer variant="solid" />
    </div>
  );
}
