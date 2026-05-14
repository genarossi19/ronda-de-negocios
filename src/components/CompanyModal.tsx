import { useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../components/ui/dialog";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import type { EmpresaResponse } from "../types/Empresa";
import {
  Building2,
  MapPin,
  FileText,
  Mail,
  Phone,
  Contact,
} from "lucide-react";

interface CompanyModalProps {
  company: EmpresaResponse | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isAuthenticated: boolean;
  isAdmin?: boolean;
}

export default function CompanyModal({
  company,
  open,
  onOpenChange,
  isAuthenticated,
  isAdmin = false,
}: CompanyModalProps) {
  if (!company) return null;

  const [imageError, setImageError] = useState(false);

  const companyInitials = useMemo(() => {
    return company.razon_social
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0]?.toUpperCase() ?? "")
      .join("");
  }, [company.razon_social]);

  const emailConfirmado =
    company.email_confirmado ?? company.email_confirmardo ?? false;
  const showContactInformation = isAuthenticated || isAdmin;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto transition-colors bg-white dark:bg-[#0F141A] text-foreground dark:text-white border-[#669649] dark:border-[#1a5032]">
        <DialogHeader>
          <div className="flex flex-col items-center text-center space-y-4 pb-4">
            <div className="h-24 w-24 rounded-xl overflow-hidden flex items-center justify-center relative">
              {company.logo && !imageError ? (
                <img
                  src={company.logo}
                  alt={company.razon_social}
                  onError={() => setImageError(true)}
                  className="absolute inset-0 w-full h-full object-cover object-center rounded-xl"
                />
              ) : (
                <div
                  aria-label={company.razon_social}
                  className="absolute inset-0 flex items-center justify-center bg-[#68A243]/20 dark:bg-[#68A243]/35 text-[#143E29] dark:text-[#d7efc8]"
                >
                  <span className="text-3xl font-bold tracking-wide">
                    {companyInitials || "?"}
                  </span>
                </div>
              )}
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold text-[#143E29] dark:text-white mb-2 transition-colors">
                {company.razon_social}
              </DialogTitle>
              <DialogDescription className="text-base dark:text-gray-300 transition-colors">
                Información de la empresa
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Sector */}
          <div className="flex justify-center gap-2 flex-wrap">
            <Badge className="bg-[#68A243] hover:bg-[#68A243]/90 text-white">
              <Building2 className="h-3 w-3 mr-1" />
              {company.sector.nombre}
            </Badge>
            {isAdmin && (
              <Badge
                className={
                  emailConfirmado
                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400"
                    : "bg-amber-100 text-amber-800 dark:bg-amber-950/30 dark:text-amber-400"
                }
              >
                {emailConfirmado ? "Email validado" : "Email sin validar"}
              </Badge>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[#143E29] dark:text-white transition-colors">
              <FileText className="h-4 w-4 text-[#68A243]" />
              <h3 className="font-semibold">Descripción</h3>
            </div>
            <p className="text-muted-foreground dark:text-gray-300 leading-relaxed pl-6 transition-colors">
              {company.descripcion || "Sin descripción"}
            </p>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[#143E29] dark:text-white transition-colors">
              <MapPin className="h-4 w-4 text-[#68A243]" />
              <h3 className="font-semibold">Ubicación</h3>
            </div>
            <div className="pl-6 space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground dark:text-gray-400 transition-colors">
                  Provincia:
                </span>
                <span className="text-sm font-medium dark:text-gray-200 transition-colors">
                  {company.localidad.provincia.nombre}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground dark:text-gray-400 transition-colors">
                  Localidad:
                </span>
                <span className="text-sm font-medium dark:text-gray-200 transition-colors">
                  {company.localidad.nombre}
                </span>
              </div>
            </div>
          </div>

          {/* Contact Information - Only for authenticated users */}
          {showContactInformation && (
            <>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-[#143E29] dark:text-white transition-colors">
                  <Contact className="h-4 w-4 text-[#68A243]" />
                  <h3 className="font-semibold">Información de contacto</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-6">
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 !dark:bg-[#1a1f2e] transition-colors">
                    <Mail className="h-4 w-4 text-[#68A243] mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground dark:text-gray-400 mb-1 transition-colors">
                        Email
                      </p>
                      {company.email ? (
                        <a
                          href={`mailto:${company.email}`}
                          className="text-sm text-[#68A243] hover:text-[#143E29] dark:hover:text-[#68A243]/70 font-medium break-all transition-colors"
                        >
                          {company.email}
                        </a>
                      ) : (
                        <p className="text-sm font-medium dark:text-gray-200 transition-colors">
                          Sin email
                        </p>
                      )}
                      {isAdmin && (
                        <p className="text-xs text-muted-foreground dark:text-gray-400 mt-1 transition-colors">
                          Estado: {emailConfirmado ? "validado" : "sin validar"}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 !dark:bg-[#1a1f2e] transition-colors">
                    <Phone className="h-4 w-4 text-[#68A243] mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground dark:text-gray-400 mb-1 transition-colors">
                        Teléfono
                      </p>
                      {company.telefono_contacto ? (
                        <a
                          href={`tel:${company.telefono_contacto}`}
                          className="text-sm text-[#68A243] hover:text-[#143E29] dark:hover:text-[#68A243]/70 font-medium transition-colors"
                        >
                          {company.telefono_contacto}
                        </a>
                      ) : (
                        <p className="text-sm font-medium dark:text-gray-200 transition-colors">
                          Sin teléfono
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {company.email && (
                <div className="pt-4 border-t !dark:border-[#68A243]/15 transition-colors">
                  <Button
                    className="w-full bg-[#68A243] hover:bg-[#143E29] dark:hover:bg-[#68A243]/80 text-white transition-colors"
                    onClick={() =>
                      (window.location.href = `mailto:${company.email}`)
                    }
                  >
                    <Mail className="mr-2 h-4 w-4" />
                    Contactar empresa
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
