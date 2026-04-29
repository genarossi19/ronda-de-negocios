import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  LayoutGrid,
  MapPin,
  Pencil,
  Plus,
  Users,
} from "lucide-react";
import Navbar from "../../components/Navbar";
import Footer from "../../layout/Footer";
import GestionarAsientosModal from "../../components/GestionarAsientosModal";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { ScrollArea } from "../../components/ui/scroll-area";
import { Skeleton } from "../../components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { toast } from "sonner";
import { getEventos } from "../../api/EventoService";
import {
  createTurno,
  editTurno,
  getTurnoByEventoId,
} from "../../api/TurnoService";
import type { EventoResponse } from "../../types/Evento";
import type { TurnoResponse } from "../../types/Turno";
import { getApiErrorMessage, isSessionExpiredError } from "../../lib/axios";

type EstadoEditableTurno = "abierto" | "cerrado";

type TurnoFormState = {
  hora_inicio: string;
  hora_fin: string;
  cant_mesas: string;
  estado: EstadoEditableTurno;
};

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

function formatTurnoStatus(status: TurnoResponse["estado"]) {
  if (status === "full") {
    return {
      label: "Completo",
      badgeClassName:
        "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-800/50",
    };
  }

  return (
    turnoStatusOptions.find((option) => option.value === status) ??
    turnoStatusOptions[0]
  );
}

function getTurnoSortValue(turno: TurnoResponse) {
  const priority =
    turno.estado === "abierto" ? 0 : turno.estado === "full" ? 1 : 2;
  return { priority, hour: turno.hora_inicio };
}

function normalizeTurno(turno: TurnoResponse): TurnoResponse {
  return {
    ...turno,
    mesas_ocupadas: Number.isFinite(turno.mesas_ocupadas)
      ? turno.mesas_ocupadas
      : 0,
  };
}

function parseCantMesas(value: string) {
  const parsed = Number(value);

  if (!value || Number.isNaN(parsed) || parsed < 1) {
    return null;
  }

  return parsed;
}

function HeroSkeleton() {
  return (
    <section className="rounded-3xl bg-gradient-to-br from-[#143E29] via-[#1a5236] to-[#143E29] px-6 py-8 md:px-8 shadow-xl shadow-[#143E29]/10">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl w-full space-y-4">
          <Skeleton className="h-10 w-24 bg-white/10" />
          <div className="flex items-center gap-3">
            <Skeleton className="h-11 w-11 rounded-2xl bg-white/10" />
            <Skeleton className="h-10 w-56 bg-white/10" />
          </div>
          <Skeleton className="h-5 w-full max-w-xl bg-white/10" />
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Skeleton className="h-11 w-36 bg-white/10" />
        </div>
      </div>
    </section>
  );
}

function StatCardSkeleton() {
  return (
    <Card className="!gap-2 !py-3 border-[#68A243]/20">
      <CardHeader className="!px-5 !pb-0">
        <Skeleton className="h-4 w-28 dark:bg-[#0f2f25]" />
      </CardHeader>
      <CardContent className="!px-5 !pt-0">
        <div className="flex items-center justify-between gap-3">
          <Skeleton className="h-8 w-12 dark:bg-[#0f2f25]" />
          <Skeleton className="h-8 w-8 rounded-full dark:bg-[#0f2f25]" />
        </div>
      </CardContent>
    </Card>
  );
}

