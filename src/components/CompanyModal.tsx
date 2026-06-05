import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../components/ui/dialog";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import type { EmpresaResponse } from "../types/Empresa";
import {
  Building2,
  FileText,
  Mail,
  Phone,
  Contact,
  MapPin,
  Users,
} from "lucide-react";
import { useUserStore } from "../store/userStore";

interface CompanyModalProps {
  company: EmpresaResponse | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isAuthenticated: boolean;
  isAdmin?: boolean;
  onBookMesa: (company: EmpresaResponse) => void;
}

const DESCRIPTION_MAX_LENGTH = 250;

export default function CompanyModal({
  company,
  open,
  onOpenChange,
  isAuthenticated,
  isAdmin = false,
  onBookMesa,
}: CompanyModalProps) {
  const [imageError, setImageError] = useState(false);
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  const { user } = useUserStore();

  useEffect(() => {
    setDescriptionExpanded(false);
  }, [company?.id, open]);

  const canBookMesa = Boolean(
    isAuthenticated &&
    user?.aprobada &&
    user.empresa_id &&
    company?.id !== user.empresa_id,
  );

  const bookingInfoMessage = !isAuthenticated
    ? "Iniciá sesión para anotarte en una mesa."
    : !user?.aprobada
      ? "Tu empresa debe estar aprobada para inscribirse."
      : user?.empresa_id === company?.id
        ? "No podés anotarte en tu propia empresa."
        : null;

  const companyInitials = useMemo(() => {
    if (!company) return "";

    return company.razon_social
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0]?.toUpperCase() ?? "")
      .join("");
  }, [company]);

  if (!company) return null;

  const companyDescription = company.descripcion?.trim() ?? "";
  const isDescriptionLong = companyDescription.length > DESCRIPTION_MAX_LENGTH;
  const displayedDescription =
    isDescriptionLong && !descriptionExpanded
      ? `${companyDescription.slice(0, DESCRIPTION_MAX_LENGTH).trim()}...`
      : companyDescription;

  const emailConfirmado =
    company.email_confirmado ?? company.email_confirmardo ?? false;
  const showContactInformation = isAuthenticated || isAdmin;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-[650px] sm:!max-w-[650px] w-[min(95vw,650px)] max-h-[calc(100vh-4rem)] overflow-y-auto bg-white dark:bg-[#0F141A] text-foreground dark:text-white border-[#669649] dark:border-[#1a5032] p-0 flex flex-col">
        {/* Contenido con scroll independiente para no romper el footer */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          <DialogHeader>
            <div className="flex flex-col items-center text-center space-y-3 pb-2 border-b border-gray-100 dark:border-gray-800">
              <div className="h-20 w-20 rounded-xl overflow-hidden flex items-center justify-center relative shadow-sm">
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
                    <span className="text-2xl font-bold tracking-wide">
                      {companyInitials || "?"}
                    </span>
                  </div>
                )}
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-[#143E29] dark:text-white mb-1 transition-colors">
                  {company.razon_social}
                </DialogTitle>
                <DialogDescription className="text-sm dark:text-gray-300 transition-colors">
                  Información de la empresa
                </DialogDescription>
              </div>

              {/* Sector dentro del header para limpiar espacio */}
              <div className="flex justify-center gap-2 flex-wrap pt-1">
                <Badge className="bg-[#68A243] hover:bg-[#68A243]/90 text-white text-xs px-2.5 py-0.5">
                  <Building2 className="h-3 w-3 mr-1" />
                  {company.sector.nombre}
                </Badge>
                {isAdmin && (
                  <Badge
                    className={`text-xs px-2.5 py-0.5 ${
                      emailConfirmado
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400"
                        : "bg-amber-100 text-amber-800 dark:bg-amber-950/30 dark:text-amber-400"
                    }`}
                  >
                    {emailConfirmado ? "Email validado" : "Email sin validar"}
                  </Badge>
                )}
              </div>
            </div>
          </DialogHeader>

          {/* Grilla principal de Información */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
            {/* Description */}
            <div className="space-y-2 sm:col-span-2">
              <div className="flex items-center gap-2 text-[#143E29] dark:text-white transition-colors">
                <FileText className="h-4 w-4 text-[#68A243]" />
                <h3 className="font-semibold text-sm">Descripción</h3>
              </div>
              <div className="pl-6">
                <p className="text-sm text-muted-foreground dark:text-gray-300 leading-relaxed transition-colors">
                  {companyDescription ? (
                    <>
                      {displayedDescription}
                      {isDescriptionLong && (
                        <button
                          type="button"
                          className="ml-1 inline text-xs font-medium text-[#68A243] hover:text-[#143E29] dark:text-[#d7efc8] transition-colors"
                          onClick={() =>
                            setDescriptionExpanded((prev) => !prev)
                          }
                        >
                          {descriptionExpanded ? "Ver menos" : "Ver más"}
                        </button>
                      )}
                    </>
                  ) : (
                    <span className="italic text-gray-400 dark:text-gray-500">
                      Sin descripción disponible
                    </span>
                  )}
                </p>
              </div>
            </div>

            {/* Location */}
            <div className="space-y-2 sm:col-span-2">
              <div className="flex items-center gap-2 text-[#143E29] dark:text-white transition-colors">
                <MapPin className="h-4 w-4 text-[#68A243]" />
                <h3 className="font-semibold text-sm">Ubicación</h3>
              </div>
              <div className="pl-6 grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground dark:text-gray-400">
                    Provincia
                  </span>
                  <span className="text-sm font-medium dark:text-gray-200">
                    {company.localidad.provincia.nombre}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground dark:text-gray-400">
                    Localidad
                  </span>
                  <span className="text-sm font-medium dark:text-gray-200">
                    {company.localidad.nombre}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          {showContactInformation && (
            <div className="space-y-3 pt-2 border-t border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2 text-[#143E29] dark:text-white transition-colors">
                <Contact className="h-4 w-4 text-[#68A243]" />
                <h3 className="font-semibold text-sm">
                  Información de contacto
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-6">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/50">
                  <Mail className="h-4 w-4 text-[#68A243] mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] uppercase tracking-wider text-muted-foreground dark:text-gray-400 mb-0.5">
                      Email
                    </p>
                    {company.email ? (
                      <a
                        href={`mailto:${company.email}`}
                        className="text-sm text-[#68A243] hover:text-[#143E29] dark:hover:text-[#68A243]/70 font-medium break-all block"
                      >
                        {company.email}
                      </a>
                    ) : (
                      <p className="text-sm font-medium text-gray-400">
                        Sin especificar
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/50">
                  <Phone className="h-4 w-4 text-[#68A243] mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] uppercase tracking-wider text-muted-foreground dark:text-gray-400 mb-0.5">
                      Teléfono
                    </p>
                    {company.telefono_contacto ? (
                      <a
                        href={`tel:${company.telefono_contacto}`}
                        className="text-sm text-[#68A243] hover:text-[#143E29] dark:hover:text-[#68A243]/70 font-medium block"
                      >
                        {company.telefono_contacto}
                      </a>
                    ) : (
                      <p className="text-sm font-medium text-gray-400">
                        Sin especificar
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="p-4 bg-slate-50 dark:bg-slate-900/60 border-t border-gray-100 dark:border-gray-800 shrink-0">
          <div className="flex flex-col sm:flex-row gap-2 w-full justify-end items-center">
            {bookingInfoMessage && (
              <p className="text-xs text-muted-foreground dark:text-gray-400 sm:mr-auto text-center sm:text-left mb-2 sm:mb-0">
                {bookingInfoMessage}
              </p>
            )}
            <div className="flex gap-2 w-full sm:w-auto">
              {company.email && (
                <a
                  href={`mailto:${company.email}`}
                  className="inline-flex w-full sm:w-auto items-center justify-center rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/50"
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Enviar email
                </a>
              )}
              {canBookMesa && (
                <Button
                  className="w-full sm:w-auto bg-[#68A243] hover:bg-[#578937] text-white transition-colors"
                  onClick={() => onBookMesa(company)}
                >
                  <Users className="mr-2 h-4 w-4" />
                  Anotarse
                </Button>
              )}
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
