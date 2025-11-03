import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import CompanyCard from "../components/CompanyCard";

import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Skeleton } from "../components/ui/skeleton";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { ArrowLeft, Search, Building2, TrendingUp } from "lucide-react";
import { getCompanies } from "../api/CompaniesService";
import type { CompanyType } from "../types/companies";

function CompanyCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col items-center text-center">
          <Skeleton className="w-24 h-24 rounded-xl mb-4" />
          <Skeleton className="h-6 w-32 mb-2" />
          <Skeleton className="h-8 w-24 rounded-full" />
        </div>
      </CardContent>
    </Card>
  );
}

export default function Companies() {
  const [companies, setCompanies] = useState<CompanyType[]>([]);

  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const data = await getCompanies(); // llama a tu API real
        console.log(data);
        setCompanies(data);
      } catch (err) {
        console.error(err);
        setError("Error al cargar las empresas");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCompanies();
  }, []);

  const filteredCompanies = companies.filter((company) =>
    company.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  if (isLoading) return <p>Cargando...</p>;
  if (error) return <p>{error}</p>;
  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="bg-gradient-to-br from-[#143E29] to-[#1a5236] text-white pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Button
            variant="ghost"
            onClick={() => (window.location.href = "#landing")}
            className="mb-6 text-white hover:bg-white/10"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al inicio
          </Button>

          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-8">
            <div>
              <h1 className="text-4xl sm:text-5xl font-bold mb-3">
                Empresas Inscriptas
              </h1>
              <p className="text-lg text-white/80 leading-relaxed max-w-2xl">
                Conocé todas las empresas que participarán en la Ronda de
                Negocios
              </p>
            </div>

            <div className="flex gap-2">
              <Badge
                variant="secondary"
                className="bg-[#68A243]/90 hover:bg-[#68A243] text-white px-3 py-1 text-sm font-medium"
              >
                <Building2 className="mr-1.5 h-3.5 w-3.5" />
                {companies.length} Empresas
              </Badge>
              <Badge
                variant="outline"
                className="border-white/30 text-white px-3 py-1 text-sm font-medium"
              >
                <TrendingUp className="mr-1.5 h-3.5 w-3.5" />
                Activas
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Buscar empresas por nombre..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 border-[#68A243]/20 focus-visible:border-[#68A243] focus-visible:ring-[#68A243]/20"
            />
          </div>
          {searchQuery && (
            <p className="text-sm text-muted-foreground mt-2">
              {filteredCompanies.length} resultado
              {filteredCompanies.length !== 1 ? "s" : ""} encontrado
              {filteredCompanies.length !== 1 ? "s" : ""}
            </p>
          )}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <CompanyCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCompanies.map((company, index) => (
                <div
                  key={company.id}
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <CompanyCard company={company} />
                </div>
              ))}
            </div>

            {filteredCompanies.length === 0 && (
              <div className="text-center py-20">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#68A243]/10 mb-4">
                  <Building2 className="h-10 w-10 text-[#68A243]" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-[#143E29]">
                  {searchQuery
                    ? "No se encontraron empresas"
                    : "Todavía no hay empresas inscriptas"}
                </h3>
                <p className="text-muted-foreground">
                  {searchQuery
                    ? "Intenta con otro término de búsqueda"
                    : "Las empresas aparecerán aquí una vez que se registren"}
                </p>
              </div>
            )}
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}