function EventContextSkeleton() {
  return (
    <Card className="border-[#68A243]/20 overflow-hidden">
      <CardHeader className="border-b border-[#68A243]/10 dark:border-[#68A243]/20">
        <Skeleton className="h-7 w-44 dark:bg-[#0f2f25]" />
      </CardHeader>
      <CardContent className="pt-6">
        <div className="rounded-2xl border border-[#68A243]/30 bg-gradient-to-br from-[#68A243]/10 to-white dark:from-[#68A243]/15 dark:to-[#143E29] p-5 space-y-4">
          <Skeleton className="h-8 w-full max-w-xs dark:bg-[#0f2f25]" />
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4 rounded-full dark:bg-[#0f2f25]" />
              <Skeleton className="h-4 w-40 dark:bg-[#0f2f25]" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4 rounded-full dark:bg-[#0f2f25]" />
              <Skeleton className="h-4 w-48 dark:bg-[#0f2f25]" />
            </div>
          </div>
          <Skeleton className="h-10 w-full dark:bg-[#0f2f25]" />
        </div>
      </CardContent>
    </Card>
  );
}

function TurnosListSkeleton() {
  return (
    <Card className="border-[#68A243]/20">
      <CardHeader className="border-b border-[#68A243]/10 dark:border-[#68A243]/20">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <Skeleton className="h-7 w-40 dark:bg-[#0f2f25]" />
          <Skeleton className="h-6 w-24 rounded-full dark:bg-[#0f2f25]" />
        </div>
      </CardHeader>

      <CardContent className="pt-6 space-y-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="rounded-2xl border border-gray-200 bg-white dark:bg-[#143E29] dark:border-[#68A243]/20 p-5"
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-4 w-full max-w-md">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-7 w-32 dark:bg-[#0f2f25]" />
                  <Skeleton className="h-6 w-24 rounded-full dark:bg-[#0f2f25]" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {Array.from({ length: 3 }).map((__, innerIndex) => (
                    <div
                      key={innerIndex}
                      className="rounded-xl border border-[#68A243]/15 p-3 space-y-2"
                    >
                      <Skeleton className="h-3 w-16 dark:bg-[#0f2f25]" />
                      <Skeleton className="h-5 w-20 dark:bg-[#0f2f25]" />
                    </div>
                  ))}
                </div>
              </div>

              <Skeleton className="h-10 w-28 dark:bg-[#0f2f25]" />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export default function GestionarTurnos() {
  const navigate = useNavigate();
  const { eventoId } = useParams();
  const [evento, setEvento] = useState<EventoResponse | null>(null);
  const [turnos, setTurnos] = useState<TurnoResponse[]>([]);
  const [turnoGestionado, setTurnoGestionado] = useState<TurnoResponse | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [turnoEnEdicion, setTurnoEnEdicion] = useState<TurnoResponse | null>(
    null,
  );
  const [formData, setFormData] = useState<TurnoFormState>(initialFormState);
  const [isEndTimeManuallyEdited, setIsEndTimeManuallyEdited] = useState(false);

  const loadTurnos = async (selectedEventoId: number) => {
    const data = await getTurnoByEventoId(selectedEventoId);
    setTurnos(data.map(normalizeTurno));
  };

  useEffect(() => {
    const selectedEventoId = Number(eventoId);

    if (!selectedEventoId || Number.isNaN(selectedEventoId)) {
      toast.error("Seleccioná una ronda activa para gestionar sus turnos");
      navigate("/panel-administrador/gestionar-rondas", { replace: true });
      return;
    }

    const fetchData = async () => {
      try {
        setIsLoading(true);
        const eventos = await getEventos();
        const selectedEvento = eventos.find(
          (currentEvento) => currentEvento.id === selectedEventoId,
        );

        if (!selectedEvento || selectedEvento.estado !== "activo") {
          toast.error("Solo se pueden gestionar turnos de una ronda activa");
          navigate("/panel-administrador/gestionar-rondas", { replace: true });
          return;
        }

        setEvento(selectedEvento);
        await loadTurnos(selectedEvento.id);
      } catch (error) {
        if (!isSessionExpiredError(error)) {
          console.error("Error loading shifts:", error);
        }
        const message = getApiErrorMessage(
          error,
          "No se pudieron cargar los turnos del evento",
        );
        if (message) {
          toast.error(message);
        }
        setTurnos([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [eventoId, navigate]);

  const turnosOrdenados = useMemo(() => {
    return [...turnos].sort((first, second) => {
      const a = getTurnoSortValue(first);
      const b = getTurnoSortValue(second);

      if (a.priority !== b.priority) {
        return a.priority - b.priority;
      }

      return a.hour.localeCompare(b.hour);
    });
  }, [turnos]);

  const stats = useMemo(
    () => ({
      total: turnos.length,
      abiertos: turnos.filter((turno) => turno.estado === "abierto").length,
      cerrados: turnos.filter((turno) => turno.estado === "cerrado").length,
      mesasTotales: turnos.reduce(
        (accumulator, turno) => accumulator + turno.cant_mesas,
        0,
      ),
    }),
    [turnos],
  );

  const ultimoTurnoCreado = useMemo(() => {
    if (turnos.length === 0) {
      return null;
    }

    return [...turnos].sort((first, second) => {
      if (first.hora_fin !== second.hora_fin) {
        return first.hora_fin.localeCompare(second.hora_fin);
      }

      return first.hora_inicio.localeCompare(second.hora_inicio);
    })[turnos.length - 1];
  }, [turnos]);

  const handleOpenSeatManager = (turno: TurnoResponse) => {
    setTurnoGestionado(turno);
  };

  const resetForm = () => {
    setFormData(initialFormState);
    setTurnoEnEdicion(null);
    setIsEndTimeManuallyEdited(false);
  };

  const openCreateDialog = () => {
    resetForm();

    if (ultimoTurnoCreado) {
      setFormData({
        ...initialFormState,
        hora_inicio: ultimoTurnoCreado.hora_fin,
        hora_fin: addMinutesToTime(ultimoTurnoCreado.hora_fin, 15),
      });
    }

    setIsFormOpen(true);
  };

  const openEditDialog = (turno: TurnoResponse) => {
    setTurnoEnEdicion(turno);
    setFormData({
      hora_inicio: turno.hora_inicio,
      hora_fin: turno.hora_fin,
      cant_mesas: String(turno.cant_mesas),
      estado: turno.estado === "cerrado" ? "cerrado" : "abierto",
    });
    setIsEndTimeManuallyEdited(true);
    setIsFormOpen(true);
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
      setIsSaving(true);

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
          setIsFormOpen(false);
          resetForm();
          return;
        }

        await editTurno(turnoEnEdicion.id, payload);
        await loadTurnos(evento.id);
        toast.success("El turno fue actualizado correctamente");
      } else {
        await createTurno({
          hora_inicio: formData.hora_inicio,
          hora_fin: formData.hora_fin,
          cant_mesas: cantMesas,
          evento: evento.id,
          estado: formData.estado,
        });
        await loadTurnos(evento.id);
        toast.success("El turno fue creado correctamente");
      }

      setIsFormOpen(false);
      resetForm();
    } catch (error) {
      const message = getApiErrorMessage(
        error,
        "Ocurrió un error al guardar el turno",
      );
      if (message) {
        toast.error(message);
      }
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0a1a15] transition-colors duration-300 flex flex-col">
        <Navbar />
        <main className="flex-1 pt-24 pb-12 px-4">
          <div className="max-w-7xl mx-auto space-y-8">
            <HeroSkeleton />

            <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <StatCardSkeleton key={index} />
              ))}
            </section>

            <section className="grid grid-cols-1 xl:grid-cols-[1.1fr_2fr] gap-6">
              <EventContextSkeleton />
              <TurnosListSkeleton />
            </section>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!evento) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a1a15] transition-colors duration-300 flex flex-col">
      <Navbar />

      <main className="flex-1 pt-24 pb-12 px-4">
        <div className="max-w-7xl mx-auto space-y-8">
          <section className="rounded-3xl bg-gradient-to-br from-[#143E29] via-[#1a5236] to-[#143E29] px-6 py-8 md:px-8 text-white shadow-xl shadow-[#143E29]/10">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl space-y-4">
                <Button
                  variant="ghost"
                  onClick={() => navigate(-1)}
                  className="w-fit px-0 text-white/90 hover:bg-white/10 hover:text-white"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Volver
                </Button>
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-[#9FD27B] ring-1 ring-white/15 backdrop-blur-sm">
                    <Clock3 className="h-5 w-5" />
                  </div>
                  <h1 className="text-3xl sm:text-4xl font-semibold">
                    Gestionar turnos
                  </h1>
                </div>
                <p className="text-white/80 text-base max-w-2xl">
                  Administrá los turnos de la ronda activa y ajustá su capacidad
                  operativa.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={openCreateDialog}
                  className="h-11 px-5 bg-[#68A243] hover:bg-[#5a9038] text-white shadow-lg shadow-[#68A243]/20"
                >
                  <Plus className="h-4 w-4" />
                  Nuevo turno
                </Button>
              </div>
            </div>
          </section>

          <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            <Card className="!gap-2 !py-3 border-[#68A243]/20">
              <CardHeader className="!px-5 !pb-0">
                <CardTitle className="text-sm text-muted-foreground dark:text-gray-300">
                  Total de turnos
                </CardTitle>
              </CardHeader>
              <CardContent className="!px-5 !pt-0">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-3xl font-bold leading-none text-[#143E29] dark:text-white">
                    {stats.total}
                  </div>
                  <div className="rounded-full bg-[#143E29]/8 p-2 dark:bg-[#143E29]/35">
                    <Clock3 className="h-3.5 w-3.5 text-[#143E29] dark:text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="!gap-2 !py-3 border-[#68A243]/20">
              <CardHeader className="!px-5 !pb-0">
                <CardTitle className="text-sm text-muted-foreground dark:text-gray-300">
                  Abiertos
                </CardTitle>
              </CardHeader>
              <CardContent className="!px-5 !pt-0">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-3xl font-bold leading-none text-[#68A243]">
                    {stats.abiertos}
                  </div>
                  <div className="rounded-full bg-[#68A243]/10 p-2 dark:bg-[#68A243]/20">
                    <CheckCircle2 className="h-3.5 w-3.5 text-[#68A243]" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="!gap-2 !py-3 border-[#68A243]/20">
              <CardHeader className="!px-5 !pb-0">
                <CardTitle className="text-sm text-muted-foreground dark:text-gray-300">
                  Cerrados
                </CardTitle>
              </CardHeader>
              <CardContent className="!px-5 !pt-0">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-3xl font-bold leading-none text-[#143E29] dark:text-white">
                    {stats.cerrados}
                  </div>
                  <div className="rounded-full bg-[#143E29]/10 p-2 dark:bg-[#143E29]/40">
                    <CalendarDays className="h-3.5 w-3.5 text-[#143E29] dark:text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="!gap-2 !py-3 border-[#68A243]/20">
              <CardHeader className="!px-5 !pb-0">
                <CardTitle className="text-sm text-muted-foreground dark:text-gray-300">
                  Mesas totales
                </CardTitle>
              </CardHeader>
              <CardContent className="!px-5 !pt-0">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-3xl font-bold leading-none text-[#143E29] dark:text-white">
                    {stats.mesasTotales}
                  </div>
                  <div className="rounded-full bg-[#143E29]/10 p-2 dark:bg-[#143E29]/40">
                    <Users className="h-3.5 w-3.5 text-[#143E29] dark:text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          <section className="grid grid-cols-1 xl:grid-cols-[1.1fr_2fr] gap-6">
            <Card className="border-[#68A243]/20 overflow-hidden">
              <CardHeader className="border-b border-[#68A243]/10 dark:border-[#68A243]/20">
                <CardTitle className="text-xl text-[#143E29] dark:text-white">
                  Evento seleccionado
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="rounded-2xl border border-[#68A243]/30 bg-gradient-to-br from-[#68A243]/10 to-white dark:from-[#68A243]/15 dark:to-[#143E29] p-5 space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-[#68A243] mb-1">
                        Ronda activa
                      </p>
                      <h2 className="text-2xl font-semibold text-[#143E29] dark:text-white">
                        {evento.nombre}
                      </h2>
                    </div>
                    <Badge className="bg-[#143E29] text-white border-transparent dark:bg-[#68A243]">
                      Activa
                    </Badge>
                  </div>

                  <div className="space-y-3 text-sm text-gray-700 dark:text-gray-200">
                    <div className="flex items-center gap-2">
                      <CalendarDays className="h-4 w-4 text-[#68A243]" />
                      <span>{formatDate(evento.fecha)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-[#68A243]" />
                      <span>{evento.ubicacion}</span>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    className="w-full border-[#68A243] text-[#68A243] hover:bg-[#68A243] hover:text-white bg-transparent"
                    onClick={() =>
                      navigate("/panel-administrador/gestionar-rondas")
                    }
                  >
                    <CalendarDays className="h-4 w-4" />
                    Volver a gestionar rondas
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-[#68A243]/20 xl:self-start">
              <CardHeader className="border-b border-[#68A243]/10 dark:border-[#68A243]/20">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <CardTitle className="text-xl text-[#143E29] dark:text-white">
                    Todos los turnos
                  </CardTitle>
                  <Badge className="w-fit bg-[#68A243]/10 text-[#3F6E20] border-[#68A243]/20 dark:bg-[#68A243]/20 dark:text-[#9FD27B] dark:border-[#68A243]/30">
                    {turnosOrdenados.length} configurados
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="pt-6">
                {turnosOrdenados.length > 0 ? (
                  <ScrollArea className="xl:h-[calc(100vh-23rem)] xl:min-h-[28rem] xl:pr-4">
                    <div className="space-y-4 pr-1">
                      {turnosOrdenados.map((turno) => {
                        const statusMeta = formatTurnoStatus(turno.estado);
                        const mesasDisponibles = Math.max(
                          turno.cant_mesas - turno.mesas_ocupadas,
                          0,
                        );
                        const occupancy = turno.cant_mesas
                          ? Math.round(
                              (turno.mesas_ocupadas / turno.cant_mesas) * 100,
                            )
                          : 0;

                        return (
                          <div
                            key={turno.id}
                            className="rounded-2xl border border-gray-200 bg-white dark:bg-[#143E29] dark:border-[#68A243]/20 p-5 transition-all duration-300"
                          >
                            <div className="space-y-5">
                              <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                                <div className="flex flex-wrap items-center gap-2">
                                  <h3 className="text-xl font-semibold text-[#143E29] dark:text-white">
                                    Turno {turno.id}
                                  </h3>
                                  <Badge className={statusMeta.badgeClassName}>
                                    {statusMeta.label}
                                  </Badge>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-2 xl:min-w-max xl:justify-end">
                                  <Button
                                    variant="ghost"
                                    onClick={() => openEditDialog(turno)}
                                    className="border-[#68A243]/30 text-[#68A243] hover:bg-[#68A243] hover:text-white"
                                  >
                                    <Pencil className="h-4 w-4" />
                                    Editar turno
                                  </Button>
                                  <Button
                                    onClick={() => handleOpenSeatManager(turno)}
                                    className="bg-[#143E29] hover:bg-[#0f2f25] text-white dark:bg-[#68A243] dark:hover:bg-[#5a9038]"
                                  >
                                    <LayoutGrid className="h-4 w-4" />
                                    Gestionar asientos
                                  </Button>
                                </div>
                              </div>

                              <div className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 text-sm text-gray-700 dark:text-gray-200">
                                  <div className="rounded-xl border border-[#68A243]/15 bg-[#68A243]/5 dark:bg-[#0f2f25]/70 p-3">
                                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground dark:text-gray-300 mb-1">
                                      Horario
                                    </p>
                                    <p className="font-semibold text-[#143E29] dark:text-white">
                                      {turno.hora_inicio} - {turno.hora_fin}
                                    </p>
                                  </div>

                                  <div className="rounded-xl border border-[#68A243]/15 bg-[#68A243]/5 dark:bg-[#0f2f25]/70 p-3">
                                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground dark:text-gray-300 mb-1">
                                      Mesas
                                    </p>
                                    <p className="font-semibold text-[#143E29] dark:text-white">
                                      {turno.mesas_ocupadas} ocupadas de{" "}
                                      {turno.cant_mesas}
                                    </p>
                                  </div>

                                  <div className="rounded-xl border border-[#68A243]/15 bg-[#68A243]/5 dark:bg-[#0f2f25]/70 p-3">
                                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground dark:text-gray-300 mb-1">
                                      Disponibles
                                    </p>
                                    <p className="font-semibold text-[#143E29] dark:text-white">
                                      {mesasDisponibles} libres
                                    </p>
                                  </div>
                                </div>

                                <div className="space-y-2">
                                  <div className="flex justify-between text-sm">
                                    <span className="text-gray-600 dark:text-gray-300">
                                      Ocupación
                                    </span>
                                    <span className="font-semibold text-[#143E29] dark:text-white">
                                      {occupancy}%
                                    </span>
                                  </div>
                                  <div className="w-full bg-gray-200 dark:bg-[#0f2f25] rounded-full h-2">
                                    <div
                                      className="bg-[#68A243] h-2 rounded-full transition-all duration-500"
                                      style={{ width: `${occupancy}%` }}
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="rounded-2xl border border-dashed border-[#68A243]/30 bg-[#68A243]/5 dark:bg-[#143E29]/50 p-8 text-center">
                    <h3 className="text-lg font-semibold text-[#143E29] dark:text-white mb-2">
                      No hay turnos configurados
                    </h3>
                    <p className="text-sm text-muted-foreground dark:text-gray-300 mb-5">
                      Creá el primer turno de esta ronda activa para empezar a
                      organizar las mesas.
                    </p>
                    <Button
                      onClick={openCreateDialog}
                      className="bg-[#68A243] hover:bg-[#5a9038] text-white"
                    >
                      <Plus className="h-4 w-4" />
                      Crear primer turno
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </section>
        </div>
      </main>

      <Footer />

      <Dialog
        open={isFormOpen}
        onOpenChange={(open) => {
          setIsFormOpen(open);
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
                {evento.nombre}
              </p>
              <p className="text-sm text-muted-foreground dark:text-gray-300">
                {formatDate(evento.fecha)} - {evento.ubicacion}
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
                    <Label
                      htmlFor="cant_mesas_edit"
                      className="dark:text-white"
                    >
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
            <Button variant="outline" onClick={() => setIsFormOpen(false)}>
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

      <GestionarAsientosModal
        isOpen={Boolean(turnoGestionado)}
        onClose={() => setTurnoGestionado(null)}
        turnoGestionado={turnoGestionado}
        evento={evento}
        loadTurnos={loadTurnos}
      />
    </div>
  );
}
