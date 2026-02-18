import { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../layout/Footer";
import Carousel from "../components/Carousel";
import { Button } from "../components/ui/button";
import {
  ArrowRight,
  Building2,
  Users,
  Handshake,
  TrendingUp,
  Calendar,
  MapPin,
  Clock,
} from "lucide-react";

import { TextAnimate } from "../components/ui/text-animate";
import { Link, useNavigate } from "react-router";
export default function Landing() {
  const navigate = useNavigate();
  const [companyCount, setCompanyCount] = useState(0);

  const handleViewCompanies = () => {
    navigate("/companies");
  };

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section
        data-navbar-theme="light"
        className="relative flex flex-col justify-center items-center min-h-screen bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/portada.jpg')",
        }}
      >
        {/* Overlay para oscurecer fondo y mejorar legibilidad */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/80  to-black/70" />

        {/* Contenido: agregamos padding-top = altura navbar */}
        <div className="relative z-10 w-full pt-[80px] pb-20 px-4 sm:px-6 lg:px-8">
          {/* Aviso superior */}
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/20 text-accent border border-accent/30 text-sm font-medium mb-8">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse"></span>
              Inscripciones abiertas
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-6 mb-6">
            <div className="inline-flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/5 hover:backdrop-blur-sm hover:border hover:border-white/10 transition-all duration-150 ease-in-out">
              <Calendar className="h-6 w-6 text-secondary" />
              <div className="text-left text-white">
                <div className="text-sm text-gray-300">Fecha</div>
                <div className="font-semibold flex flex-col">
                  Martes 21 de Octubre
                  <span className="text-gray-300">2025</span>
                </div>
              </div>
            </div>

            <div className="inline-flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/5 hover:backdrop-blur-sm hover:border hover:border-white/10 transition-all duration-150 ease-in-out">
              <MapPin className="h-6 w-6 text-secondary" />
              <div className="text-left text-white">
                <div className="text-sm text-gray-300">Lugar</div>
                <div className="font-semibold flex flex-col">
                  Polo Científico Tecnológico
                  <span className="text-gray-300">Hernández 816</span>
                </div>
              </div>
            </div>

            <div className="inline-flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/5 hover:backdrop-blur-sm hover:border hover:border-white/10 transition-all duration-150 ease-in-out">
              <Clock className="h-6 w-6 text-secondary" />
              <div className="text-left text-white">
                <div className="text-sm text-gray-300">Hora</div>
                <div className="font-semibold flex flex-col">
                  8:00 hs
                  <span className="text-gray-300">Inicio formal 8:20 hs</span>
                </div>
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto text-center">
            <TextAnimate
              animation="blurInUp"
              by="character"
              once
              as="h1"
              className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 text-balance"
            >
              Ronda de Negocios
            </TextAnimate>

            <TextAnimate
              animation="blurInUp"
              by="character"
              once
              as="h1"
              className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 text-balance block text-white mt-2"
            >
              Trenque Lauquen
            </TextAnimate>

            <p className="text-xl text-white/90 max-w-3xl mx-auto mb-12 leading-relaxed">
              Conectá con empresas líderes, expandí tu red de contactos y
              descubrí nuevas oportunidades de negocio en el evento empresarial
              más importante de la región.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/register" rel="noopener noreferrer">
                <Button
                  size="lg"
                  className="bg-secondary hover:bg-secondary/90 text-white text-lg px-8 py-6 group"
                >
                  Inscribir mi empresa
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>

              <Button
                size="lg"
                variant="outline"
                onClick={handleViewCompanies}
                className="text-lg px-8 py-6 bg-transparent text-white border-white/30 hover:bg-accent hover:border-accent hover:text-white transition-colors duration-200 ease-in-out"
              >
                Ver empresas inscriptas
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Companies Carousel */}
      <section data-navbar-theme="dark" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Empresas Participantes
            </h2>
            <p className="text-lg text-muted-foreground">
              {companyCount > 0
                ? `${companyCount} empresa${companyCount !== 1 ? "s" : ""} ya confirm${companyCount !== 1 ? "aron" : "ó"} su participación`
                : "Cargando empresas..."}
            </p>
          </div>
          <Carousel onCompaniesLoaded={setCompanyCount} />
        </div>
      </section>

      {/* Features Section */}
      <section
        data-navbar-theme="dark"
        className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30"
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-secondary/10 text-secondary mb-4">
                <Building2 className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-primary">
                Empresas Líderes
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Conectá con las empresas más importantes de la región
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-secondary/10 text-secondary mb-4">
                <Users className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-primary">
                Networking
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Expandí tu red de contactos profesionales
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-secondary/10 text-secondary mb-4">
                <Handshake className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-primary">
                Oportunidades
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Descubrí nuevas alianzas estratégicas
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-secondary/10 text-secondary mb-4">
                <TrendingUp className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-primary">
                Crecimiento
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Impulsá el desarrollo de tu negocio
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section
        data-navbar-theme="light"
        className="py-20 px-4 sm:px-6 lg:px-8 bg-primary text-primary-foreground"
      >
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-balance">
            ¿Listo para hacer crecer tu negocio?
          </h2>
          <p className="text-xl mb-8 text-primary-foreground/90 text-pretty leading-relaxed">
            No te pierdas la oportunidad de conectar con las empresas más
            importantes de la región. Inscribite ahora y asegurá tu lugar.
          </p>
          <Button
            size="lg"
            className="bg-secondary hover:bg-accent text-white text-lg px-8 py-6 group"
          >
            <Link to="/register">Inscribir mi empresa ahora</Link>

            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
