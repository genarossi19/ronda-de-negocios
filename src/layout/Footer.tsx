import { Building2, Mail, MapPin } from "lucide-react";
import { Link } from "react-router";

export default function Footer() {
  return (
    <footer className="relative bg-primary text-white border-t border-primary/80">
      {/* Contenido principal */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Sección 1 - Descripción */}
          <div>
            <div className="flex items-center gap-2 font-semibold text-lg mb-4">
              <Building2 className="h-6 w-6 text-secondary" />
              <span>Ronda de Negocios</span>
            </div>
            <p className="text-gray-300 leading-relaxed text-sm">
              El evento empresarial más importante de Trenque Lauquen
            </p>
          </div>

          {/* Sección 2 - Enlaces */}
          <div>
            <h3 className="font-semibold mb-4">Enlaces</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  to="/"
                  className="text-gray-300 hover:text-accent transition-colors"
                >
                  Inicio
                </Link>
              </li>
              <li>
                <Link
                  to="/companies"
                  className="text-gray-300 hover:text-accent transition-colors"
                >
                  Empresas
                </Link>
              </li>
              <li>
                <Link
                  to="/register"
                  className="text-gray-300 hover:text-accent transition-colors"
                >
                  Inscribirse
                </Link>
              </li>
            </ul>
          </div>

          {/* Sección 3 - Contacto */}
          <div>
            <h3 className="font-semibold mb-4">Contacto</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2 text-gray-300">
                <MapPin className="h-5 w-5 text-secondary mt-0.5 flex-shrink-0" />
                <span>Trenque Lauquen, Buenos Aires</span>
              </li>
              <li className="flex items-start gap-2 text-gray-300">
                <Mail className="h-5 w-5 text-secondary mt-0.5 flex-shrink-0" />
                <a
                  href="mailto:info@rondanegocios.com"
                  className="hover:text-accent transition-colors"
                >
                  info@rondanegocios.com
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Franja inferior de logos e info institucional */}
      <div className="relative bg-gradient-to-r from-primary/95 via-primary/90 to-primary/95 border-t border-primary/60">
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col lg:flex-row items-center justify-evenly gap-6">
            {/* Izquierda - Logos */}
            <div className="flex items-center gap-4 lg:gap-6">
              <div className="flex items-center gap-3">
                <img
                  src="/polo_logo.png"
                  alt="Polo Científico Tecnológico"
                  width={200}
                  height={60}
                  className="h-10 w-auto opacity-90 hover:opacity-100 transition-opacity duration-300 filter brightness-0 invert"
                />
                <div className="w-px h-8 bg-white/20 hidden sm:block"></div>
                <div className="flex flex-col text-xs text-gray-300/80 tracking-wide">
                  <span>Municipio de Trenque Lauquen</span>
                  <span className="text-gray-400/60">
                    Subsecretaria de Producción
                  </span>
                </div>
              </div>
            </div>

            {/* Centro - Información general */}
            <div className="flex flex-col lg:flex-row items-center gap-2 text-center lg:text-left">
              <p className="text-sm text-gray-100 font-medium">
                Ronda de Negocios
              </p>
              <span className="hidden sm:inline text-gray-400/60">•</span>
              <p className="text-xs text-gray-300/80">
                {new Date().getFullYear()}
              </p>
              <span className="hidden sm:inline text-gray-400/60">•</span>
              <p className="text-xs text-gray-300/80">
                oficinaempleotrenque@gmail.com
              </p>
            </div>

            {/* Derecha - Sello o frase */}
            <div className="flex items-center">
              <div className="bg-white/10 backdrop-blur-sm rounded-full px-3 py-1 border border-white/20">
                <p className="text-xs font-semibold text-gray-100 tracking-wider">
                  Oficina de Empleo
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Líneas decorativas */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-white/30 via-white/40 to-white/30 opacity-40"></div>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-white/20 via-white/30 to-white/20 opacity-30"></div>
      </div>
    </footer>
  );
}
