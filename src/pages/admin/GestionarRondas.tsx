import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  MapPin,
  Pencil,
  Plus,
  Sparkles,
  XCircle,
} from "lucide-react";
import Navbar from "../../components/Navbar";
import Footer from "../../layout/Footer";
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
import {
  createEvento,
  getEventos,
  updateEvento,
} from "../../api/EventoService";
import type { EventoResponse, EventoWrite } from "../../types/Evento";
import { getApiErrorMessage, isSessionExpiredError } from "../../lib/axios";

type EstadoEvento = EventoWrite["estado"];
type FiltroEstado = "todos" | EstadoEvento;
type CreateFormErrors = Partial<
  Record<"nombre" | "fecha" | "ubicacion", string>
>;

function isCreateField(
  field: keyof EventoWrite,
): field is keyof CreateFormErrors {
  return field === "nombre" || field === "fecha" || field === "ubicacion";
}

const initialFormState: EventoWrite = {
  nombre: "",
  fecha: new Date().toISOString().split("T")[0],
  ubicacion: "",
  estado: "activo",
};

const statusOptions: Array<{
  value: EstadoEvento;
  label: string;
  badgeClassName: string;
}> = [
  {
    value: "activo",
    label: "Activa",
    badgeClassName:
      "bg-[#68A243]/15 text-[#3F6E20] border-[#68A243]/30 dark:bg-[#68A243]/20 dark:text-[#9FD27B] dark:border-[#68A243]/40",
  },
  {
    value: "finalizado",
    label: "Finalizada",
    badgeClassName:
      "bg-[#143E29]/10 text-[#143E29] border-[#143E29]/20 dark:bg-[#143E29]/40 dark:text-white dark:border-[#143E29]/60",
  },
  {
    value: "cancelado",
    label: "Cancelada",
    badgeClassName:
      "bg-red-100 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-300 dark:border-red-800/50",
  },
];

function formatDate(date: string) {
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(`${date}T00:00:00`));
}

