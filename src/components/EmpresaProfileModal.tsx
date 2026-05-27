import { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Skeleton } from "./ui/skeleton";
import { toast } from "sonner";
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  FileText,
  Pencil,
  Hash,
  Home,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import {
  getCompanies,
  updateCompany,
  type EmpresaUpdatePayload,
} from "../api/EmpresaService";
import { getSectors } from "../api/SectorService";
import { getLocalidades } from "../api/LocalidadesService";
import { getApiErrorMessage, isSessionExpiredError } from "../lib/axios";
import type { EmpresaResponse } from "../types/Empresa";
import type { GenericType } from "../types/GenericType";
import type { LocalidadResponse } from "../types/Localidad";

type EmpresaFormState = {
  razon_social: string;
  descripcion: string;
  telefono_contacto: string;
  direccion: string;
  sector_id: string;
  localidad_id: string;
};

interface EmpresaProfileModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  empresaId: number;
}

function toFormState(empresa: EmpresaResponse): EmpresaFormState {
  return {
    razon_social: empresa.razon_social,
    descripcion: empresa.descripcion ?? "",
    telefono_contacto: empresa.telefono_contacto ?? "",
    direccion: empresa.direccion ?? "",
    sector_id: String(empresa.sector.id),
    localidad_id: String(empresa.localidad.id),
  };
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string;
}) {
  return (
    <div className="rounded-xl border border-[#68A243]/15 bg-[#68A243]/5 dark:bg-[#0f2f25]/70 p-3">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground dark:text-gray-400 mb-1 flex items-center gap-1.5">
        {icon}
        {label}
      </p>
      <p className="text-sm font-medium text-[#143E29] dark:text-white">
        {value || (
          <span className="text-muted-foreground italic">Sin información</span>
        )}
      </p>
    </div>
  );
}

