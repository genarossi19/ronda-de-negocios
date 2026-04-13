import { Button } from "../components/ui/button";
import { Building2, Menu, X, LogOut, User2Icon } from "lucide-react";
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
import { ThemeToggle } from "./ThemeToggle";

export default function Navbar() {
  const { user, isAuthenticated } = useCurrentUser();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [globalDarkMode, setGlobalDarkMode] = useState(false);
  const lastScrollY = useRef(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    // Detectar dark mode global
    const checkDarkMode = () => {
      setGlobalDarkMode(document.documentElement.classList.contains("dark"));
    };

    // Inicializar
    checkDarkMode();

    // Observar cambios en la clase 'dark' del html
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, { attributes: true });

    return () => observer.disconnect();
  }, []);

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

  const isDarkTheme = globalDarkMode || theme === "light";

  const navClasses = isDarkTheme
    ? "bg-gradient-to-r from-[#143E29] via-[#1a5032] to-[#143E29] shadow-lg shadow-black/10"
    : "bg-white border-b border-gray-100 shadow-sm";

  const getUserInitials = () => {
    if (user?.is_superuser) return "A";
    if (!user?.razon_social) return "U";
    return user.razon_social
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getUserDisplayName = () => {
    if (user?.is_superuser) return "Admin";
    return user?.razon_social || "Usuario";
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
            <ThemeToggle />
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
                      {getUserDisplayName()}
                    </span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-56 border-[#669649] dark:border-[#1a5032]"
                >
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white transition-colors duration-300">
                      {getUserDisplayName()}
                    </p>
                    {!user?.is_superuser && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 transition-colors duration-300">
                        Empresa ID: {user?.empresa_id}
                      </p>
                    )}
                  </div>
                  <DropdownMenuSeparator className="bg-[#669649]/30 dark:bg-[#1a5032]" />
                  <Link to="/perfil">
                    <DropdownMenuItem className="cursor-pointer transition-colors duration-200">
                      <span className="text-sm">Mi Perfil</span>
                    </DropdownMenuItem>
                  </Link>
                  <Link to="/representantes">
                    <DropdownMenuItem className="cursor-pointer transition-colors duration-200">
                      <User2Icon className="mr-2 h-4 w-4" />
                      <span className="text-sm">Representantes</span>
                    </DropdownMenuItem>
                  </Link>
                  <DropdownMenuSeparator className="bg-[#669649]/30 dark:bg-[#1a5032]" />
                  <DropdownMenuItem
                    onClick={() => {
                      logout();
                      navigate("/");
                    }}
                    className="text-red-600 hover:text-red-600! hover:bg-red-300/10! dark:text-red-400 cursor-pointer dark:hover:bg-red-950/20 dark:focus:bg-red-950/20 dark:focus:text-red-400 transition-colors duration-200"
                  >
                    <LogOut className="mr-2 h-4 w-4 text-red-600 dark:text-red-400 " />
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
                <SheetContent
                  side="right"
                  className={`w-64 p-0 transition-colors duration-300 ${globalDarkMode ? "bg-[#0a1a15]" : "bg-white"}`}
                >
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
                      <div
                        className={`p-4 border-b transition-colors duration-300 ${
                          globalDarkMode
                            ? "border-[#143E29] bg-[#143E29]/20"
                            : "border-gray-100 bg-gray-50"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10 bg-[#68A243] border-2 border-[#68A243]/20">
                            <AvatarFallback className="bg-[#68A243] text-white font-semibold text-sm">
                              {getUserInitials()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p
                              className={`text-sm font-semibold truncate transition-colors duration-300 ${
                                globalDarkMode ? "text-white" : "text-gray-900"
                              }`}
                            >
                              {user?.razon_social}
                            </p>
                            <p
                              className={`text-xs truncate transition-colors duration-300 ${
                                globalDarkMode
                                  ? "text-gray-400"
                                  : "text-gray-500"
                              }`}
                            >
                              ID: {user?.empresa_id}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Menu Items */}
                    <div
                      className={`flex-1 p-4 space-y-1 overflow-y-auto transition-colors duration-300 ${
                        globalDarkMode ? "bg-[#0a1a15]" : "bg-white"
                      }`}
                    >
                      {isAdmin && (
                        <>
                          <Link to="/panel-administrador">
                            <button
                              onClick={() => setIsOpen(false)}
                              className={`w-full text-left px-4 py-2.5 text-sm font-medium rounded-lg transition-colors duration-200 ${
                                globalDarkMode
                                  ? "text-white hover:bg-[#143E29]"
                                  : "text-gray-900 hover:bg-gray-100"
                              }`}
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
                            className={`w-full text-left px-4 py-2.5 text-sm font-medium rounded-lg transition-colors duration-200 ${
                              globalDarkMode
                                ? "text-white hover:bg-[#143E29]"
                                : "text-gray-900 hover:bg-gray-100"
                            }`}
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
                              className={`w-full text-left px-4 py-2.5 text-sm font-medium rounded-lg transition-colors duration-200 ${
                                globalDarkMode
                                  ? "text-white hover:bg-[#143E29]"
                                  : "text-gray-900 hover:bg-gray-100"
                              }`}
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
                              className={`w-full text-left px-4 py-2.5 text-sm font-medium rounded-lg transition-colors duration-200 ${
                                globalDarkMode
                                  ? "text-white hover:bg-[#143E29]"
                                  : "text-gray-900 hover:bg-gray-100"
                              }`}
                            >
                              {isAdmin ? "Turnos" : "Mis Turnos"}
                            </button>
                          </Link>
                          <Link to="/historial">
                            <button
                              onClick={() => setIsOpen(false)}
                              className={`w-full text-left px-4 py-2.5 text-sm font-medium rounded-lg transition-colors duration-200 ${
                                globalDarkMode
                                  ? "text-white hover:bg-[#143E29]"
                                  : "text-gray-900 hover:bg-gray-100"
                              }`}
                            >
                              Historial
                            </button>
                          </Link>
                          <Link to="/perfil">
                            <button
                              onClick={() => setIsOpen(false)}
                              className={`w-full text-left px-4 py-2.5 text-sm font-medium rounded-lg transition-colors duration-200 ${
                                globalDarkMode
                                  ? "text-white hover:bg-[#143E29]"
                                  : "text-gray-900 hover:bg-gray-100"
                              }`}
                            >
                              Mi Perfil
                            </button>
                          </Link>
                          <Link to="/configuracion">
                            <button
                              onClick={() => setIsOpen(false)}
                              className={`w-full text-left px-4 py-2.5 text-sm font-medium rounded-lg transition-colors duration-200 ${
                                globalDarkMode
                                  ? "text-white hover:bg-[#143E29]"
                                  : "text-gray-900 hover:bg-gray-100"
                              }`}
                            >
                              Configuración
                            </button>
                          </Link>
                        </>
                      )}
                    </div>

                    {/* Footer */}
                    <div
                      className={`p-4 border-t space-y-2 transition-colors duration-300 ${
                        globalDarkMode
                          ? "border-[#143E29] bg-[#143E29]/20"
                          : "border-gray-100 bg-gray-50"
                      }`}
                    >
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
                              className={`w-full font-semibold text-sm transition-colors duration-300 ${
                                globalDarkMode
                                  ? "text-white border-[#68A243]/30 hover:bg-[#143E29]"
                                  : "text-gray-900 border-gray-300"
                              }`}
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