function generateEventNameFromDate(date: string) {
  const selectedDate = date ? new Date(`${date}T00:00:00`) : new Date();
  const formattedDate = new Intl.DateTimeFormat("es-AR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(selectedDate);

  return `Ronda del ${formattedDate.charAt(0).toUpperCase()}${formattedDate.slice(1)}`;
}

function getStatusMeta(status: EstadoEvento | EventoResponse["estado"]) {
  return (
    statusOptions.find((option) => option.value === status) ?? statusOptions[0]
  );
}

function getDateValue(date: string) {
  return new Date(`${date}T00:00:00`).getTime();
}

function getCurrentEvento(eventos: EventoResponse[]) {
  return eventos.find((evento) => evento.estado === "activo") ?? null;
}

function getEventSortValue(event: EventoResponse) {
  const dateValue = getDateValue(event.fecha);
  const priority =
    event.estado === "activo" ? 0 : event.estado === "finalizado" ? 1 : 2;
  return { priority, dateValue };
}

function getEventStatusLabel(status?: EventoResponse["estado"]) {
  switch (status) {
    case "finalizado":
      return "Evento finalizado";
    case "cancelado":
      return "Evento cancelado";
    case "activo":
    default:
      return "Evento activo";
  }
}

function getPreferredEventoId(
  eventos: EventoResponse[],
  currentSelectedId: number | null,
) {
  if (
    currentSelectedId !== null &&
    eventos.some((evento) => evento.id === currentSelectedId)
  ) {
    return currentSelectedId;
  }

  return eventos.find((evento) => evento.estado === "activo")?.id ?? null;
}

function hasValidEventoId(
  evento: EventoResponse,
): evento is EventoResponse & { id: number } {
  return typeof evento.id === "number" && Number.isFinite(evento.id);
}

function HeroSkeleton() {
  return (
    <section className="rounded-3xl bg-gradient-to-br from-[#143E29] via-[#1a5236] to-[#143E29] px-6 py-8 md:px-8 shadow-xl shadow-[#143E29]/10">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl w-full space-y-4">
          <Skeleton className="h-10 w-24 bg-white/10" />
          <div className="flex items-center gap-3">
            <Skeleton className="h-11 w-11 rounded-2xl bg-white/10" />
            <Skeleton className="h-10 w-60 bg-white/10" />
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

function CurrentRoundSkeleton() {
  return (
    <Card className="border-[#68A243]/20 overflow-hidden">
      <CardHeader className="border-b border-[#68A243]/10 dark:border-[#68A243]/20">
        <Skeleton className="h-7 w-44 dark:bg-[#0f2f25]" />
      </CardHeader>
      <CardContent className="pt-6">
        <div className="rounded-2xl border border-[#68A243]/30 bg-gradient-to-br from-[#68A243]/10 to-white dark:from-[#68A243]/15 dark:to-[#143E29] p-5 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-2 w-full max-w-sm">
              <Skeleton className="h-4 w-24 dark:bg-[#0f2f25]" />
              <Skeleton className="h-8 w-full dark:bg-[#0f2f25]" />
            </div>
            <Skeleton className="h-6 w-24 rounded-full dark:bg-[#0f2f25]" />
          </div>

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

          <div className="space-y-2">
            <Skeleton className="h-4 w-36 dark:bg-[#0f2f25]" />
            <Skeleton className="h-10 w-full dark:bg-[#0f2f25]" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function RoundListSkeleton() {
  return (
    <Card className="border-[#68A243]/20">
      <CardHeader className="border-b border-[#68A243]/10 dark:border-[#68A243]/20">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <Skeleton className="h-7 w-40 dark:bg-[#0f2f25]" />

          <div className="flex flex-col sm:flex-row gap-3">
            <Skeleton className="h-10 w-full sm:w-64 dark:bg-[#0f2f25]" />
            <Skeleton className="h-10 w-full sm:w-44 dark:bg-[#0f2f25]" />
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-6 space-y-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="rounded-2xl border border-gray-200 bg-white dark:bg-[#143E29] dark:border-[#68A243]/20 p-5"
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-3 w-full max-w-md">
                <div className="flex flex-wrap items-center gap-2">
                  <Skeleton className="h-7 w-48 dark:bg-[#0f2f25]" />
                  <Skeleton className="h-6 w-24 rounded-full dark:bg-[#0f2f25]" />
                </div>

                <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4 rounded-full dark:bg-[#0f2f25]" />
                    <Skeleton className="h-4 w-32 dark:bg-[#0f2f25]" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4 rounded-full dark:bg-[#0f2f25]" />
                    <Skeleton className="h-4 w-40 dark:bg-[#0f2f25]" />
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 lg:min-w-max">
                <Skeleton className="h-10 w-36 dark:bg-[#0f2f25]" />
                <Skeleton className="h-10 w-28 dark:bg-[#0f2f25]" />
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export default function GestionarRondas() {
  const navigate = useNavigate();
  const [eventos, setEventos] = useState<EventoResponse[]>([]);
  const [selectedEventoId, setSelectedEventoId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<FiltroEstado>("todos");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [eventoEnEdicion, setEventoEnEdicion] = useState<EventoResponse | null>(
    null,
  );
  const [formData, setFormData] = useState<EventoWrite>(initialFormState);
  const [formErrors, setFormErrors] = useState<CreateFormErrors>({});
  const isEditingStateOnly = Boolean(eventoEnEdicion);

  useEffect(() => {
    const fetchEventos = async () => {
      try {
        setIsLoading(true);
        const data = await getEventos();
        setEventos(data.filter(hasValidEventoId));
      } catch (error) {
        console.error("Error loading events:", error);
        if (!isSessionExpiredError(error)) {
          toast.error("No se pudieron cargar las rondas de negocios");
        }
        setEventos([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEventos();
  }, []);

  const eventosOrdenados = useMemo(() => {
    return eventos.filter(hasValidEventoId).sort((first, second) => {
      const a = getEventSortValue(first);
      const b = getEventSortValue(second);

      if (a.priority !== b.priority) {
        return a.priority - b.priority;
      }

      return b.dateValue - a.dateValue;
    });
  }, [eventos]);

  const rondaActual = useMemo(() => {
    return getCurrentEvento(eventos.filter(hasValidEventoId));
  }, [eventos]);

  const eventosActivosOrdenados = useMemo(
    () => eventosOrdenados.filter((evento) => evento.estado === "activo"),
    [eventosOrdenados],
  );

  const eventoSeleccionado = useMemo(
    () =>
      eventosActivosOrdenados.find(
        (evento) => evento.id === selectedEventoId,
      ) ?? null,
    [eventosActivosOrdenados, selectedEventoId],
  );

  useEffect(() => {
    setSelectedEventoId((currentSelectedId) =>
      getPreferredEventoId(eventosActivosOrdenados, currentSelectedId),
    );
  }, [eventosActivosOrdenados]);

  const eventosFiltrados = useMemo(() => {
    return eventosOrdenados.filter((evento) => {
      const normalizedSearchTerm = searchTerm.toLowerCase();
      const normalizedNombre = (evento.nombre ?? "").toLowerCase();
      const normalizedUbicacion = (evento.ubicacion ?? "").toLowerCase();

      const matchesSearch =
        normalizedNombre.includes(normalizedSearchTerm) ||
        normalizedUbicacion.includes(normalizedSearchTerm);

      const matchesStatus =
        filterStatus === "todos" ? true : evento.estado === filterStatus;

      return matchesSearch && matchesStatus;
    });
  }, [eventosOrdenados, filterStatus, searchTerm]);

  const stats = useMemo(
    () => ({
      total: eventos.length,
      activas: eventos.filter((evento) => evento.estado === "activo").length,
      finalizadas: eventos.filter((evento) => evento.estado === "finalizado")
        .length,
      canceladas: eventos.filter((evento) => evento.estado === "cancelado")
        .length,
    }),
    [eventos],
  );

  const resetForm = () => {
    setFormData(initialFormState);
    setFormErrors({});
    setEventoEnEdicion(null);
  };

  const openCreateDialog = () => {
    resetForm();
    setIsFormOpen(true);
  };

  const openEditDialog = (evento: EventoResponse) => {
    setEventoEnEdicion(evento);
    setFormData({
      nombre: evento.nombre,
      fecha: evento.fecha,
      ubicacion: evento.ubicacion,
      estado: evento.estado ?? "activo",
    });
    setIsFormOpen(true);
  };

  const handleFormChange = <K extends keyof EventoWrite>(
    field: K,
    value: EventoWrite[K],
  ) => {
    setFormData((current) => ({ ...current, [field]: value }));

    if (isCreateField(field) && formErrors[field]) {
      const normalizedValue =
        typeof value === "string" ? value.trim() : String(value).trim();

      if (normalizedValue) {
        setFormErrors((current) => ({
          ...current,
          [field]: undefined,
        }));
      }
    }
  };

  const validateCreateForm = () => {
    const nextErrors: CreateFormErrors = {};

    if (!formData.nombre.trim()) {
      nextErrors.nombre = "Ingresá un nombre";
    }

    if (!formData.fecha) {
      nextErrors.fecha = "Seleccioná una fecha";
    }

    if (!formData.ubicacion.trim()) {
      nextErrors.ubicacion = "Ingresá una ubicación";
    }

    setFormErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!isEditingStateOnly && !validateCreateForm()) {
      toast.error("Completá nombre, fecha y ubicación antes de guardar");
      return;
    }

    try {
      setIsSaving(true);

      if (eventoEnEdicion) {
        await updateEvento(eventoEnEdicion.id, {
          estado: formData.estado,
        });
        const refreshedEventos = await getEventos();
        setEventos(refreshedEventos.filter(hasValidEventoId));
        toast.success("El estado de la ronda fue actualizado correctamente");
      } else {
        await createEvento(formData);
        const refreshedEventos = await getEventos();
        setEventos(refreshedEventos.filter(hasValidEventoId));
        toast.success("La ronda fue creada correctamente");
      }

      setIsFormOpen(false);
      resetForm();
    } catch (error) {
      const message = getApiErrorMessage(
        error,
        "Ocurrió un error al guardar la ronda",
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

            <section className="grid grid-cols-1 xl:grid-cols-[1.2fr_2fr] gap-6">
              <CurrentRoundSkeleton />
              <RoundListSkeleton />
            </section>
          </div>
        </main>
        <Footer />
      </div>
    );
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
                    <CalendarDays className="h-5 w-5" />
                  </div>
                  <h1 className="text-3xl sm:text-4xl font-semibold">
                    Gestionar rondas
                  </h1>
                </div>
                <p className="text-white/80 text-base max-w-2xl">
                  Creá nuevas rondas y gestioná rápidamente cuál es la activa.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={openCreateDialog}
                  className="h-11 px-5 bg-[#68A243] hover:bg-[#5a9038] text-white shadow-lg shadow-[#68A243]/20"
                >
                  <Plus className="h-4 w-4" />
                  Nueva ronda
                </Button>
              </div>
            </div>
          </section>

          <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            <Card className="!gap-2 !py-3 border-[#68A243]/20">
              <CardHeader className="!px-5 !pb-0">
                <CardTitle className="text-sm text-muted-foreground dark:text-gray-300">
                  Total de rondas
                </CardTitle>
              </CardHeader>
              <CardContent className="!px-5 !pt-0">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-3xl font-bold leading-none text-[#143E29] dark:text-white">
                    {stats.total}
                  </div>
                  <div className="rounded-full bg-[#143E29]/8 p-2 dark:bg-[#143E29]/35">
                    <CalendarDays className="h-3.5 w-3.5 text-[#143E29] dark:text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="!gap-2 !py-3 border-[#68A243]/20">
              <CardHeader className="!px-5 !pb-0">
                <CardTitle className="text-sm text-muted-foreground dark:text-gray-300">
                  Activas
                </CardTitle>
              </CardHeader>
              <CardContent className="!px-5 !pt-0">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-3xl font-bold leading-none text-[#68A243]">
                    {stats.activas}
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
                  Finalizadas
                </CardTitle>
              </CardHeader>
              <CardContent className="!px-5 !pt-0">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-3xl font-bold leading-none text-[#143E29] dark:text-white">
                    {stats.finalizadas}
                  </div>
                  <div className="rounded-full bg-[#143E29]/10 p-2 dark:bg-[#143E29]/40">
                    <Clock3 className="h-3.5 w-3.5 text-[#143E29] dark:text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="!gap-2 !py-3 border-[#68A243]/20">
              <CardHeader className="!px-5 !pb-0">
                <CardTitle className="text-sm text-muted-foreground dark:text-gray-300">
                  Canceladas
                </CardTitle>
              </CardHeader>
              <CardContent className="!px-5 !pt-0">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-3xl font-bold leading-none text-red-600 dark:text-red-300">
                    {stats.canceladas}
                  </div>
                  <div className="rounded-full bg-red-100 p-2 dark:bg-red-950/30">
                    <XCircle className="h-3.5 w-3.5 text-red-600 dark:text-red-300" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          <section className="grid grid-cols-1 xl:grid-cols-[1.2fr_2fr] gap-6">
            <Card className="border-[#68A243]/20 overflow-hidden">
              <CardHeader className="border-b border-[#68A243]/10 dark:border-[#68A243]/20">
                <CardTitle className="text-xl text-[#143E29] dark:text-white">
                  Ronda seleccionada
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                {eventoSeleccionado ? (
                  <div className="rounded-2xl border border-[#68A243]/30 bg-gradient-to-br from-[#68A243]/10 to-white dark:from-[#68A243]/15 dark:to-[#143E29] p-5 space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-[#68A243] mb-1">
                          {getEventStatusLabel(eventoSeleccionado.estado)}
                        </p>
                        <h2 className="text-2xl font-semibold text-[#143E29] dark:text-white">
                          {eventoSeleccionado.nombre}
                        </h2>
                      </div>

                      <div className="flex flex-wrap items-center justify-end gap-2">
                        <Badge
                          className={
                            getStatusMeta(eventoSeleccionado.estado)
                              .badgeClassName
                          }
                        >
                          {getStatusMeta(eventoSeleccionado.estado).label}
                        </Badge>
                        {rondaActual?.id === eventoSeleccionado.id &&
                        eventoSeleccionado.estado === "activo" ? (
                          <Badge className="bg-[#143E29] text-white border-transparent dark:bg-[#68A243]">
                            Ronda actual
                          </Badge>
                        ) : null}
                      </div>
                    </div>

                    <div className="space-y-3 text-sm text-gray-700 dark:text-gray-200">
                      <div className="flex items-center gap-2">
                        <CalendarDays className="h-4 w-4 text-[#68A243]" />
                        <span>{formatDate(eventoSeleccionado.fecha)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-[#68A243]" />
                        <span>{eventoSeleccionado.ubicacion}</span>
                      </div>
                    </div>

                    <Button
                      className="w-full bg-[#68A243] hover:bg-[#5a9038] text-white"
                      onClick={() =>
                        navigate(
                          `/panel-administrador/turnos/${eventoSeleccionado.id}`,
                        )
                      }
                    >
                      <Clock3 className="h-4 w-4" />
                      Gestionar turnos
                    </Button>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-[#143E29] dark:text-white">
                        Seleccionar otra ronda
                      </Label>
                      <Select
                        value={eventoSeleccionado.id.toString()}
                        onValueChange={(value) =>
                          setSelectedEventoId(Number(value))
                        }
                      >
                        <SelectTrigger className="w-full border-[#68A243]/20 focus-visible:border-[#68A243] focus-visible:ring-[#68A243]/20 dark:bg-[#143E29] dark:border-[#68A243]/20 dark:text-white transition-colors">
                          <SelectValue placeholder="Seleccionar ronda" />
                        </SelectTrigger>
                        <SelectContent>
                          {eventosActivosOrdenados.map((evento) => (
                            <SelectItem
                              key={evento.id}
                              value={evento.id.toString()}
                            >
                              {evento.nombre}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-[#68A243]/30 bg-[#68A243]/5 dark:bg-[#143E29]/60 p-6 text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#68A243]/10 dark:bg-[#68A243]/20">
                      <CalendarDays className="h-6 w-6 text-[#68A243]" />
                    </div>
                    <h3 className="text-lg font-semibold text-[#143E29] dark:text-white mb-2">
                      No hay rondas activas
                    </h3>
                    <p className="text-sm text-muted-foreground dark:text-gray-300 mb-5">
                      Creá una ronda activa o cambiá el estado de una existente
                      para poder gestionar sus turnos.
                    </p>
                    <Button
                      onClick={openCreateDialog}
                      className="bg-[#68A243] hover:bg-[#5a9038] text-white"
                    >
                      <Plus className="h-4 w-4" />
                      Crear primera ronda activa
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-[#68A243]/20 xl:self-start">
              <CardHeader className="border-b border-[#68A243]/10 dark:border-[#68A243]/20">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <CardTitle className="text-xl text-[#143E29] dark:text-white">
                    Todas las rondas
                  </CardTitle>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <Input
                      value={searchTerm}
                      onChange={(event) => setSearchTerm(event.target.value)}
                      placeholder="Buscar por nombre o ubicación"
                      className="w-full sm:w-64 border-[#68A243]/20 focus-visible:border-[#68A243] focus-visible:ring-[#68A243]/20 dark:bg-[#143E29] dark:border-[#68A243]/20 dark:text-white dark:placeholder-gray-400 transition-colors"
                    />

                    <Select
                      value={filterStatus}
                      onValueChange={(value) =>
                        setFilterStatus(value as FiltroEstado)
                      }
                    >
                      <SelectTrigger className="w-full sm:w-44 border-[#68A243]/20 dark:bg-[#143E29] dark:border-[#68A243]/20 dark:text-white transition-colors">
                        <SelectValue placeholder="Filtrar estado" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todos los estados</SelectItem>
                        {statusOptions.map((status) => (
                          <SelectItem key={status.value} value={status.value}>
                            {status.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-6">
                {eventosFiltrados.length > 0 ? (
                  <ScrollArea className="xl:h-[calc(100vh-23rem)] xl:min-h-[28rem] xl:pr-4">
                    <div className="space-y-4 pr-1">
                      {eventosFiltrados.map((evento) => {
                        const statusMeta = getStatusMeta(evento.estado);
                        const isCurrent =
                          rondaActual?.id === evento.id &&
                          evento.estado === "activo";

                        return (
                          <div
                            key={evento.id}
                            className={[
                              "rounded-2xl border p-5 transition-all duration-300",
                              isCurrent
                                ? "border-[#68A243]/40 bg-gradient-to-r from-[#68A243]/10 via-white to-white dark:from-[#68A243]/10 dark:via-[#143E29] dark:to-[#143E29] shadow-lg shadow-[#68A243]/10"
                                : "border-gray-200 bg-white dark:bg-[#143E29] dark:border-[#68A243]/20",
                            ].join(" ")}
                          >
                            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                              <div className="space-y-3">
                                <div className="flex flex-wrap items-center gap-2">
                                  <h3 className="text-xl font-semibold text-[#143E29] dark:text-white">
                                    {evento.nombre}
                                  </h3>
                                  <Badge className={statusMeta.badgeClassName}>
                                    {statusMeta.label}
                                  </Badge>
                                  {isCurrent && (
                                    <Badge className="bg-[#143E29] text-white border-transparent dark:bg-[#68A243]">
                                      Ronda actual
                                    </Badge>
                                  )}
                                </div>

                                <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 text-sm text-gray-600 dark:text-gray-300">
                                  <div className="flex items-center gap-2">
                                    <CalendarDays className="h-4 w-4 text-[#68A243]" />
                                    <span>{formatDate(evento.fecha)}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-[#68A243]" />
                                    <span>{evento.ubicacion}</span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex flex-col sm:flex-row gap-2 lg:min-w-max">
                                <Button
                                  variant="outline"
                                  onClick={() => openEditDialog(evento)}
                                  className="border-[#68A243]/30 text-[#68A243] hover:bg-[#68A243] hover:text-white"
                                >
                                  <Pencil className="h-4 w-4" />
                                  Cambiar estado
                                </Button>
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
                      No hay rondas para mostrar
                    </h3>
                    <p className="text-sm text-muted-foreground dark:text-gray-300">
                      Ajustá los filtros o creá una nueva ronda para empezar a
                      gestionar eventos.
                    </p>
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
              {eventoEnEdicion
                ? "Cambiar estado de la ronda"
                : "Crear nueva ronda"}
            </DialogTitle>
            <DialogDescription className="dark:text-gray-300">
              {eventoEnEdicion
                ? "El backend solo permite actualizar el estado. Los demás datos se muestran como referencia."
                : "Definí el nombre, la fecha, la ubicación y el estado del evento."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            {eventoEnEdicion ? (
              <>
                <div className="rounded-2xl border border-[#68A243]/20 bg-[#68A243]/5 dark:bg-[#143E29]/60 p-4 space-y-3">
                  <div className="grid gap-1">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground dark:text-gray-300">
                      Nombre
                    </p>
                    <p className="text-base font-semibold text-[#143E29] dark:text-white">
                      {eventoEnEdicion.nombre}
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground dark:text-gray-300 mb-1">
                        Fecha
                      </p>
                      <p className="text-[#143E29] dark:text-white">
                        {formatDate(eventoEnEdicion.fecha)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground dark:text-gray-300 mb-1">
                        Ubicación
                      </p>
                      <p className="text-[#143E29] dark:text-white">
                        {eventoEnEdicion.ubicacion}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label className="dark:text-white">Nuevo estado</Label>
                  <Select
                    value={formData.estado}
                    onValueChange={(value) =>
                      handleFormChange("estado", value as EstadoEvento)
                    }
                  >
                    <SelectTrigger className="w-full border-[#68A243]/20 focus-visible:border-[#68A243] focus-visible:ring-[#68A243]/20 dark:bg-[#143E29] dark:border-[#68A243]/20 dark:text-white transition-colors">
                      <SelectValue placeholder="Seleccionar estado" />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((status) => (
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
                <div className="grid gap-2">
                  <Label htmlFor="nombre" className="dark:text-white">
                    Nombre
                  </Label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Input
                      id="nombre"
                      value={formData.nombre}
                      onChange={(event) =>
                        handleFormChange("nombre", event.target.value)
                      }
                      placeholder="Ej: Ronda de Negocios Otoño 2026"
                      aria-invalid={!!formErrors.nombre}
                      className="border-[#68A243]/20 focus-visible:border-[#68A243] focus-visible:ring-[#68A243]/20 dark:bg-[#143E29] dark:border-[#68A243]/20 dark:text-white dark:placeholder-gray-400 transition-colors aria-invalid:border-red-500 aria-invalid:ring-red-500/20"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        handleFormChange(
                          "nombre",
                          generateEventNameFromDate(formData.fecha),
                        )
                      }
                      className="shrink-0 border-[#68A243]/30 text-[#68A243] hover:bg-[#68A243] hover:text-white"
                    >
                      <Sparkles className="h-4 w-4" />
                    </Button>
                  </div>
                  {formErrors.nombre ? (
                    <p className="text-red-600 text-xs">{formErrors.nombre}</p>
                  ) : null}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="fecha" className="dark:text-white">
                      Fecha
                    </Label>
                    <Input
                      id="fecha"
                      type="date"
                      value={formData.fecha}
                      onChange={(event) =>
                        handleFormChange("fecha", event.target.value)
                      }
                      aria-invalid={!!formErrors.fecha}
                      className="border-[#68A243]/20 focus-visible:border-[#68A243] focus-visible:ring-[#68A243]/20 dark:bg-[#143E29] dark:border-[#68A243]/20 dark:text-white transition-colors [color-scheme:light] dark:[color-scheme:dark] aria-invalid:border-red-500 aria-invalid:ring-red-500/20"
                    />
                    {formErrors.fecha ? (
                      <p className="text-red-600 text-xs">{formErrors.fecha}</p>
                    ) : null}
                  </div>

                  <div className="grid gap-2">
                    <Label className="dark:text-white">Estado</Label>
                    <Select
                      value={formData.estado}
                      onValueChange={(value) =>
                        handleFormChange("estado", value as EstadoEvento)
                      }
                    >
                      <SelectTrigger className="w-full border-[#68A243]/20 focus-visible:border-[#68A243] focus-visible:ring-[#68A243]/20 dark:bg-[#143E29] dark:border-[#68A243]/20 dark:text-white transition-colors">
                        <SelectValue placeholder="Seleccionar estado" />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map((status) => (
                          <SelectItem key={status.value} value={status.value}>
                            {status.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="ubicacion" className="dark:text-white">
                    Ubicación
                  </Label>
                  <Input
                    id="ubicacion"
                    value={formData.ubicacion}
                    onChange={(event) =>
                      handleFormChange("ubicacion", event.target.value)
                    }
                    placeholder="Ej: Polo Científico Tecnológico"
                    aria-invalid={!!formErrors.ubicacion}
                    className="border-[#68A243]/20 focus-visible:border-[#68A243] focus-visible:ring-[#68A243]/20 dark:bg-[#143E29] dark:border-[#68A243]/20 dark:text-white dark:placeholder-gray-400 transition-colors aria-invalid:border-red-500 aria-invalid:ring-red-500/20"
                  />
                  {formErrors.ubicacion ? (
                    <p className="text-red-600 text-xs">
                      {formErrors.ubicacion}
                    </p>
                  ) : null}
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
                : eventoEnEdicion
                  ? "Actualizar estado"
                  : "Crear ronda"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
