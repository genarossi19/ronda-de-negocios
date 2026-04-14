import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../components/ui/dialog";
import { Badge } from "../components/ui/badge";
import type { CompanyResponse as Company } from "../types/Empresa";
import { Building2, MapPin, FileText } from "lucide-react";

interface PublicCompanyModalProps {
  company: Company | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function PublicCompanyModal({
  company,
  open,
  onOpenChange,
}: PublicCompanyModalProps) {
  if (!company) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex flex-col items-center text-center space-y-4 pb-4">
            <div className="h-28 w-28 rounded-xl overflow-hidden flex items-center justify-center">
              <img
                src={company.logo || "/placeholder.svg"}
                alt={company.razon_social}
                className="h-full w-full object-cover object-center rounded-xl"
              />
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold text-[#143E29] mb-2">
                {company.razon_social}
              </DialogTitle>
              <DialogDescription className="text-base">
                Información pública de la empresa
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
            <div className="flex items-center gap-2 text-[#143E29]">
              <FileText className="h-4 w-4 text-[#68A243]" />
              <h3 className="font-semibold">Descripción</h3>
            </div>
            <p className="text-muted-foreground leading-relaxed pl-6">
              {company.descripcion}
            </p>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[#143E29]">
              <MapPin className="h-4 w-4 text-[#68A243]" />
              <h3 className="font-semibold">Ubicación</h3>
            </div>
            <div className="pl-6 space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  Provincia:
                </span>
                <span className="text-sm font-medium">
                  {company.localidad.provincia.nombre}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  Localidad:
                </span>
                <span className="text-sm font-medium">
                  {company.localidad.nombre}
                </span>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="pt-4 border-t">
            <p className="text-sm text-center text-muted-foreground">
              Para ver información de contacto completa, por favor{" "}
              <button
                onClick={() => {
                  onOpenChange(false);
                  window.location.href = "#login";
                }}
                className="text-[#68A243] hover:text-[#143E29] font-medium underline"
              >
                inicia sesión
              </button>
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
