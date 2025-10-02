import { Building2, Mail, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-muted/30 border-t">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 font-semibold text-lg mb-4">
              <Building2 className="h-6 w-6 text-primary" />
              <span>Ronda de Negocios</span>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              El evento empresarial más importante de Trenque Lauquen
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Enlaces</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="#landing"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Inicio
                </a>
              </li>
              <li>
                <a
                  href="#companies"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Empresas
                </a>
              </li>
              <li>
                <a
                  href="#register"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Inscribirse
                </a>
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
