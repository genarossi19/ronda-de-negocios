import { Button } from "../components/ui/button";
import {
  Building2,
  Menu,
  X,
  Calendar,
  MapPin,
  Clock,
  User,
  LogOut,
  Settings,
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "../components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router";

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
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
      ? "bg-[#143E29] text-white"
      : "bg-white/95 backdrop-blur-sm text-gray-900 border-b border-gray-200 shadow-sm";

  const logoTextStyles = theme === "light" ? "text-white" : "text-[#143E29]";
  const logoSubtextStyles =
    theme === "light" ? "text-gray-200" : "text-[#68A243]";
  const linkStyles =
    theme === "light"
      ? "text-gray-100 hover:text-[#F5891F]"
      : "text-gray-700 hover:text-[#68A243]";
  const mobileButtonStyles =
    theme === "light" ? "text-white" : "text-[#143E29]";

  const getUserInitials = () => {
    if (!user?.companyName) return "U";
    return user.companyName
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out ${
        isVisible ? "translate-y-0" : "-translate-y-full"
      } ${navStyles}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="bg-[#68A243] p-2.5 rounded-lg transition-transform group-hover:scale-105">
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
                className={`text-base font-semibold transition-colors duration-500 ${linkStyles}`}
              >
                Empresas Participantes
              </Button>
            </Link>

            {isAuthenticated && (
              <>
                <Link to={"/turnos"}>
                  <Button
                    className={`text-base font-semibold transition-colors duration-500 ${linkStyles}`}
                  >
                    Mis Turnos
                  </Button>
                </Link>
                <Link to={"/reuniones"}>
                  <Button
                    className={`text-base font-semibold transition-colors duration-500 ${linkStyles}`}
                  >
                    Historial
                  </Button>
                </Link>
              </>
            )}

            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center gap-2 hover:bg-[#68A243]/10"
                  >
                    <Avatar className="h-9 w-9 bg-[#68A243] border-2 border-[#68A243]/20">
                      <AvatarFallback className="bg-[#68A243] text-white font-semibold text-sm">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <span
                      className={`font-semibold ${
                        theme === "light" ? "text-white" : "text-[#143E29]"
                      }`}
                    >
                      {user?.companyName}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{user?.companyName}</p>
                      <p className="text-xs text-muted-foreground">
                        {user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => (window.location.href = "#profile")}
                  >
                    <User className="mr-2 h-4 w-4" />
                    <span>Mi Perfil</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => (window.location.href = "#settings")}
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Configuración</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Cerrar sesión</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link to={"/login"}>
                  <Button
                    variant="ghost"
                    className={`font-semibold transition-colors duration-500 ${linkStyles}`}
                  >
                    Iniciar sesión
                  </Button>
                </Link>
                <Link to={"/register"}>
                  <Button className="bg-[#F5891F] hover:bg-[#F5891F]/90 text-white font-bold text-base px-8 py-6 transition-all">
                    Inscribirse Ahora
                  </Button>
                </Link>
              </>
            )}
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
                className="w-full sm:w-96 p-0 bg-[#143E29] border-l-2 border-[#68A243]"
              >
                <div className="flex flex-col h-full">
                  <div className="flex justify-between items-center p-6 border-b border-[#143E29]/80">
                    <div className="flex items-center gap-3">
                      <div className="bg-[#68A243] p-2 rounded-lg">
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
                      className="text-white hover:bg-[#143E29]/80"
                    >
                      <X className="h-6 w-6" />
                    </Button>
                  </div>

                  {isAuthenticated && (
                    <div className="p-6 bg-[#143E29]/80 border-b border-[#143E29]/60">
                      <div className="flex items-center gap-3 mb-4">
                        <Avatar className="h-12 w-12 bg-[#68A243] border-2 border-[#68A243]/20">
                          <AvatarFallback className="bg-[#68A243] text-white font-semibold">
                            {getUserInitials()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-white font-semibold">
                            {user?.companyName}
                          </p>
                          <p className="text-sm text-gray-300">{user?.email}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="p-6 bg-[#143E29]/80 border-b border-[#143E29]/60">
                    <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wide mb-4">
                      Información del Evento
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3 text-white">
                        <Calendar className="h-5 w-5 text-[#68A243] mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm text-gray-300">Fecha</p>
                          <p className="font-semibold">21 de Octubre, 2025</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 text-white">
                        <MapPin className="h-5 w-5 text-[#68A243] mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm text-gray-300">Ubicación</p>
                          <p className="font-semibold">
                            Polo Científico Tecnológico
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 text-white">
                        <Clock className="h-5 w-5 text-[#68A243] mt-0.5 flex-shrink-0" />
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
                      <Link to={"/"}>
                        <button
                          onClick={() => {
                            setIsOpen(false);
                          }}
                          className="w-full text-left px-4 py-3 text-white font-semibold text-lg hover:bg-[#143E29]/80 rounded-lg transition-colors"
                        >
                          Inicio
                        </button>
                      </Link>
                      <Link to={"/companies"}>
                        <button
                          onClick={() => {
                            setIsOpen(false);
                          }}
                          className="w-full text-left px-4 py-3 text-white font-semibold text-lg hover:bg-[#143E29]/80 rounded-lg transition-colors"
                        >
                          Empresas Participantes
                        </button>
                      </Link>

                      {isAuthenticated && (
                        <>
                          <Link to={"/turnos"}>
                            <button
                              onClick={() => {
                                setIsOpen(false);
                              }}
                              className="w-full text-left px-4 py-3 text-white font-semibold text-lg hover:bg-[#143E29]/80 rounded-lg transition-colors"
                            >
                              Mis Turnos
                            </button>
                          </Link>
                          <Link to={"/reuniones"}>
                            <button
                              onClick={() => {
                                setIsOpen(false);
                              }}
                              className="w-full text-left px-4 py-3 text-white font-semibold text-lg hover:bg-[#143E29]/80 rounded-lg transition-colors"
                            >
                              Historial de Reuniones
                            </button>
                          </Link>
                          <Link to={"/perfil"}>
                            <button
                              onClick={() => {
                                setIsOpen(false);
                              }}
                              className="w-full text-left px-4 py-3 text-white font-semibold text-lg hover:bg-[#143E29]/80 rounded-lg transition-colors"
                            >
                              Mi Perfil
                            </button>
                          </Link>
                          <Link to={"/configuracion"}>
                            <button
                              onClick={() => {
                                setIsOpen(false);
                              }}
                              className="w-full text-left px-4 py-3 text-white font-semibold text-lg hover:bg-[#143E29]/80 rounded-lg transition-colors"
                            >
                              Configuración
                            </button>
                          </Link>
                          <Link to={"/representantes"}>
                            <button
                              onClick={() => {
                                setIsOpen(false);
                              }}
                              className="w-full text-left px-4 py-3 text-white font-semibold text-lg hover:bg-[#143E29]/80 rounded-lg transition-colors"
                            >
                              Representantes
                            </button>
                          </Link>
                          {/* </CHANGE> */}
                        </>
                      )}
                    </div>
                  </div>

                  <div className="p-6 border-t border-[#143E29]/60">
                    {isAuthenticated ? (
                      <Button
                        onClick={() => {
                          logout();
                          setIsOpen(false);
                        }}
                        variant="outline"
                        className="w-full border-red-500 text-red-500 hover:bg-red-500 hover:text-white font-bold text-lg py-6"
                      >
                        <LogOut className="mr-2 h-5 w-5" />
                        Cerrar sesión
                      </Button>
                    ) : (
                      <div className="space-y-3">
                        <Link to={"/login"}>
                          <Button
                            onClick={() => {
                              setIsOpen(false);
                            }}
                            variant="outline"
                            className="w-full border-white text-white hover:bg-white hover:text-[#143E29] font-bold text-lg py-6"
                          >
                            Iniciar sesión
                          </Button>
                        </Link>
                        <Link to={"/register"}>
                          <Button
                            onClick={() => {
                              setIsOpen(false);
                            }}
                            className="w-full bg-[#F5891F] hover:bg-[#F5891F]/90 text-white font-bold text-lg py-6"
                          >
                            Inscribirse Ahora
                          </Button>
                        </Link>
                      </div>
                    )}
                    {!isAuthenticated && (
                      <p className="text-center text-gray-300 text-sm mt-3">
                        Asegurá tu lugar en el evento
                      </p>
                    )}
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
