import { Button } from "../components/ui/button";
import { Building2, Menu, X, LogOut, Settings } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "../components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "../hooks/useAuth";
import { useCurrentUser } from "../hooks/useCurrentUser";
import { Link, useNavigate } from "react-router";

export default function Navbar() {
  const { user, isAuthenticated } = useCurrentUser();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const lastScrollY = useRef(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    const sections = document.querySelectorAll("[data-navbar-theme]");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const sectionTheme = entry.target.getAttribute(
              "data-navbar-theme",
            ) as "light" | "dark";
            setTheme(sectionTheme);
          }
        });
      },
      {
        threshold: 0.3,
        rootMargin: "-80px 0px 0px 0px",
      },
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

  const isDarkTheme = theme === "light";

  const navClasses = isDarkTheme
    ? "bg-gradient-to-r from-[#143E29] via-[#1a5032] to-[#143E29] shadow-lg shadow-black/10"
    : "bg-white border-b border-gray-100 shadow-sm";

  const getUserInitials = () => {
    if (!user?.razon_social) return "U";
    return user.razon_social
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const isAdmin = user?.is_superuser || false;

  const renderNavLinks = () => {
    if (isAdmin) {
      return (
        <>
          <Link
            to="/panel-administrador"
            className="px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 hover:bg-white/10 backdrop-blur-sm"
            style={{ color: isDarkTheme ? "white" : "#143E29" }}
          >
            Panel Admin
          </Link>
          <Link
            to="/empresas"
            className="px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 hover:bg-white/10 backdrop-blur-sm"
            style={{ color: isDarkTheme ? "white" : "#143E29" }}
          >
            Empresas
          </Link>
          <Link
            to="/turnos"
            className="px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 hover:bg-white/10 backdrop-blur-sm"
            style={{ color: isDarkTheme ? "white" : "#143E29" }}
          >
            Turnos
          </Link>
          <Link
            to="/historial"
            className="px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 hover:bg-white/10 backdrop-blur-sm"
            style={{ color: isDarkTheme ? "white" : "#143E29" }}
          >
            Historial
          </Link>
        </>
      );
    }

    if (isAuthenticated) {
      return (
        <>
          <Link
            to="/empresas"
            className="px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 hover:bg-white/10 backdrop-blur-sm"
            style={{ color: isDarkTheme ? "white" : "#143E29" }}
          >
            Empresas
          </Link>
          <Link
            to="/turnos"
            className="px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 hover:bg-white/10 backdrop-blur-sm"
            style={{ color: isDarkTheme ? "white" : "#143E29" }}
          >
            Turnos
          </Link>
          <Link
            to="/historial"
            className="px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 hover:bg-white/10 backdrop-blur-sm"
            style={{ color: isDarkTheme ? "white" : "#143E29" }}
          >
            Historial
          </Link>
        </>
      );
    }

    return (
      <Link
        to="/empresas"
        className="px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 hover:bg-white/10 backdrop-blur-sm"
        style={{ color: isDarkTheme ? "white" : "#143E29" }}
      >
        Empresas Participantes
      </Link>
    );
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out backdrop-blur-md border-b ${
        isVisible ? "translate-y-0" : "-translate-y-full"
      } ${navClasses} ${isDarkTheme ? "border-[#1a5032]" : "border-gray-100"}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group flex-shrink-0">
            <div
              className={`p-2 rounded-xl transition-all duration-300 group-hover:scale-110 ${
                isDarkTheme
                  ? "bg-[#68A243] shadow-lg shadow-[#68A243]/30"
                  : "bg-gradient-to-br from-[#68A243] to-[#5a9139]"
              }`}
            >
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <div className="flex flex-col leading-tight">
              <span
                className={`font-bold text-base transition-colors duration-300 ${
                  isDarkTheme ? "text-white" : "text-[#143E29]"
                }`}
              >
                Ronda de Negocios
              </span>
              <span
                className={`text-xs font-medium transition-colors duration-300 ${
                  isDarkTheme ? "text-[#68A243]" : "text-[#68A243]/70"
                }`}
              >
                Trenque Lauquen {new Date().getFullYear()}
              </span>
            </div>
          </Link>

          {/* Centro - Navigation Links (Desktop) */}
          <div className="hidden lg:flex items-center gap-1">
            {renderNavLinks()}
          </div>

          {/* Derecha - User Section */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <DropdownMenu
                open={isDropdownOpen}
                onOpenChange={setIsDropdownOpen}
              >
                <DropdownMenuTrigger asChild>
                  <button
                    className={`flex items-center gap-2.5 px-3 py-1.5 rounded-lg transition-all duration-300 cursor-pointer ${
                      isDarkTheme ? "hover:bg-white/10" : "hover:bg-gray-100"
                    }`}
                  >
                    <Avatar
                      className={`h-8 w-8 border-2 ${
                        isDarkTheme
                          ? "border-[#68A243] bg-[#68A243]/20"
                          : "border-[#68A243]/30 bg-[#68A243]/10"
                      }`}
                    >
                      <AvatarFallback
                        className={`font-semibold text-sm ${
                          isDarkTheme
                            ? "bg-[#68A243] text-white"
                            : "bg-[#68A243]/80 text-white"
                        }`}
                      >
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <span
                      className={`hidden sm:inline text-sm font-semibold max-w-[120px] truncate transition-colors duration-300 ${
                        isDarkTheme ? "text-white" : "text-[#143E29]"
                      }`}
                    >
                      {user?.razon_social}
                    </span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-semibold text-gray-900">
                      {user?.razon_social}
                    </p>
                    <p className="text-xs text-gray-500">
                      Empresa ID: {user?.empresa_id}
                    </p>
                  </div>
                  <DropdownMenuSeparator />
                  <Link to="/perfil">
                    <DropdownMenuItem className="cursor-pointer">
                      <span className="text-sm">Mi Perfil</span>
                    </DropdownMenuItem>
                  </Link>
                  <Link to="/configuracion">
                    <DropdownMenuItem className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      <span className="text-sm">Configuración</span>
                    </DropdownMenuItem>
                  </Link>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => {
                      logout();
                      navigate("/");
                    }}
                    className="text-red-600 cursor-pointer"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span className="text-sm">Cerrar sesión</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`hidden sm:inline-flex text-sm font-medium transition-colors duration-300 ${
                      isDarkTheme
                        ? "text-white hover:bg-white/10"
                        : "text-[#143E29] hover:bg-gray-100"
                    }`}
                  >
                    Iniciar sesión
                  </Button>
                </Link>
                <Link to="/register">
                  <Button
                    size="sm"
                    className="bg-[#68A243] hover:bg-[#5a9139] text-white font-semibold text-sm shadow-lg shadow-[#68A243]/30 transition-all duration-300 hover:shadow-[#68A243]/40"
                  >
                    Inscribirse
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <div className="lg:hidden">
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`transition-colors duration-300 ${
                      isDarkTheme
                        ? "text-white hover:bg-white/10"
                        : "text-[#143E29] hover:bg-gray-100"
                    }`}
                  >
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-64 p-0 bg-white">
                  <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gradient-to-r from-[#143E29] to-[#1a5032]">
                      <div className="flex items-center gap-2">
                        <div className="bg-[#68A243] p-1.5 rounded-lg">
                          <Building2 className="h-5 w-5 text-white" />
                        </div>
                        <span className="font-bold text-white text-sm">
                          Ronda de Negocios
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsOpen(false)}
                        className="text-white hover:bg-white/10"
                      >
                        <X className="h-5 w-5" />
                      </Button>
                    </div>

                    {/* User Info (if authenticated) */}
                    {isAuthenticated && (
                      <div className="p-4 border-b border-gray-100 bg-gray-50">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10 bg-[#68A243] border-2 border-[#68A243]/20">
                            <AvatarFallback className="bg-[#68A243] text-white font-semibold text-sm">
                              {getUserInitials()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">
                              {user?.razon_social}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              ID: {user?.empresa_id}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Menu Items */}
                    <div className="flex-1 p-4 space-y-1 overflow-y-auto">
                      {isAdmin && (
                        <>
                          <Link to="/panel-administrador">
                            <button
                              onClick={() => setIsOpen(false)}
                              className="w-full text-left px-4 py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                            >
                              Panel Admin
                            </button>
                          </Link>
                        </>
                      )}

                      {!isAdmin && (
                        <Link to="/empresas">
                          <button
                            onClick={() => setIsOpen(false)}
                            className="w-full text-left px-4 py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                          >
                            Empresas
                          </button>
                        </Link>
                      )}

                      {isAdmin && (
                        <>
                          <Link to="/empresas">
                            <button
                              onClick={() => setIsOpen(false)}
                              className="w-full text-left px-4 py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                            >
                              Empresas
                            </button>
                          </Link>
                        </>
                      )}

                      {isAuthenticated && (
                        <>
                          <Link to="/turnos">
                            <button
                              onClick={() => setIsOpen(false)}
                              className="w-full text-left px-4 py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                            >
                              {isAdmin ? "Turnos" : "Mis Turnos"}
                            </button>
                          </Link>
                          <Link to="/historial">
                            <button
                              onClick={() => setIsOpen(false)}
                              className="w-full text-left px-4 py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                            >
                              Historial
                            </button>
                          </Link>
                          <Link to="/perfil">
                            <button
                              onClick={() => setIsOpen(false)}
                              className="w-full text-left px-4 py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                            >
                              Mi Perfil
                            </button>
                          </Link>
                          <Link to="/configuracion">
                            <button
                              onClick={() => setIsOpen(false)}
                              className="w-full text-left px-4 py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                            >
                              Configuración
                            </button>
                          </Link>
                        </>
                      )}
                    </div>

                    {/* Footer */}
                    <div className="p-4 border-t border-gray-100 bg-gray-50 space-y-2">
                      {isAuthenticated ? (
                        <Button
                          onClick={() => {
                            logout();
                            setIsOpen(false);
                            navigate("/");
                          }}
                          className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold text-sm"
                        >
                          <LogOut className="mr-2 h-4 w-4" />
                          Cerrar sesión
                        </Button>
                      ) : (
                        <>
                          <Link to="/login" className="block">
                            <Button
                              onClick={() => setIsOpen(false)}
                              variant="outline"
                              className="w-full text-gray-900 border-gray-300 font-semibold text-sm"
                            >
                              Iniciar sesión
                            </Button>
                          </Link>
                          <Link to="/register" className="block">
                            <Button
                              onClick={() => setIsOpen(false)}
                              className="w-full bg-[#68A243] hover:bg-[#5a9139] text-white font-semibold text-sm"
                            >
                              Inscribirse
                            </Button>
                          </Link>
                        </>
                      )}
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
