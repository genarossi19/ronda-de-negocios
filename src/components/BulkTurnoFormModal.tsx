import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { ScrollArea } from "./ui/scroll-area";
import { toast } from "sonner";
import { createTurno, deleteTurno } from "../api/TurnoService";
import { getApiErrorMessage } from "../lib/axios";
import type { EventoResponse } from "../types/Evento";
import type { TurnoResponse } from "../types/Turno";

function addMinutesToTime(time: string, minutesToAdd: number): string {
  const [hours, minutes] = time.split(":").map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return "";
  const totalMinutes = hours * 60 + minutes + minutesToAdd;
  const normalized = ((totalMinutes % 1440) + 1440) % 1440;
  const h = Math.floor(normalized / 60)
    .toString()
    .padStart(2, "0");
  const m = (normalized % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(`${date}T00:00:00`));
}

interface BulkPreviewTurno {
  hora_inicio: string;
  hora_fin: string;
  cant_mesas: number;
}

export interface BulkTurnoFormModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  evento: EventoResponse | null;
  lastTurno?: TurnoResponse | null;
  onSubmitSuccess: () => void;
}

const INPUT_CLASS =
  "border-[#68A243]/20 focus-visible:border-[#68A243] focus-visible:ring-[#68A243]/20 dark:bg-[#143E29] dark:border-[#68A243]/20 dark:text-white transition-colors";

