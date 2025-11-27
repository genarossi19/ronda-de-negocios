import Navbar from "../components/Navbar";
import Footer from "../layout/Footer";

import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Building2,
  User,
  FileText,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import type { CompanyResponse } from "../types/Company";
import { useEffect, useState } from "react";
import { getCompanyById } from "../api/CompaniesService";

import { useNavigate, useParams } from "react-router";
import { Skeleton } from "../components/ui/skeleton";
export default function CompanyDetail() {
  const initialCompany = {
    id: 0,
    razon_social: "",
    cuit: "",
    descripcion: "",
    localidad: {
      id: 0,
      provincia: {
        id: 0,
        nombre: "",
      },
      nombre: "",
    },

    logo: "",
    sector: {
      id: 0,
      nombre: "",
    },
  };

  const { id } = useParams<{ id: string }>();
  const [company, setCompany] = useState<CompanyResponse>(initialCompany);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchCompany = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getCompanyById(Number(id));
        setCompany(data);
      } catch (err) {
        setError("No se pudo obtener la empresa");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCompany();
  }, [id]);

  const navigate = useNavigate();

  if (error)
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 pt-20">
          <Button
            variant="ghost"
            className="mb-6 text-white hover:bg-white/10"
            onClick={() => {
              navigate(-1);
            }}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a empresas
          </Button>
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-50 mb-4">
              <AlertCircle className="h-10 w-10 text-red-500" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-[#143E29]">
              Lo sentimos
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              {error}
            </p>
            <Button
              onClick={() => window.location.reload()}
              className="bg-[#68A243] hover:bg-[#143E29] text-white"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Intentar nuevamente
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="pt-20 bg-gradient-to-br from-[#143E29] to-[#1a5236]"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center space-y-4">
                    <Skeleton className="h-28 w-28 rounded-xl mx-auto" />
                    <Skeleton className="h-8 w-3/4 mx-auto" />
                    <Skeleton className="h-6 w-1/2 mx-auto" />
                  </div>
                  <div className="mt-6 pt-6 border-t space-y-3">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                  </div>
                  <Skeleton className="h-12 w-full mt-6" />
                </CardContent>
              </Card>
            </div>
            <div className="lg:col-span-2 space-y-4">
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-48" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-56" />
                </CardHeader>
                <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!company) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 pt-20">
          <Button
            variant="ghost"
            className="mb-6 text-white hover:bg-white/10"
            onClick={() => {
              navigate(-1);
            }}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a empresas
          </Button>
          <div className="text-center py-20">
            <Building2 className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
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

      <div className=" pt-12">
        <div className="max-w-7xl mx-auto   px-4 sm:px-6 lg:px-8 mt-12">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="hover:bg-gray-100  hover:text-primary text-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Sidebar - Company Overview */}
          <div className="lg:col-span-1 space-y-4">
            <Card className="border-2 border-[#68A243]/20 animate-fade-in-up">
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <div className="inline-block p-4 bg-gradient-to-br from-[#143E29] to-[#1a5236] rounded-xl">
                    <img
                      src={company.logo || "/placeholder.svg"}
                      alt={company.razon_social}
                      className="h-20 w-20 object-contain"
                    />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-[#143E29] mb-2 text-balance">
                      {company.razon_social}
                    </h1>
                    <Badge className="bg-[#68A243] hover:bg-[#68A243]/90 text-white">
                      <Building2 className="h-3 w-3 mr-1" />
                      {company.sector.nombre}
                    </Badge>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <div className="p-2 rounded-lg bg-[#68A243]/10">
                      <MapPin className="h-4 w-4 text-[#68A243]" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Provincia</p>
                      <p className="font-medium text-foreground">
                        {company.localidad.provincia.nombre}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-sm">
                    <div className="p-2 rounded-lg bg-[#68A243]/10">
                      <User className="h-4 w-4 text-[#68A243]" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Contacto</p>
                      <p className="font-medium text-foreground">
                        {company.contactName || "Sin contacto"}
                      </p>
                    </div>
                  </div>
                </div>

                <Button
                  className="w-full mt-6 bg-primary hover:bg-[#F5891F]/90 text-white"
                  onClick={() =>
                    (window.location.href = `mailto:${company.email}`)
                  }
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Contactar
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right Main Content - Details */}
          <div className="lg:col-span-2 space-y-4">
            <Card
              className="border-2 hover:border-[#68A243]/30 transition-colors animate-fade-in-up"
              style={{ animationDelay: "0.1s" }}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[#143E29]">
                  <FileText className="h-5 w-5 text-[#68A243]" />
                  Sobre la empresa
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {company.descripcion || "Sin descripción"}
                </p>
              </CardContent>
            </Card>

            <Card
              className="border-2 hover:border-[#68A243]/30 transition-colors animate-fade-in-up"
              style={{ animationDelay: "0.2s" }}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[#143E29]">
                  <Mail className="h-5 w-5 text-[#68A243]" />
                  Información de contacto
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-[#68A243]/5 transition-colors">
                  <div className="p-2 rounded-lg bg-[#68A243]/10">
                    <Mail className="h-4 w-4 text-[#68A243]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground mb-1">Email</p>
                    <a
                      href={`mailto:${company.email}`}
                      className="text-sm text-[#68A243] hover:text-[#143E29] font-medium break-all transition-colors"
                    >
                      {company.email || "Sin email"}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-[#68A243]/5 transition-colors">
                  <div className="p-2 rounded-lg bg-[#68A243]/10">
                    <Phone className="h-4 w-4 text-[#68A243]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground mb-1">
                      Teléfono
                    </p>
                    <a
                      href={`tel:${company.phone}`}
                      className="text-sm text-[#68A243] hover:text-[#143E29] font-medium transition-colors"
                    >
                      {company.phone || "Sin teléfono"}
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
