import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import CompanyCard from "../components/CompanyCard";
import { useCompanies } from "../context/CompanyContext";
import { Button } from "../components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router";

export default function Companies() {
  const { companies } = useCompanies();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <Button variant="ghost" onClick={() => navigate("/")} className="mb-8">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver al inicio
        </Button>

        <div className="mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            Empresas Inscriptas
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Conocé todas las empresas que participarán en la Ronda de Negocios
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {companies.map((company) => (
            <CompanyCard key={company.id} company={company} />
          ))}
        </div>

        {companies.length === 0 && (
          <div className="text-center py-20">
            <p className="text-lg text-muted-foreground">
              Todavía no hay empresas inscriptas
            </p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
