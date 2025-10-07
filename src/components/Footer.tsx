import { Building2, Mail, MapPin } from "lucide-react";
import { Link } from "react-router";

type FooterVariant = "default" | "solid" | "alt";

interface FooterProps {
  variant?: FooterVariant;
}

export default function Footer({ variant = "default" }: FooterProps) {
  const rootClass =
    variant === "solid"
      ? "footer-solid border-t"
      : variant === "alt"
      ? "footer-alt border-t"
      : "bg-muted/30 border-t";

  return (
    <footer className={rootClass}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 font-semibold text-lg mb-4">
              <Building2
                className={
                  variant === "default"
                    ? "h-6 w-6 text-primary"
                    : "h-6 w-6 text-white"
                }
              />
              <span>Ronda de Negocios</span>
            </div>
            <p
              className={
                variant === "default"
                  ? "text-muted-foreground leading-relaxed"
                  : "leading-relaxed text-white/90"
              }
            >
              El evento empresarial más importante de Trenque Lauquen
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Enlaces</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/"
                  className={
                    variant === "default"
                      ? "text-muted-foreground hover:text-primary transition-colors"
                      : "text-white/95 hover:opacity-90 transition-opacity"
                  }
                >
                  Inicio
                </Link>
              </li>
              <li>
                <Link
                  to="/companies"
                  className={
                    variant === "default"
                      ? "text-muted-foreground hover:text-primary transition-colors"
                      : "text-white/95 hover:opacity-90 transition-opacity"
                  }
                >
                  Empresas
                </Link>
              </li>
              <li>
                <Link
                  to="/register"
                  className={
                    variant === "default"
                      ? "text-muted-foreground hover:text-primary transition-colors"
                      : "text-white/95 hover:opacity-90 transition-opacity"
                  }
                >
                  Inscribirse
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Contacto</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-muted-foreground">
                <MapPin className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <span>Trenque Lauquen, Buenos Aires</span>
              </li>
              <li className="flex items-start gap-2 text-muted-foreground">
                <Mail className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <a
                  href="mailto:info@rondanegocios.com"
                  className="hover:text-primary transition-colors"
                >
                  info@rondanegocios.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>
            © 2025 Ronda de Negocios Trenque Lauquen. Todos los derechos
            reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
