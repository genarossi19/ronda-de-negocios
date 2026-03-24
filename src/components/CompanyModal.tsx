import { useState } from "react";
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
import { Building2, MapPin, FileText, Mail, Phone } from "lucide-react";

interface CompanyModalProps {
  company: EmpresaResponse | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isAuthenticated: boolean;
}

export default function CompanyModal({
  company,
  open,
  onOpenChange,
  isAuthenticated,
}: CompanyModalProps) {
  if (!company) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto dark:bg-[#143E29] dark:border-[#68A243]/20 transition-colors">
        <DialogHeader>
          <div className="flex flex-col items-center text-center space-y-4 pb-4">
            <img
              src={company.logo || "/placeholder.svg"}
              alt={company.razon_social}
              className="h-24 w-24 object-contain"
            />
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
          <div className="flex justify-center">
            <Badge className="bg-[#68A243] hover:bg-[#68A243]/90 text-white">
              <Building2 className="h-3 w-3 mr-1" />
              {company.sector.nombre}
            </Badge>
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
          {isAuthenticated && (
            <>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-[#143E29] dark:text-white transition-colors">
                  <Mail className="h-4 w-4 text-[#68A243]" />
                  <h3 className="font-semibold">Información de contacto</h3>
                </div>
                <div className="pl-6 space-y-3">
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 dark:bg-[#0f2f25] transition-colors">
                    <Mail className="h-4 w-4 text-[#68A243] mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground dark:text-gray-400 mb-1 transition-colors">
                        Email
                      </p>
                      <a
                        href={`mailto:${company.email}`}
                        className="text-sm text-[#68A243] hover:text-[#143E29] dark:hover:text-[#68A243]/70 font-medium break-all transition-colors"
                      >
                        {company.email || "Sin email"}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 dark:bg-[#0f2f25] transition-colors">
                    <Phone className="h-4 w-4 text-[#68A243] mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground dark:text-gray-400 mb-1 transition-colors">
                        Teléfono
                      </p>
                      <a
                        href={`tel:${company.phone}`}
                        className="text-sm text-[#68A243] hover:text-[#143E29] dark:hover:text-[#68A243]/70 font-medium transition-colors"
                      >
                        {company.phone || "Sin teléfono"}
                      </a>
                    </div>
                  </div>

                  {company.contactName && (
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 dark:bg-[#0f2f25] transition-colors">
                      <Building2 className="h-4 w-4 text-[#68A243] mt-0.5" />
                      <div className="flex-1">
                        <p className="text-xs text-muted-foreground dark:text-gray-400 mb-1 transition-colors">
                          Contacto
                        </p>
                        <p className="text-sm font-medium dark:text-gray-200 transition-colors">
                          {company.contactName}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t dark:border-[#68A243]/20 transition-colors">
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
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
