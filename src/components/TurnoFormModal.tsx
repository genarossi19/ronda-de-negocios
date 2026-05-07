import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { toast } from "sonner";
import { editTurno, createTurno } from "../api/TurnoService";
import { getApiErrorMessage } from "../lib/axios";
import type { EventoResponse } from "../types/Evento";
import type { TurnoResponse } from "../types/Turno";

type EstadoEditableTurno = "abierto" | "cerrado";

type TurnoFormState = {
  hora_inicio: string;
  hora_fin: string;
  cant_mesas: string;
  estado: EstadoEditableTurno;
};

interface TurnoFormModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  evento: EventoResponse | null;
  turnoEnEdicion: TurnoResponse | null;
  lastTurno?: TurnoResponse | null;
  onSubmitSuccess: () => void;
  isSaving: boolean;
  onSavingChange: (saving: boolean) => void;
}

const initialFormState: TurnoFormState = {
  hora_inicio: "",
  hora_fin: "",
  cant_mesas: "1",
  estado: "abierto",
};

const turnoStatusOptions: Array<{
  value: EstadoEditableTurno;
  label: string;
  badgeClassName: string;
}> = [
  {
    value: "abierto",
    label: "Abierto",
    badgeClassName:
      "bg-[#68A243]/15 text-[#3F6E20] border-[#68A243]/30 dark:bg-[#68A243]/20 dark:text-[#9FD27B] dark:border-[#68A243]/40",
  },
  {
    value: "cerrado",
    label: "Cerrado",
    badgeClassName:
      "bg-[#143E29]/10 text-[#143E29] border-[#143E29]/20 dark:bg-[#143E29]/40 dark:text-white dark:border-[#143E29]/60",
  },
];

function addMinutesToTime(time: string, minutesToAdd: number) {
  const [hours, minutes] = time.split(":").map(Number);

  if (
    Number.isNaN(hours) ||
    Number.isNaN(minutes) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    return "";
  }

  const totalMinutes = hours * 60 + minutes + minutesToAdd;
  const normalizedMinutes = ((totalMinutes % 1440) + 1440) % 1440;
  const nextHours = Math.floor(normalizedMinutes / 60)
    .toString()
    .padStart(2, "0");
  const nextMinutes = (normalizedMinutes % 60).toString().padStart(2, "0");

  return `${nextHours}:${nextMinutes}`;
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(`${date}T00:00:00`));
}

function parseCantMesas(value: string) {
  const parsed = Number(value);

  if (!value || Number.isNaN(parsed) || parsed < 1) {
    return null;
  }

  return parsed;
}

