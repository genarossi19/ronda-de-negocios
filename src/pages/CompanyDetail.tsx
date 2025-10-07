"use client";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useCompanies } from "../context/CompanyContext";
import { Button } from "../components/ui/button";
import { ArrowLeft, Mail, Phone, MapPin, Building2 } from "lucide-react";

import { useParams, useNavigate } from "react-router";

export default function CompanyDetail() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const { getCompany } = useCompanies();
  const company = id ? getCompany(id) : null;

  if (!company) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <Button
            variant="ghost"
            onClick={() => navigate("/companies")}
            className="mb-8"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a empresas
          </Button>
          <div className="text-center py-20">
            <h2 className="text-2xl font-bold mb-4">Empresa no encontrada</h2>
            <p className="text-muted-foreground">
              La empresa que buscás no existe
            </p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <Button
          variant="ghost"
          onClick={() => navigate("/companies")}
          className="mb-8"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver a empresas
        </Button>

        <div className="bg-card rounded-2xl border overflow-hidden">
          <div className="bg-muted/30 p-8 sm:p-12 text-center">
            <img
              src={company.logo || "/placeholder.svg"}
              alt={company.name}
              className="h-32 w-32 object-contain mx-auto mb-6 rounded-xl bg-background p-4"
            />
            <h1 className="text-3xl sm:text-4xl font-bold mb-2">
              {company.name}
            </h1>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <Building2 className="h-4 w-4" />
              {company.sector}
            </div>
          </div>

          <div className="p-8 sm:p-12 space-y-8">
            <div>
              <h2 className="text-xl font-semibold mb-3">Sobre la empresa</h2>
              <p className="text-muted-foreground leading-relaxed text-lg">
                {company.description}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">
                  Información de contacto
                </h3>

                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <a
                      href={`mailto:${company.email}`}
                      className="text-primary hover:underline"
                    >
                      {company.email}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Teléfono</p>
                    <a
                      href={`tel:${company.phone}`}
                      className="text-primary hover:underline"
                    >
                      {company.phone}
                    </a>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Detalles</h3>

                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Provincia</p>
                    <p className="font-medium">{company.province}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Building2 className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Contacto</p>
                    <p className="font-medium">{company.contactName}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t">
              <Button
                size="lg"
                className="w-full sm:w-auto"
                onClick={() =>
                  (window.location.href = `mailto:${company.email}`)
                }
              >
                <Mail className="mr-2 h-4 w-4" />
                Contactar empresa
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