function ViewInfo({ empresa }: { empresa: EmpresaResponse }) {
  return (
    <div className="space-y-4">
      {empresa.descripcion && (
        <div className="rounded-xl border border-[#68A243]/15 bg-[#68A243]/5 dark:bg-[#0f2f25]/70 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground dark:text-gray-400 mb-2 flex items-center gap-1.5">
            <FileText className="h-3.5 w-3.5" />
            Descripción
          </p>
          <p className="text-sm text-[#143E29] dark:text-white leading-relaxed">
            {empresa.descripcion}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <InfoRow
          icon={<Mail className="h-3.5 w-3.5" />}
          label="Email"
          value={empresa.email}
        />
        <InfoRow
          icon={<Hash className="h-3.5 w-3.5" />}
          label="CUIT"
          value={empresa.cuit}
        />
        <InfoRow
          icon={<Phone className="h-3.5 w-3.5" />}
          label="Teléfono"
          value={empresa.telefono_contacto}
        />
        <InfoRow
          icon={<Home className="h-3.5 w-3.5" />}
          label="Dirección"
          value={empresa.direccion}
        />
        <InfoRow
          icon={<MapPin className="h-3.5 w-3.5" />}
          label="Localidad"
          value={empresa.localidad.nombre}
        />
        <InfoRow
          icon={<Building2 className="h-3.5 w-3.5" />}
          label="Sector"
          value={empresa.sector.nombre}
        />
      </div>
    </div>
  );
}

function EditForm({
  formData,
  sectors,
  localidades,
  onChange,
}: {
  formData: EmpresaFormState;
  sectors: GenericType[];
  localidades: LocalidadResponse[];
  onChange: <K extends keyof EmpresaFormState>(
    field: K,
    value: EmpresaFormState[K],
  ) => void;
}) {
  const inputClass =
    "border-[#68A243]/20 focus-visible:border-[#68A243] focus-visible:ring-[#68A243]/20 dark:bg-[#143E29] dark:border-[#68A243]/20 dark:text-white transition-colors";
  const triggerClass =
    "w-full border-[#68A243]/20 focus-visible:border-[#68A243] focus-visible:ring-[#68A243]/20 dark:bg-[#143E29] dark:border-[#68A243]/20 dark:text-white transition-colors";

  return (
    <div className="space-y-4">
      <div className="grid gap-2">
        <Label htmlFor="razon_social" className="dark:text-white">
          Razón social <span className="text-red-500">*</span>
        </Label>
        <Input
          id="razon_social"
          value={formData.razon_social}
          onChange={(e) => onChange("razon_social", e.target.value)}
          className={inputClass}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="descripcion" className="dark:text-white">
          Descripción
        </Label>
        <Textarea
          id="descripcion"
          rows={3}
          value={formData.descripcion}
          onChange={(e) => onChange("descripcion", e.target.value)}
          placeholder="Contá brevemente a qué se dedica tu empresa..."
          className={`resize-none ${inputClass}`}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="telefono_contacto" className="dark:text-white">
            Teléfono de contacto
          </Label>
          <Input
            id="telefono_contacto"
            value={formData.telefono_contacto}
            onChange={(e) => onChange("telefono_contacto", e.target.value)}
            className={inputClass}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="direccion" className="dark:text-white">
            Dirección
          </Label>
          <Input
            id="direccion"
            value={formData.direccion}
            onChange={(e) => onChange("direccion", e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label className="dark:text-white">Sector</Label>
          <Select
            value={formData.sector_id}
            onValueChange={(v) => onChange("sector_id", v)}
          >
            <SelectTrigger className={triggerClass}>
              <SelectValue placeholder="Seleccioná un sector" />
            </SelectTrigger>
            <SelectContent>
              {sectors.map((sector) => (
                <SelectItem key={sector.id} value={String(sector.id)}>
                  {sector.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <Label className="dark:text-white">Localidad</Label>
          <Select
            value={formData.localidad_id}
            onValueChange={(v) => onChange("localidad_id", v)}
          >
            <SelectTrigger className={triggerClass}>
              <SelectValue placeholder="Seleccioná una localidad" />
            </SelectTrigger>
            <SelectContent>
              {localidades.map((loc) => (
                <SelectItem key={loc.id} value={String(loc.id)}>
                  {loc.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="space-y-6 py-2">
      <div className="rounded-2xl border border-[#68A243]/20 p-5">
        <div className="flex items-start gap-4">
          <Skeleton className="h-16 w-16 rounded-xl dark:bg-[#0f2f25]" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-6 w-48 dark:bg-[#0f2f25]" />
            <div className="flex gap-2">
              <Skeleton className="h-5 w-24 rounded-full dark:bg-[#0f2f25]" />
              <Skeleton className="h-5 w-24 rounded-full dark:bg-[#0f2f25]" />
            </div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-16 rounded-xl dark:bg-[#0f2f25]" />
        ))}
      </div>
    </div>
  );
}

export default function EmpresaProfileModal({
  isOpen,
  onOpenChange,
  empresaId,
}: EmpresaProfileModalProps) {
  const [empresa, setEmpresa] = useState<EmpresaResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<EmpresaFormState>({
    razon_social: "",
    descripcion: "",
    telefono_contacto: "",
    direccion: "",
    sector_id: "",
    localidad_id: "",
  });
  const [sectors, setSectors] = useState<GenericType[]>([]);
  const [localidades, setLocalidades] = useState<LocalidadResponse[]>([]);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setIsEditing(false);
      setImageError(false);
      return;
    }

    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [allCompanies, sectorsData, localidadesData] = await Promise.all([
          getCompanies(),
          getSectors(),
          getLocalidades(),
        ]);
        const empresaData: EmpresaResponse | undefined = allCompanies.find(
          (c: EmpresaResponse) => c.id === empresaId,
        );
        if (!empresaData) {
          toast.error("No se encontró la información de la empresa");
          onOpenChange(false);
          return;
        }
        setEmpresa(empresaData);
        setSectors(sectorsData);
        setLocalidades(localidadesData);
        setFormData(toFormState(empresaData));
      } catch (error) {
        if (!isSessionExpiredError(error)) {
          const message = getApiErrorMessage(
            error,
            "No se pudo cargar la información de la empresa",
          );
          if (message) toast.error(message);
        }
        onOpenChange(false);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [isOpen, empresaId]);

  const companyInitials = useMemo(() => {
    if (!empresa) return "";
    return empresa.razon_social
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0]?.toUpperCase() ?? "")
      .join("");
  }, [empresa?.razon_social]);

  const handleFormChange = <K extends keyof EmpresaFormState>(
    field: K,
    value: EmpresaFormState[K],
  ) => {
    setFormData((current) => ({ ...current, [field]: value }));
  };

  const handleCancelEdit = () => {
    if (empresa) {
      setFormData(toFormState(empresa));
    }
    setIsEditing(false);
  };

  const handleSubmit = async () => {
    if (!empresa) return;

    if (!formData.razon_social.trim()) {
      toast.error("La razón social es obligatoria");
      return;
    }

    if (!formData.sector_id || !formData.localidad_id) {
      toast.error("Seleccioná un sector y una localidad");
      return;
    }

    const payload: EmpresaUpdatePayload = {};

    if (formData.razon_social.trim() !== empresa.razon_social)
      payload.razon_social = formData.razon_social.trim();
    if ((formData.descripcion.trim() || undefined) !== empresa.descripcion)
      payload.descripcion = formData.descripcion.trim() || undefined;
    if (
      (formData.telefono_contacto.trim() || undefined) !==
      empresa.telefono_contacto
    )
      payload.telefono_contacto =
        formData.telefono_contacto.trim() || undefined;
    if ((formData.direccion.trim() || undefined) !== empresa.direccion)
      payload.direccion = formData.direccion.trim() || undefined;
    if (Number(formData.sector_id) !== empresa.sector.id)
      payload.sector = Number(formData.sector_id);
    if (Number(formData.localidad_id) !== empresa.localidad.id)
      payload.localidad = Number(formData.localidad_id);

    if (Object.keys(payload).length === 0) {
      toast.info("No hubo cambios para guardar");
      setIsEditing(false);
      return;
    }

    try {
      setIsSaving(true);
      const updated = await updateCompany(empresaId, payload);
      setEmpresa(updated);
      setFormData(toFormState(updated));
      setIsEditing(false);
      toast.success(
        "La información de la empresa fue actualizada correctamente",
      );
    } catch (error) {
      if (!isSessionExpiredError(error)) {
        const message = getApiErrorMessage(
          error,
          "No se pudo actualizar la información de la empresa",
        );
        if (message) toast.error(message);
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        onOpenChange(open);
        if (!open) setIsEditing(false);
      }}
    >
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto border-[#68A243]/20 dark:border-[#68A243]/20 bg-white dark:bg-[#11161d]">
        <DialogHeader>
          <DialogTitle className="text-[#143E29] dark:text-white">
            {isEditing ? "Editar información de la empresa" : "Mi empresa"}
          </DialogTitle>
          <DialogDescription className="dark:text-gray-300">
            {isEditing
              ? "Modificá los datos de tu empresa. Los cambios se guardarán de inmediato."
              : "Información registrada de tu empresa en la plataforma."}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <LoadingState />
        ) : empresa ? (
          <form
            onSubmit={(event) => {
              event.preventDefault();
              if (isEditing) {
                handleSubmit();
              }
            }}
          >
            <div className="space-y-6 py-2">
              {/* Company header card */}
              <div className="rounded-2xl border border-[#68A243]/20 bg-gradient-to-br from-[#68A243]/8 to-white dark:from-[#68A243]/15 dark:to-[#143E29] p-5">
                <div className="flex items-start gap-4">
                  <div className="h-16 w-16 rounded-xl overflow-hidden flex-shrink-0 relative bg-[#68A243]/10 dark:bg-[#68A243]/20">
                    {empresa.logo && !imageError ? (
                      <img
                        src={empresa.logo}
                        alt={empresa.razon_social}
                        onError={() => setImageError(true)}
                        className="absolute inset-0 w-full h-full object-cover rounded-xl"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xl font-bold text-[#143E29] dark:text-[#d7efc8]">
                          {companyInitials || "?"}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg font-semibold text-[#143E29] dark:text-white truncate">
                      {isEditing
                        ? formData.razon_social || empresa.razon_social
                        : empresa.razon_social}
                    </h2>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <Badge className="bg-[#68A243]/10 text-[#3F6E20] border-[#68A243]/20 dark:bg-[#68A243]/20 dark:text-[#9FD27B] dark:border-[#68A243]/30 text-xs">
                        <Building2 className="h-3 w-3 mr-1" />
                        {isEditing
                          ? (sectors.find(
                              (s) => String(s.id) === formData.sector_id,
                            )?.nombre ?? empresa.sector.nombre)
                          : empresa.sector.nombre}
                      </Badge>
                      <Badge className="bg-[#143E29]/8 text-[#143E29] border-[#143E29]/15 dark:bg-[#143E29]/40 dark:text-white dark:border-[#143E29]/50 text-xs">
                        <MapPin className="h-3 w-3 mr-1" />
                        {isEditing
                          ? (localidades.find(
                              (l) => String(l.id) === formData.localidad_id,
                            )?.nombre ?? empresa.localidad.nombre)
                          : empresa.localidad.nombre}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              {isEditing ? (
                <EditForm
                  formData={formData}
                  sectors={sectors}
                  localidades={localidades}
                  onChange={handleFormChange}
                />
              ) : (
                <ViewInfo empresa={empresa} />
              )}
            </div>

            {!isLoading && empresa && (
              <DialogFooter className="pt-2">
                {isEditing ? (
                  <>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCancelEdit}
                      disabled={isSaving}
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSaving}
                      className="bg-[#68A243] hover:bg-[#5a9038] text-white"
                    >
                      {isSaving ? "Guardando..." : "Guardar cambios"}
                    </Button>
                  </>
                ) : (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span tabIndex={0}>
                          <Button
                            disabled
                            className="bg-[#68A243] hover:bg-[#5a9038] text-white pointer-events-none"
                          >
                            <Pencil className="h-4 w-4" />
                            Editar información
                          </Button>
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>Próximamente</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </DialogFooter>
            )}
          </form>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