export default function TurnoFormModal({
  isOpen,
  onOpenChange,
  evento,
  turnoEnEdicion,
  lastTurno,
  onSubmitSuccess,
  isSaving,
  onSavingChange,
}: TurnoFormModalProps) {
  const [formData, setFormData] = useState<TurnoFormState>(initialFormState);
  const [isEndTimeManuallyEdited, setIsEndTimeManuallyEdited] = useState(false);

  useEffect(() => {
    if (turnoEnEdicion) {
      setFormData({
        hora_inicio: turnoEnEdicion.hora_inicio,
        hora_fin: turnoEnEdicion.hora_fin,
        cant_mesas: String(turnoEnEdicion.cant_mesas),
        estado: turnoEnEdicion.estado === "cerrado" ? "cerrado" : "abierto",
      });
      setIsEndTimeManuallyEdited(true);
    } else if (lastTurno) {
      const suggestedStart = addMinutesToTime(lastTurno.hora_fin, 5);
      const suggestedEnd = suggestedStart
        ? addMinutesToTime(suggestedStart, 15)
        : "";
      setFormData({
        ...initialFormState,
        hora_inicio: suggestedStart,
        hora_fin: suggestedEnd,
      });
      setIsEndTimeManuallyEdited(false);
    } else {
      setFormData(initialFormState);
      setIsEndTimeManuallyEdited(false);
    }
  }, [turnoEnEdicion, lastTurno, isOpen]);

  const resetForm = () => {
    setFormData(initialFormState);
    setIsEndTimeManuallyEdited(false);
  };

  const handleFormChange = <K extends keyof TurnoFormState>(
    field: K,
    value: TurnoFormState[K],
  ) => {
    setFormData((current) => ({ ...current, [field]: value }));
  };

  const handleStartTimeChange = (value: string) => {
    setFormData((current) => ({
      ...current,
      hora_inicio: value,
      hora_fin: isEndTimeManuallyEdited
        ? current.hora_fin
        : addMinutesToTime(value, 15),
    }));
  };

  const handleEndTimeChange = (value: string) => {
    setIsEndTimeManuallyEdited(true);
    setFormData((current) => ({ ...current, hora_fin: value }));
  };

  const handleCantMesasChange = (value: string) => {
    if (/^\d*$/.test(value)) {
      handleFormChange("cant_mesas", value);
    }
  };

  const handleSubmit = async () => {
    if (!evento) {
      return;
    }

    const cantMesas = parseCantMesas(formData.cant_mesas);

    if (!turnoEnEdicion) {
      if (!formData.hora_inicio || !formData.hora_fin || cantMesas === null) {
        toast.error("Completá horario y cantidad de mesas antes de guardar");
        return;
      }

      if (formData.hora_inicio >= formData.hora_fin) {
        toast.error("La hora de fin debe ser posterior a la hora de inicio");
        return;
      }
    }

    if (cantMesas === null) {
      toast.error("Ingresá una cantidad de mesas válida");
      return;
    }

    try {
      onSavingChange(true);

      if (turnoEnEdicion) {
        const payload = {
          ...(turnoEnEdicion.cant_mesas !== cantMesas && {
            cant_mesas: cantMesas,
          }),
          ...(turnoEnEdicion.estado !== formData.estado && {
            estado: formData.estado,
          }),
        };

        if (Object.keys(payload).length === 0) {
          toast.info("No hubo cambios para guardar en el turno");
          onOpenChange(false);
          resetForm();
          return;
        }

        await editTurno(turnoEnEdicion.id, payload);
        toast.success("El turno fue actualizado correctamente");
      } else {
        await createTurno({
          hora_inicio: formData.hora_inicio,
          hora_fin: formData.hora_fin,
          cant_mesas: cantMesas,
          evento: evento.id,
          estado: formData.estado,
        });
        toast.success("El turno fue creado correctamente");
      }

      onOpenChange(false);
      resetForm();
      onSubmitSuccess();
    } catch (error) {
      const message = getApiErrorMessage(
        error,
        "Ocurrió un error al guardar el turno",
      );
      if (message) {
        toast.error(message);
      }
    } finally {
      onSavingChange(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        onOpenChange(open);
        if (!open) {
          resetForm();
        }
      }}
    >
      <DialogContent className="sm:max-w-xl border-gray-200 dark:border-[#68A243]/20 bg-white dark:bg-[#11161d]">
        <DialogHeader>
          <DialogTitle className="text-[#143E29] dark:text-white">
            {turnoEnEdicion ? "Editar turno" : "Crear nuevo turno"}
          </DialogTitle>
          <DialogDescription className="dark:text-gray-300">
            {turnoEnEdicion
              ? "Podés ajustar la cantidad de mesas y el estado del turno. El horario se muestra como referencia."
              : "Definí el horario, la capacidad y el estado inicial del turno para la ronda activa."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="rounded-2xl border border-[#68A243]/20 bg-[#68A243]/5 dark:bg-[#143E29]/60 p-4 space-y-2">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground dark:text-gray-300">
              Evento asociado
            </p>
            <p className="text-base font-semibold text-[#143E29] dark:text-white">
              {evento?.nombre}
            </p>
            <p className="text-sm text-muted-foreground dark:text-gray-300">
              {evento ? formatDate(evento.fecha) : ""} - {evento?.ubicacion}
            </p>
          </div>

          {turnoEnEdicion ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label className="dark:text-white">Horario</Label>
                  <Input
                    value={`${turnoEnEdicion.hora_inicio} - ${turnoEnEdicion.hora_fin}`}
                    readOnly
                    className="border-[#68A243]/20 dark:bg-[#143E29] dark:border-[#68A243]/20 dark:text-white"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="cant_mesas_edit" className="dark:text-white">
                    Cantidad de mesas
                  </Label>
                  <Input
                    id="cant_mesas_edit"
                    type="number"
                    min={1}
                    value={formData.cant_mesas}
                    onChange={(event) =>
                      handleCantMesasChange(event.target.value)
                    }
                    className="border-[#68A243]/20 focus-visible:border-[#68A243] focus-visible:ring-[#68A243]/20 dark:bg-[#143E29] dark:border-[#68A243]/20 dark:text-white transition-colors"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label className="dark:text-white">Estado</Label>
                <Select
                  value={formData.estado}
                  onValueChange={(value) =>
                    handleFormChange("estado", value as EstadoEditableTurno)
                  }
                >
                  <SelectTrigger className="w-full border-[#68A243]/20 focus-visible:border-[#68A243] focus-visible:ring-[#68A243]/20 dark:bg-[#143E29] dark:border-[#68A243]/20 dark:text-white transition-colors">
                    <SelectValue placeholder="Seleccionar estado" />
                  </SelectTrigger>
                  <SelectContent>
                    {turnoStatusOptions.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="hora_inicio" className="dark:text-white">
                    Hora de inicio
                  </Label>
                  <Input
                    id="hora_inicio"
                    type="time"
                    value={formData.hora_inicio}
                    onChange={(event) =>
                      handleStartTimeChange(event.target.value)
                    }
                    className="border-[#68A243]/20 focus-visible:border-[#68A243] focus-visible:ring-[#68A243]/20 dark:bg-[#143E29] dark:border-[#68A243]/20 dark:text-white transition-colors [color-scheme:light] dark:[color-scheme:dark]"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="hora_fin" className="dark:text-white">
                    Hora de fin
                  </Label>
                  <Input
                    id="hora_fin"
                    type="time"
                    value={formData.hora_fin}
                    onChange={(event) =>
                      handleEndTimeChange(event.target.value)
                    }
                    className="border-[#68A243]/20 focus-visible:border-[#68A243] focus-visible:ring-[#68A243]/20 dark:bg-[#143E29] dark:border-[#68A243]/20 dark:text-white transition-colors [color-scheme:light] dark:[color-scheme:dark]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="cant_mesas" className="dark:text-white">
                    Cantidad de mesas
                  </Label>
                  <Input
                    id="cant_mesas"
                    type="number"
                    min={1}
                    value={formData.cant_mesas}
                    onChange={(event) =>
                      handleCantMesasChange(event.target.value)
                    }
                    className="border-[#68A243]/20 focus-visible:border-[#68A243] focus-visible:ring-[#68A243]/20 dark:bg-[#143E29] dark:border-[#68A243]/20 dark:text-white transition-colors"
                  />
                </div>

                <div className="grid gap-2">
                  <Label className="dark:text-white">Estado inicial</Label>
                  <Select
                    value={formData.estado}
                    onValueChange={(value) =>
                      handleFormChange("estado", value as EstadoEditableTurno)
                    }
                  >
                    <SelectTrigger className="w-full border-[#68A243]/20 focus-visible:border-[#68A243] focus-visible:ring-[#68A243]/20 dark:bg-[#143E29] dark:border-[#68A243]/20 dark:text-white transition-colors">
                      <SelectValue placeholder="Seleccionar estado" />
                    </SelectTrigger>
                    <SelectContent>
                      {turnoStatusOptions.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSaving}
            className="bg-[#68A243] hover:bg-[#5a9038] text-white"
          >
            {isSaving
              ? "Guardando..."
              : turnoEnEdicion
                ? "Actualizar turno"
                : "Crear turno"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
