"use client";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
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
} from "lucide-react";

import { TextAnimate } from "../components/ui/text-animate";
import { useNavigate } from "react-router";

export default function Landing() {
  const navigate = useNavigate();
  const handleRegisterClick = () => navigate("/register");
  const handleViewCompanies = () => navigate("/companies");

  return (
    <div className="min-h-screen">
      <Navbar variant="default" />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent text-sm font-medium mb-8">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse"></span>
            Inscripciones abiertas
          </div>
        </div>
        {/* Date & Location */}
        <div className="flex justify-center gap-6 mb-6">
          <div className="inline-flex items-center gap-3 bg-muted/10 px-4 py-3 rounded-lg">
            <Calendar className="h-6 w-6 text-primary" />
            <div className="text-left">
              <div className="text-sm text-muted-foreground">Fecha</div>
              <div className="font-semibold">21 de octubre, 2025</div>
            </div>
          </div>

          <div className="inline-flex items-center gap-3 bg-muted/10 px-4 py-3 rounded-lg">
            <MapPin className="h-6 w-6 text-primary" />
            <div className="text-left">
              <div className="text-sm text-muted-foreground">Lugar</div>
              <div className="font-semibold">
                Polo Cientifico Tecnologico{" "}
                <span className="text-muted-foreground">Hernandez 816</span>
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <TextAnimate
              animation="blurInUp"
              by="character"
              once
              as={"h1"}
              className="text-5xl sm:text-6xl lg:text-7xl font-bold text-foreground mb-6 text-balance"
            >
              Ronda de Negocios
              {/* <span className="">Trenque Lauquen</span> */}
            </TextAnimate>
            <TextAnimate
              animation="blurInUp"
              by="character"
              once
              as={"h1"}
              className="text-5xl sm:text-6xl lg:text-7xl font-bold  mb-6 text-balance block text-primary mt-2"
            >
              Trenque Lauquen
            </TextAnimate>

            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-12 text-pretty leading-relaxed">
              Conectá con empresas líderes, expandí tu red de contactos y
              descubrí nuevas oportunidades de negocio en el evento empresarial
              más importante de la región.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                size="lg"
                onClick={handleRegisterClick}
                className="text-lg px-8 py-6 group"
              >
                Inscribir mi empresa
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={handleViewCompanies}
                className="text-lg px-8 py-6 bg-transparent"
              >
                Ver empresas inscriptas
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Companies Carousel */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Empresas Participantes
            </h2>
            <p className="text-lg text-muted-foreground">
              Más de 50 empresas ya confirmaron su participación
            </p>
          </div>
          <Carousel />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 text-primary mb-4">
                <Building2 className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Empresas Líderes</h3>
              <p className="text-muted-foreground leading-relaxed">
                Conectá con las empresas más importantes de la región
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 text-primary mb-4">
                <Users className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Networking</h3>
              <p className="text-muted-foreground leading-relaxed">
                Expandí tu red de contactos profesionales
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 text-primary mb-4">
                <Handshake className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Oportunidades</h3>
              <p className="text-muted-foreground leading-relaxed">
                Descubrí nuevas alianzas estratégicas
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 text-primary mb-4">
                <TrendingUp className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Crecimiento</h3>
              <p className="text-muted-foreground leading-relaxed">
                Impulsá el desarrollo de tu negocio
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-primary text-primary-foreground">
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
            variant="secondary"
            onClick={handleRegisterClick}
            className="text-lg px-8 py-6 group"
          >
            Inscribir mi empresa ahora
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
