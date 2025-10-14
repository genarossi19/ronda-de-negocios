"use client";

import { Button } from "../components/ui/button";
import { Building2, Menu, X, Calendar, MapPin, Clock } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "../components/ui/sheet";
import { useState, useEffect, useRef } from "react";
import { Link } from "react-router";

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
      ? "bg-white/90 backdrop-blur-sm text-gray-900 border-b border-gray-200 shadow-sm"
      : "bg-white/95 backdrop-blur-sm text-gray-900 border-b border-gray-200 shadow-sm";

  const logoTextStyles = theme === "light" ? "text-gray-900" : "text-gray-900";
  const logoSubtextStyles =
    theme === "light" ? "text-gray-600" : "text-gray-600";
  const linkStyles =
    theme === "light"
      ? "text-gray-700 hover:text-accent"
      : "text-gray-700 hover:text-accent";
  const mobileButtonStyles = theme === "light" ? "text-white" : "text-gray-900";

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out ${
        isVisible ? "translate-y-0" : "-translate-y-full"
      } ${navStyles}`}
    >
      <div className="h-1 bg-primary" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <a href="#landing" className="flex items-center gap-3 group">
            <div className="bg-primary p-2.5 rounded-lg transition-transform group-hover:scale-105">
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
          </a>

          <div className="hidden md:flex items-center gap-8">
            <Link to={"/companies"}>
              <Button
                variant={"link"}
                className={`text-base font-semibold transition-colors duration-500 ${linkStyles}`}
              >
                Empresas Participantes
              </Button>
            </Link>
            <a href="https://forms.gle/qBi7m8FHxooiSZSMA" target="_blank">
              <Button
                className="bg-primary hover:bg-primary/90 text-white font-bold text-base transition-all"
                size={"lg"}
              >
                Inscribirse Ahora
              </Button>
            </a>
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
                className="w-full sm:w-96 p-0  border-l-2 border-[#68A243]"
              >
                <div className="flex flex-col h-full">
                  <div className="flex justify-between items-center p-6 border-b border-gray-800">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary p-2 rounded-lg">
                        <Building2 className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-black">
                          Ronda de Negocios
                        </h2>
                        <p className="text-sm text-gray-600">
                          Trenque Lauquen 2025
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsOpen(false)}
                      className="text-primary hover:bg-primary"
                    >
                      <X className="h-6 w-6" />
                    </Button>
                  </div>

                  <div className="p-6  border-b border-gray-800">
                    <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wide mb-4">
                      Información del Evento
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3 text-gray-600">
                        <Calendar className="h-5 w-5 text-[#68A243] mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm text-gray-800">Fecha</p>
                          <p className="font-semibold">21 de Octubre, 2025</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 text-gray-800">
                        <MapPin className="h-5 w-5 text-[#68A243] mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm text-gray-800">Ubicación</p>
                          <p className="font-semibold">
                            Polo Científico Tecnológico
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 text-gray-800">
                        <Clock className="h-5 w-5 text-[#68A243] mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm text-gray-800">Horario</p>
                          <p className="font-semibold">9:00 AM - 6:00 PM</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 p-6">
                    <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wide mb-4">
                      Navegación
                    </h3>
                    <div className="space-y-2">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          window.location.href = "#landing";
                          setIsOpen(false);
                        }}
                        className="w-full text-left px-4 py-3 text-primary font-semibold text-lg rounded-lg transition-colors"
                      >
                        Inicio
                      </button>

                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          window.location.href = "#companies";
                          setIsOpen(false);
                        }}
                        className="w-full text-left px-4 py-3 text-primary font-semibold text-lg  rounded-lg transition-colors"
                      >
                        Empresas Participantes
                      </button>
                    </div>
                  </div>

                  <div className="p-6 border-t border-gray-800">
                    <Button
                      onClick={(e) => {
                        e.preventDefault();
                        window.location.href = "#register";
                        setIsOpen(false);
                      }}
                      className="w-full bg-primary hover:bg-primary/90 text-white font-bold text-lg py-6"
                    >
                      Inscribirse Ahora
                    </Button>
                    <p className="text-center text-gray-600 text-sm mt-3">
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