export default function BulkTurnoFormModal({
  isOpen,
  onOpenChange,
  evento,
  lastTurno,
  onSubmitSuccess,
}: BulkTurnoFormModalProps) {
  const [horaInicio, setHoraInicio] = useState("");
  const [cantTurnos, setCantTurnos] = useState("3");
  const [duracionMin, setDuracionMin] = useState("15");
  const [gapMin, setGapMin] = useState("5");
  const [cantMesas, setCantMesas] = useState("1");
  const [isSaving, setIsSaving] = useState(false);
  const [progressDone, setProgressDone] = useState(0);
  const [previewExpanded, setPreviewExpanded] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setIsSaving(false);
    setProgressDone(0);
    if (lastTurno) {
      setHoraInicio(addMinutesToTime(lastTurno.hora_fin, 5));
      setCantMesas(String(lastTurno.cant_mesas));
    } else if (evento?.hora_inicio) {
      setHoraInicio(evento.hora_inicio.slice(0, 5));
      setCantMesas("1");
    } else {
      setHoraInicio("");
      setCantMesas("1");
    }
  }, [isOpen, lastTurno, evento]);

  const preview = useMemo<BulkPreviewTurno[]>(() => {
    const n = parseInt(cantTurnos, 10);
    const dur = parseInt(duracionMin, 10);
    const gap = parseInt(gapMin, 10);
    const mesas = parseInt(cantMesas, 10);

    if (
      !horaInicio ||
      Number.isNaN(n) ||
      Number.isNaN(dur) ||
      Number.isNaN(gap) ||
      Number.isNaN(mesas) ||
      n < 1 ||
      dur < 1 ||
      gap < 0 ||
      mesas < 1
    ) {
      return [];
    }

    const result: BulkPreviewTurno[] = [];
    let currentStart = horaInicio;
    for (let i = 0; i < n; i++) {
      const end = addMinutesToTime(currentStart, dur);
      result.push({
        hora_inicio: currentStart,
        hora_fin: end,
        cant_mesas: mesas,
      });
      currentStart = addMinutesToTime(end, gap);
    }
    return result;
  }, [horaInicio, cantTurnos, duracionMin, gapMin, cantMesas]);

  const validateForm = (): boolean => {
    const n = parseInt(cantTurnos, 10);
    const dur = parseInt(duracionMin, 10);
    const gap = parseInt(gapMin, 10);
    const mesas = parseInt(cantMesas, 10);

    if (!horaInicio) {
      toast.error("Ingresá la hora de inicio del primer turno");
      return false;
    }
    if (Number.isNaN(n) || n < 2) {
      toast.error("La cantidad de turnos debe ser al menos 2");
      return false;
    }
    if (Number.isNaN(dur) || dur < 1) {
      toast.error("La duración de cada turno debe ser al menos 1 minuto");
      return false;
    }
    if (Number.isNaN(gap) || gap < 0) {
      toast.error("El tiempo entre turnos no puede ser negativo");
      return false;
    }
    if (Number.isNaN(mesas) || mesas < 1) {
      toast.error("La cantidad de mesas debe ser al menos 1");
      return false;
    }
    if (evento && horaInicio < evento.hora_inicio.slice(0, 5)) {
      toast.error(
        `La hora de inicio no puede ser anterior a la hora del evento (${evento.hora_inicio.slice(0, 5)} hs)`,
      );
      return false;
    }
    if (preview.length === 0) {
      toast.error(
        "No se pudieron generar los turnos con los parámetros ingresados",
      );
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!evento || preview.length === 0 || isSaving) return;

    setIsSaving(true);
    setProgressDone(0);
    const createdIds: number[] = [];

    try {
      for (const turno of preview) {
        const created = await createTurno({
          hora_inicio: turno.hora_inicio,
          hora_fin: turno.hora_fin,
          cant_mesas: turno.cant_mesas,
          evento: evento.id,
          estado: "abierto",
        });
        createdIds.push(created.id);
        setProgressDone((d) => d + 1);
      }

      toast.success(
        `${preview.length} turno${preview.length > 1 ? "s" : ""} creado${preview.length > 1 ? "s" : ""} correctamente`,
      );
      onOpenChange(false);
      onSubmitSuccess();
    } catch (error) {
      // Rollback: eliminar todos los creados exitosamente
      const rollbackFailed: number[] = [];
      for (const id of createdIds) {
        try {
          await deleteTurno(id);
        } catch {
          rollbackFailed.push(id);
        }
      }

      const message = getApiErrorMessage(
        error,
        "No se pudieron crear los turnos",
      );
      if (rollbackFailed.length > 0) {
        toast.error(
          `${message}. Atención: los turnos con ID ${rollbackFailed.join(", ")} no se pudieron eliminar.`,
        );
      } else if (message) {
        toast.error(`${message}. Los cambios fueron revertidos.`);
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!isSaving) onOpenChange(open);
      }}
    >
      <DialogContent className="sm:max-w-xl border-gray-200 dark:border-[#68A243]/20 bg-white dark:bg-[#11161d]">
        <DialogHeader>
          <DialogTitle className="text-[#143E29] dark:text-white">
            {isSaving ? "Creando turnos..." : "Crear varios turnos"}
          </DialogTitle>
          <DialogDescription className="dark:text-gray-300">
            {isSaving
              ? `Procesando ${preview.length} turno${preview.length > 1 ? "s" : ""}. No cierres esta ventana.`
              : "Configurá los parámetros y generaremos los turnos automáticamente."}
          </DialogDescription>
        </DialogHeader>

        {isSaving ? (
          <div className="py-4 space-y-5">
            {/* Barra de progreso */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground dark:text-gray-300">
                  Creando turno {Math.min(progressDone + 1, preview.length)} de{" "}
                  {preview.length}
                </span>
                <span className="font-semibold text-[#143E29] dark:text-white tabular-nums">
                  {Math.round((progressDone / preview.length) * 100)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-[#0f2f25] rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-[#68A243] h-2.5 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${(progressDone / preview.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Lista de turnos con estado de creación */}
            <ScrollArea className="max-h-56 rounded-xl border border-[#68A243]/20">
              <div className="divide-y divide-[#68A243]/10">
                {preview.map((t, i) => (
                  <div
                    key={i}
                    className={`flex items-center justify-between px-4 py-2.5 text-xs transition-colors ${
                      i < progressDone
                        ? "bg-[#68A243]/5 dark:bg-[#0f2f25]/40"
                        : "opacity-40"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {i < progressDone ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-[#68A243] shrink-0" />
                      ) : (
                        <div className="h-3.5 w-3.5 rounded-full border-2 border-gray-300 dark:border-gray-600 shrink-0" />
                      )}
                      <span className="font-medium text-[#143E29] dark:text-white tabular-nums">
                        {t.hora_inicio} → {t.hora_fin}
                      </span>
                    </div>
                    <span className="text-muted-foreground dark:text-gray-400">
                      {t.cant_mesas} mesa{t.cant_mesas > 1 ? "s" : ""}
                    </span>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        ) : (
          <div className="grid gap-4 py-2">
            {/* Evento info */}
            <div className="rounded-2xl border border-[#68A243]/20 bg-[#68A243]/5 dark:bg-[#143E29]/60 p-4 space-y-1">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground dark:text-gray-300">
                Evento asociado
              </p>
              <p className="text-base font-semibold text-[#143E29] dark:text-white">
                {evento?.nombre}
              </p>
              <p className="text-sm text-muted-foreground dark:text-gray-300">
                {evento ? formatDate(evento.fecha) : ""} — {evento?.ubicacion}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="bulk_hora_inicio" className="dark:text-white">
                  Hora inicio del primer turno
                </Label>
                <Input
                  id="bulk_hora_inicio"
                  type="time"
                  value={horaInicio}
                  onChange={(e) => setHoraInicio(e.target.value)}
                  className={`${INPUT_CLASS} [color-scheme:light] dark:[color-scheme:dark]`}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="bulk_cant_turnos" className="dark:text-white">
                  Cantidad de turnos
                </Label>
                <Input
                  id="bulk_cant_turnos"
                  type="number"
                  min={2}
                  value={cantTurnos}
                  onChange={(e) =>
                    setCantTurnos(e.target.value.replace(/\D/g, ""))
                  }
                  className={INPUT_CLASS}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="bulk_duracion" className="dark:text-white">
                  Duración de cada turno (min)
                </Label>
                <Input
                  id="bulk_duracion"
                  type="number"
                  min={1}
                  value={duracionMin}
                  onChange={(e) =>
                    setDuracionMin(e.target.value.replace(/\D/g, ""))
                  }
                  className={INPUT_CLASS}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="bulk_gap" className="dark:text-white">
                  Tiempo entre turnos (min)
                </Label>
                <Input
                  id="bulk_gap"
                  type="number"
                  min={0}
                  value={gapMin}
                  onChange={(e) => setGapMin(e.target.value.replace(/\D/g, ""))}
                  className={INPUT_CLASS}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="bulk_cant_mesas" className="dark:text-white">
                Cantidad de mesas por turno
              </Label>
              <Input
                id="bulk_cant_mesas"
                type="number"
                min={1}
                value={cantMesas}
                onChange={(e) =>
                  setCantMesas(e.target.value.replace(/\D/g, ""))
                }
                className={INPUT_CLASS}
              />
            </div>

            {/* Preview expandible en vivo */}
            {preview.length > 0 && (
              <div className="rounded-xl border border-[#68A243]/20 overflow-hidden">
                {/* Header — siempre visible, clickeable */}
                <button
                  type="button"
                  onClick={() => setPreviewExpanded((v) => !v)}
                  className="w-full flex items-center justify-between gap-3 px-4 py-3 bg-[#68A243]/5 dark:bg-[#0f2f25]/50 hover:bg-[#68A243]/10 dark:hover:bg-[#0f2f25]/70 transition-colors text-left"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xs font-semibold text-[#143E29] dark:text-[#9FD27B] shrink-0">
                      Vista previa
                    </span>
                    <span className="text-xs text-muted-foreground dark:text-gray-400 truncate">
                      {preview[0].hora_inicio} → {preview[0].hora_fin}
                      {preview.length > 1 &&
                        ` · ${preview[1].hora_inicio} → ${preview[1].hora_fin}`}
                      {preview.length > 2 && ` · +${preview.length - 2} más`}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-xs text-[#68A243] font-medium">
                      {previewExpanded ? "Ocultar" : "Ver detalle"}
                    </span>
                    {previewExpanded ? (
                      <ChevronUp className="h-3.5 w-3.5 text-[#68A243]" />
                    ) : (
                      <ChevronDown className="h-3.5 w-3.5 text-[#68A243]" />
                    )}
                  </div>
                </button>

                {/* Tabla expandida */}
                {previewExpanded && (
                  <ScrollArea className="max-h-52 border-t border-[#68A243]/15">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-[#68A243]/5 dark:bg-[#0f2f25]/60">
                          <th className="px-3 py-2 text-left font-semibold text-[#143E29] dark:text-white">
                            #
                          </th>
                          <th className="px-3 py-2 text-left font-semibold text-[#143E29] dark:text-white">
                            Inicio
                          </th>
                          <th className="px-3 py-2 text-left font-semibold text-[#143E29] dark:text-white">
                            Fin
                          </th>
                          <th className="px-3 py-2 text-left font-semibold text-[#143E29] dark:text-white">
                            Duración
                          </th>
                          <th className="px-3 py-2 text-left font-semibold text-[#143E29] dark:text-white">
                            Mesas
                          </th>
                          <th className="px-3 py-2 text-left font-semibold text-[#143E29] dark:text-white">
                            Estado
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {preview.map((t, i) => {
                          const [sh, sm] = t.hora_inicio.split(":").map(Number);
                          const [eh, em] = t.hora_fin.split(":").map(Number);
                          const durMin = eh * 60 + em - (sh * 60 + sm);
                          return (
                            <tr
                              key={i}
                              className="border-t border-[#68A243]/10 hover:bg-[#68A243]/5 dark:hover:bg-[#0f2f25]/30 transition-colors"
                            >
                              <td className="px-3 py-2 text-muted-foreground dark:text-gray-500">
                                {i + 1}
                              </td>
                              <td className="px-3 py-2 font-medium text-[#143E29] dark:text-white tabular-nums">
                                {t.hora_inicio}
                              </td>
                              <td className="px-3 py-2 font-medium text-[#143E29] dark:text-white tabular-nums">
                                {t.hora_fin}
                              </td>
                              <td className="px-3 py-2 text-muted-foreground dark:text-gray-400">
                                {durMin} min
                              </td>
                              <td className="px-3 py-2 text-[#143E29] dark:text-white">
                                {t.cant_mesas}
                              </td>
                              <td className="px-3 py-2">
                                <Badge className="bg-[#68A243]/15 text-[#3F6E20] border-[#68A243]/30 dark:bg-[#68A243]/20 dark:text-[#9FD27B] dark:border-[#68A243]/40 text-[10px] py-0 px-1.5">
                                  Abierto
                                </Badge>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </ScrollArea>
                )}
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            Cancelar
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                disabled={preview.length === 0 || isSaving}
                className="bg-[#68A243] hover:bg-[#5a9038] text-white"
                onClick={() => {
                  if (!validateForm()) return;
                }}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creando...
                  </>
                ) : (
                  `Crear ${preview.length > 0 ? preview.length : ""} turno${preview.length > 1 ? "s" : ""}`
                )}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  ¿Crear {preview.length} turno{preview.length > 1 ? "s" : ""}?
                </AlertDialogTitle>
                <AlertDialogDescription asChild>
                  <div className="space-y-3">
                    <p>
                      Se crearán{" "}
                      <strong>
                        {preview.length} turno{preview.length > 1 ? "s" : ""}
                      </strong>{" "}
                      en estado Abierto para la ronda{" "}
                      <strong>{evento?.nombre}</strong>.
                    </p>
                    {preview.length > 0 && (
                      <div className="rounded-lg border border-[#68A243]/20 bg-[#68A243]/5 dark:bg-[#0f2f25]/50 px-3 py-2 text-xs space-y-1">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Primer turno
                          </span>
                          <span className="font-medium text-[#143E29] dark:text-white tabular-nums">
                            {preview[0].hora_inicio} → {preview[0].hora_fin}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Último turno
                          </span>
                          <span className="font-medium text-[#143E29] dark:text-white tabular-nums">
                            {preview[preview.length - 1].hora_inicio} →{" "}
                            {preview[preview.length - 1].hora_fin}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Mesas por turno
                          </span>
                          <span className="font-medium text-[#143E29] dark:text-white">
                            {preview[0].cant_mesas}
                          </span>
                        </div>
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Las peticiones se envían en cola. Si alguna falla, los
                      turnos ya creados se revierten automáticamente.
                    </p>
                  </div>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleSubmit}
                  className="!bg-[#68A243] !text-white hover:!bg-[#5a9038]"
                >
                  Confirmar y crear
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
