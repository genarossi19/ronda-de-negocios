"use client";

import { Button } from "../components/ui/button";
import { Building2, Menu, X, Calendar, MapPin, Clock } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "../components/ui/sheet";
import { useState, useEffect, useRef } from "react";
import { Link } from "react-router";

type NavbarVariant = "default" | "solid";

interface NavbarProps {
  variant?: NavbarVariant | boolean;
}

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const lastScrollY = useRef(0);

  useEffect(() => {
    const sections = document.querySelectorAll("[data-navbar-theme]");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const sectionTheme = entry.target.getAttribute(
              "data-navbar-theme"
            ) as "light" | "dark";
            setTheme(sectionTheme);
          }
        });
      },
      {
        threshold: 0.3,
        rootMargin: "-80px 0px 0px 0px",
      }
    );

    sections.forEach((section) => observer.observe(section));

    return () => {
      sections.forEach((section) => observer.unobserve(section));
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (Math.abs(currentScrollY - lastScrollY.current) < 10) {
        return;
      }

      if (currentScrollY < lastScrollY.current || currentScrollY < 100) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
        setIsVisible(false);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navStyles =
    theme === "light"
      ? "bg-primary/80 text-white"
      : "bg-white/95 backdrop-blur-sm text-gray-900 border-b border-gray-200 shadow-sm";

  const logoTextStyles = theme === "light" ? "text-white" : "text-primary";
  const logoSubtextStyles =
    theme === "light" ? "text-gray-200" : "text-secondary";
  const linkStyles =
    theme === "light"
      ? "text-gray-100 hover:text-white"
      : "text-gray-700 hover:text-white";
  const mobileButtonStyles = theme === "light" ? "text-white" : "text-primary";

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out ${
        isVisible ? "translate-y-0" : "-translate-y-full"
      } ${navStyles}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="bg-secondary p-2.5 rounded-lg transition-transform group-hover:scale-105">
              <Building2 className="h-7 w-7 text-white" />
            </div>
            <div className="flex flex-col">
              <span
                className={`font-bold text-xl leading-tight transition-colors duration-500 ${logoTextStyles}`}
              >
                Ronda de Negocios
              </span>
              <span
                className={`text-sm font-medium transition-colors duration-500 ${logoSubtextStyles}`}
              >
                Trenque Lauquen 2025
              </span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link to={"/companies"}>
              <Button
                size={"lg"}
                variant={"ghost"}
                className={`text-base font-semibold transition-colors duration-500 ${linkStyles}`}
              >
                Empresas Participantes
              </Button>
            </Link>

            <Link to={"/register"}>
              <Button
                className="bg-secondary hover:bg-secondary/90 text-white font-bold text-base  transition-all"
                size={"lg"}
              >
                Inscribirse ahora
              </Button>
            </Link>
          </div>

          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`transition-colors duration-500 ${mobileButtonStyles}`}
                >
                  <Menu className="h-7 w-7" />
                </Button>
              </SheetTrigger>

              <SheetContent
                side="right"
                className="w-full sm:w-96 p-0 bg-primary border-l-2 border-secondary"
              >
                <div className="flex flex-col h-full">
                  <div className="flex justify-between items-center p-6 border-b border-primary/80">
                    <div className="flex items-center gap-3">
                      <div className="bg-secondary p-2 rounded-lg">
                        <Building2 className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-white">
                          Ronda de Negocios
                        </h2>
                        <p className="text-sm text-gray-300">
                          Trenque Lauquen 2025
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsOpen(false)}
                      className="text-white hover:bg-primary/80"
                    >
                      <X className="h-6 w-6" />
                    </Button>
                  </div>

                  <div className="p-6 bg-primary/80 border-b border-primary/60">
                    <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wide mb-4">
                      Información del Evento
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3 text-white">
                        <Calendar className="h-5 w-5 text-secondary mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm text-gray-300">Fecha</p>
                          <p className="font-semibold">21 de Octubre, 2025</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 text-white">
                        <MapPin className="h-5 w-5 text-secondary mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm text-gray-300">Ubicación</p>
                          <p className="font-semibold">
                            Polo Científico Tecnológico
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 text-white">
                        <Clock className="h-5 w-5 text-secondary mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm text-gray-300">Horario</p>
                          <p className="font-semibold">9:00 AM - 6:00 PM</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 p-6">
                    <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wide mb-4">
                      Navegación
                    </h3>
                    <div className="space-y-2">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          window.location.href = "#landing";
                          setIsOpen(false);
                        }}
                        className="w-full text-left px-4 py-3 text-white font-semibold text-lg hover:bg-primary/80 rounded-lg transition-colors"
                      >
                        Inicio
                      </button>

                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          window.location.href = "#companies";
                          setIsOpen(false);
                        }}
                        className="w-full text-left px-4 py-3 text-white font-semibold text-lg hover:bg-primary/80 rounded-lg transition-colors"
                      >
                        Empresas Participantes
                      </button>
                    </div>
                  </div>

                  <div className="p-6 border-t border-primary/60">
                    <Button
                      onClick={(e) => {
                        e.preventDefault();
                        window.location.href = "#register";
                        setIsOpen(false);
                      }}
                      className="w-full bg-secondary hover:bg-secondary/90 text-white font-bold text-lg py-6"
                    >
                      Inscribirse Ahora
                    </Button>
                    <p className="text-center text-gray-300 text-sm mt-3">
                      Asegurá tu lugar en el evento
                    </p>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
