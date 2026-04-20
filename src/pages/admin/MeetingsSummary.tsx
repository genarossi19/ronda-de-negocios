import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import {
  ArrowLeft,
  Building2,
  Clock3,
  Download,
  RotateCcw,
  Handshake,
  LayoutGrid,
  Mail,
  Search,
  TableProperties,
  UserRound,
  Users,
} from "lucide-react";
import Navbar from "../../components/Navbar";
import Footer from "../../layout/Footer";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Skeleton } from "../../components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import { ScrollArea } from "../../components/ui/scroll-area";
import { toast } from "sonner";
import { getEventos } from "../../api/EventoService";
import { getMesasByTurnoId } from "../../api/MesaService";
import { getTurnoByEventoId } from "../../api/TurnoService";
import { getApiErrorMessage, isSessionExpiredError } from "../../lib/axios";
import type { EventoResponse } from "../../types/Evento";
import type { MesaResponse } from "../../types/Mesa";
import type { TurnoResponse } from "../../types/Turno";

type SummarySeatRow = {
  key: string;
  eventoId: number;
  eventoNombre: string;
  eventoFecha: string;
  turnoId: number;
  turnoHorario: string;
  turnoEstado: TurnoResponse["estado"];
  mesaId: number;
  mesaNumero: number;
  ocupacionActual: number;
  empresaNombre: string;
  representanteNombre: string;
  representanteEmail: string;
  anfitriona: boolean;
  estadoMesa: "libre" | "parcial" | "completa";
};

type TableSummary = {
  key: string;
  mesaId: number;
  mesaNumero: number;
  turnoId: number;
  turnoHorario: string;
  turnoEstado: TurnoResponse["estado"];
  ocupacionActual: number;
  estadoMesa: "libre" | "parcial" | "completa";
  anfitrionaEmpresa: string | null;
  participantes: Array<{
    asientoId: number;
    empresaNombre: string;
    representanteNombre: string;
    representanteEmail: string;
    anfitriona: boolean;
  }>;
};

function sortTurnos(turnos: TurnoResponse[]) {
  return [...turnos].sort((firstTurno, secondTurno) => {
    if (firstTurno.hora_inicio === secondTurno.hora_inicio) {
      return firstTurno.id - secondTurno.id;
    }

    return firstTurno.hora_inicio.localeCompare(secondTurno.hora_inicio);
  });
}

function formatDate(value?: string) {
  if (!value) {
    return "Sin fecha";
  }

  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}

function formatTurnoStatus(status: TurnoResponse["estado"]) {
  if (status === "abierto") {
    return {
      label: "Abierto",
      className:
        "bg-[#68A243]/15 text-[#3F6E20] border-[#68A243]/30 dark:bg-[#68A243]/20 dark:text-[#9FD27B] dark:border-[#68A243]/40",
    };
  }

  if (status === "full") {
    return {
      label: "Completo",
      className:
        "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-800/50",
    };
  }

  return {
    label: "Cerrado",
    className:
      "bg-[#143E29]/10 text-[#143E29] border-[#143E29]/20 dark:bg-[#143E29]/40 dark:text-white dark:border-[#143E29]/60",
  };
}

function formatOccupancyState(count: number): SummarySeatRow["estadoMesa"] {
  if (count >= 2) {
    return "completa";
  }

  if (count === 1) {
    return "parcial";
  }

  return "libre";
}

function getOccupancyBadge(state: SummarySeatRow["estadoMesa"]) {
  if (state === "completa") {
    return {
      label: "Completa",
      className:
        "bg-[#143E29]/10 text-[#143E29] border-[#143E29]/20 dark:bg-[#143E29]/40 dark:text-white dark:border-[#143E29]/60",
    };
  }

  if (state === "parcial") {
    return {
      label: "Parcial",
      className:
        "bg-[#F5891F]/15 text-[#B45F0C] border-[#F5891F]/30 dark:bg-[#F5891F]/15 dark:text-[#FFC98F] dark:border-[#F5891F]/30",
    };
  }

  return {
    label: "Libre",
    className:
      "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800/60 dark:text-slate-200 dark:border-slate-700",
  };
}

function escapeCsvValue(value: string | number | boolean) {
  return `"${String(value).replace(/"/g, '""')}"`;
}

function downloadCsv(rows: SummarySeatRow[], eventName: string) {
  const headers = [
    "Evento",
    "Fecha",
    "Turno",
    "Estado del turno",
    "Mesa",
    "Ocupacion actual",
    "Estado de la mesa",
    "Empresa",
    "Representante",
    "Email representante",
    "Es anfitriona",
  ];

  const content = [
    headers.map(escapeCsvValue).join(","),
    ...rows.map((row) =>
      [
        row.eventoNombre,
        row.eventoFecha,
        row.turnoHorario,
        row.turnoEstado,
        `Mesa ${row.mesaNumero}`,
        `${row.ocupacionActual}/2`,
        row.estadoMesa,
        row.empresaNombre || "Sin ocupar",
        row.representanteNombre || "Sin representante",
        row.representanteEmail || "",
        row.anfitriona ? "Si" : "No",
      ]
        .map(escapeCsvValue)
        .join(","),
    ),
  ].join("\n");

  const blob = new Blob([`\uFEFF${content}`], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const safeName = eventName
    .toLowerCase()
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-+|-+$/g, "");

  link.href = url;
  link.download = `resumen-reuniones-${safeName || "evento"}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function HeroSkeleton() {
  return (
    <section className="rounded-3xl bg-gradient-to-br from-[#143E29] via-[#1a5236] to-[#143E29] px-6 py-8 md:px-8 shadow-xl shadow-[#143E29]/10">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl w-full space-y-3">
          <div className="flex items-center gap-3">
            <Skeleton className="h-11 w-11 rounded-2xl bg-white/10" />
            <Skeleton className="h-10 w-72 bg-white/10" />
          </div>
          <Skeleton className="h-5 w-full max-w-2xl bg-white/10" />
        </div>

        <div className="flex gap-3">
          <Skeleton className="h-11 w-32 bg-white/10" />
          <Skeleton className="h-11 w-40 bg-white/10" />
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

function MeetingCardSkeleton() {
  return (
    <Card className="border-[#68A243]/20 dark:border-[#68A243]/25 dark:bg-[#143E29]">
      <CardHeader className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <Skeleton className="h-7 w-28 dark:bg-[#0f2f25]" />
          <Skeleton className="h-6 w-20 rounded-full dark:bg-[#0f2f25]" />
        </div>
        <Skeleton className="h-4 w-44 dark:bg-[#0f2f25]" />
      </CardHeader>
      <CardContent className="space-y-3">
        {Array.from({ length: 2 }).map((_, index) => (
          <Skeleton
            key={index}
            className="h-16 w-full rounded-2xl dark:bg-[#0f2f25]"
          />
        ))}
      </CardContent>
    </Card>
  );
}

export default function MeetingsSummary() {
  const navigate = useNavigate();
  const [eventos, setEventos] = useState<EventoResponse[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [turnoFilter, setTurnoFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeView, setActiveView] = useState<"mesas" | "tabla">("tabla");
  const [selectedTableSummary, setSelectedTableSummary] =
    useState<TableSummary | null>(null);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  const [summaryRows, setSummaryRows] = useState<SummarySeatRow[]>([]);
  const [tableSummaries, setTableSummaries] = useState<TableSummary[]>([]);

  useEffect(() => {
    const fetchEventos = async () => {
      try {
        setIsLoadingEvents(true);
        const eventosData = await getEventos();
        const availableEventos = eventosData
          .filter((evento) => evento.estado !== "cancelado")
          .sort((firstEvento, secondEvento) => {
            if (
              firstEvento.estado === "activo" &&
              secondEvento.estado !== "activo"
            ) {
              return -1;
            }

            if (
              firstEvento.estado !== "activo" &&
              secondEvento.estado === "activo"
            ) {
              return 1;
            }

            return secondEvento.id - firstEvento.id;
          });

        setEventos(availableEventos);

        if (availableEventos.length > 0) {
          setSelectedEventId((currentValue) => {
            if (
              currentValue &&
              availableEventos.some(
                (evento) => String(evento.id) === String(currentValue),
              )
            ) {
              return currentValue;
            }

            return String(availableEventos[0].id);
          });
        }
      } catch (error) {
        if (!isSessionExpiredError(error)) {
          const message = getApiErrorMessage(
            error,
            "No se pudo cargar el listado de rondas",
          );
          toast.error(message);
        }
      } finally {
        setIsLoadingEvents(false);
      }
    };

    fetchEventos();
  }, []);

  useEffect(() => {
    const eventId = Number(selectedEventId);

    if (!eventId || Number.isNaN(eventId)) {
      setSummaryRows([]);
      setTableSummaries([]);
      setSelectedTableSummary(null);
      return;
    }

    const selectedEvent = eventos.find((evento) => evento.id === eventId);

    if (!selectedEvent) {
      return;
    }

    const fetchSummary = async () => {
      try {
        setIsLoadingSummary(true);
        setTurnoFilter("all");
        setSelectedTableSummary(null);

        const turnos = sortTurnos(await getTurnoByEventoId(selectedEvent.id));
        const mesasByTurno = await Promise.all(
          turnos.map(async (turno) => ({
            turno,
            mesas: await getMesasByTurnoId(turno.id),
          })),
        );

        const nextRows: SummarySeatRow[] = [];
        const nextTableSummaries: TableSummary[] = [];

        mesasByTurno.forEach(({ turno, mesas }) => {
          mesas
            .sort(
              (firstMesa, secondMesa) =>
                firstMesa.num_mesa - secondMesa.num_mesa,
            )
            .forEach((mesa: MesaResponse) => {
              const ocupacionActual = mesa.asientos.length;
              const estadoMesa = formatOccupancyState(ocupacionActual);
              const turnoHorario = `${turno.hora_inicio} - ${turno.hora_fin}`;
              const participantes = mesa.asientos.map((asiento) => ({
                asientoId: asiento.id,
                empresaNombre: asiento.empresa_nombre,
                representanteNombre: [
                  asiento.representante_nombre,
                  asiento.representante_apellido,
                ]
                  .filter(Boolean)
                  .join(" "),
                representanteEmail: asiento.representante_email ?? "",
                anfitriona: Boolean(asiento.anfitriona),
              }));

              nextTableSummaries.push({
                key: `${turno.id}-${mesa.id}`,
                mesaId: mesa.id,
                mesaNumero: mesa.num_mesa,
                turnoId: turno.id,
                turnoHorario,
                turnoEstado: turno.estado,
                ocupacionActual,
                estadoMesa,
                anfitrionaEmpresa:
                  participantes.find((participante) => participante.anfitriona)
                    ?.empresaNombre ?? null,
                participantes,
              });

              if (mesa.asientos.length === 0) {
                nextRows.push({
                  key: `${turno.id}-${mesa.id}-empty`,
                  eventoId: selectedEvent.id,
                  eventoNombre: selectedEvent.nombre,
                  eventoFecha: selectedEvent.fecha,
                  turnoId: turno.id,
                  turnoHorario,
                  turnoEstado: turno.estado,
                  mesaId: mesa.id,
                  mesaNumero: mesa.num_mesa,
                  ocupacionActual,
                  empresaNombre: "",
                  representanteNombre: "",
                  representanteEmail: "",
                  anfitriona: false,
                  estadoMesa,
                });
                return;
              }

              mesa.asientos.forEach((asiento) => {
                nextRows.push({
                  key: `${turno.id}-${mesa.id}-${asiento.id}`,
                  eventoId: selectedEvent.id,
                  eventoNombre: selectedEvent.nombre,
                  eventoFecha: selectedEvent.fecha,
                  turnoId: turno.id,
                  turnoHorario,
                  turnoEstado: turno.estado,
                  mesaId: mesa.id,
                  mesaNumero: mesa.num_mesa,
                  ocupacionActual,
                  empresaNombre: asiento.empresa_nombre,
                  representanteNombre: [
                    asiento.representante_nombre,
                    asiento.representante_apellido,
                  ]
                    .filter(Boolean)
                    .join(" "),
                  representanteEmail: asiento.representante_email ?? "",
                  anfitriona: Boolean(asiento.anfitriona),
                  estadoMesa,
                });
              });
            });
        });

        setSummaryRows(nextRows);
        setTableSummaries(nextTableSummaries);
      } catch (error) {
        if (!isSessionExpiredError(error)) {
          const message = getApiErrorMessage(
            error,
            "No se pudo cargar el resumen de reuniones",
          );
          toast.error(message);
        }
        setSummaryRows([]);
        setTableSummaries([]);
      } finally {
        setIsLoadingSummary(false);
      }
    };

    fetchSummary();
  }, [eventos, selectedEventId]);

  const selectedEvent = useMemo(
    () =>
      eventos.find((evento) => String(evento.id) === selectedEventId) ?? null,
    [eventos, selectedEventId],
  );

  const filteredRows = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return summaryRows.filter((row) => {
      const turnoMatches =
        turnoFilter === "all" || String(row.turnoId) === turnoFilter;

      if (!turnoMatches) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      return [
        row.empresaNombre,
        row.representanteNombre,
        row.representanteEmail,
        row.turnoHorario,
        `mesa ${row.mesaNumero}`,
        row.anfitriona ? "anfitriona" : "invitada",
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalizedSearch);
    });
  }, [searchTerm, summaryRows, turnoFilter]);

  const filteredTableSummaries = useMemo(() => {
    const allowedKeys = new Set(
      filteredRows.map((row) => `${row.turnoId}-${row.mesaId}`),
    );

    return tableSummaries.filter((tableSummary) =>
      allowedKeys.has(`${tableSummary.turnoId}-${tableSummary.mesaId}`),
    );
  }, [filteredRows, tableSummaries]);

  const availableTurnos = useMemo(() => {
    const turnosMap = new Map<
      string,
      { id: number; horario: string; estado: string }
    >();

    summaryRows.forEach((row) => {
      if (!turnosMap.has(String(row.turnoId))) {
        turnosMap.set(String(row.turnoId), {
          id: row.turnoId,
          horario: row.turnoHorario,
          estado: row.turnoEstado,
        });
      }
    });

    return Array.from(turnosMap.values()).sort((firstTurno, secondTurno) =>
      firstTurno.horario.localeCompare(secondTurno.horario),
    );
  }, [summaryRows]);

  const hasActiveFilters =
    turnoFilter !== "all" || searchTerm.trim().length > 0;

  const stats = useMemo(() => {
    const occupiedRows = filteredRows.filter((row) => row.empresaNombre);
    const occupiedTables = filteredTableSummaries.filter(
      (tableSummary) => tableSummary.ocupacionActual > 0,
    );

    return {
      turnos: new Set(filteredRows.map((row) => row.turnoId)).size,
      mesasConActividad: occupiedTables.length,
      empresasPresentes: new Set(
        occupiedRows.map((row) => row.empresaNombre).filter(Boolean),
      ).size,
      representantes: occupiedRows.filter((row) => row.representanteNombre)
        .length,
    };
  }, [filteredRows, filteredTableSummaries]);

  const isLoading = isLoadingEvents || isLoadingSummary;

  return (
    <div className="min-h-screen bg-[#FAFBF8] dark:bg-[#0a1a15] transition-colors duration-300">
      <Navbar />

      <main className="pt-24 pb-16 px-4">
        <div className="max-w-7xl mx-auto space-y-8">
          {isLoading ? (
            <HeroSkeleton />
          ) : (
            <section className="rounded-3xl bg-gradient-to-br from-[#143E29] via-[#1a5236] to-[#143E29] px-6 py-8 md:px-8 shadow-xl shadow-[#143E29]/10 text-white">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-3xl space-y-4">
                  <Button
                    variant="ghost"
                    onClick={() => navigate("/panel-administrador")}
                    className="w-fit text-white/90 hover:text-white hover:bg-white/10 px-0"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Volver al panel
                  </Button>

                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="rounded-2xl bg-white/10 p-3 shadow-lg shadow-black/10">
                        <Handshake className="h-7 w-7" />
                      </div>
                      <h1 className="pt-1 text-3xl md:text-4xl font-bold tracking-tight">
                        Resumen de reuniones
                      </h1>
                    </div>
                    <p className="text-white/80 text-base md:text-lg max-w-2xl">
                      Vista rápida de mesas, empresas sentadas, representantes,
                      anfitrionas y horarios por turno.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-start lg:items-end gap-3">
                  <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.18em] text-white/60">
                      Evento seleccionado
                    </p>
                    <p className="mt-1 text-lg font-semibold">
                      {selectedEvent?.nombre ?? "Sin ronda disponible"}
                    </p>
                    <p className="text-sm text-white/75">
                      {selectedEvent ? formatDate(selectedEvent.fecha) : ""}
                    </p>
                  </div>

                  <Button
                    onClick={() => {
                      if (!selectedEvent || filteredRows.length === 0) {
                        toast.info(
                          "No hay datos para exportar en el filtro actual",
                        );
                        return;
                      }

                      downloadCsv(filteredRows, selectedEvent.nombre);
                    }}
                    className="bg-white text-[#143E29] hover:bg-white/90"
                  >
                    <Download className="h-4 w-4" />
                    Descargar CSV
                  </Button>
                </div>
              </div>
            </section>
          )}

          <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
            {isLoading
              ? Array.from({ length: 4 }).map((_, index) => (
                  <StatCardSkeleton key={index} />
                ))
              : [
                  {
                    title: "Turnos con actividad",
                    value: stats.turnos,
                    icon: Clock3,
                    accent: "text-[#68A243]",
                    bg: "bg-[#68A243]/10",
                  },
                  {
                    title: "Mesas ocupadas",
                    value: stats.mesasConActividad,
                    icon: Handshake,
                    accent: "text-[#F5891F]",
                    bg: "bg-[#F5891F]/10",
                  },
                  {
                    title: "Empresas presentes",
                    value: stats.empresasPresentes,
                    icon: Building2,
                    accent: "text-[#143E29] dark:text-white",
                    bg: "bg-[#143E29]/10",
                  },
                  {
                    title: "Representantes sentados",
                    value: stats.representantes,
                    icon: Users,
                    accent: "text-[#3F6E20]",
                    bg: "bg-[#68A243]/10",
                  },
                ].map((stat) => (
                  <Card
                    key={stat.title}
                    className="border-[#68A243]/20 dark:border-[#68A243]/25 dark:bg-[#143E29]"
                  >
                    <CardHeader className="pb-2 flex flex-row items-center justify-between">
                      <CardTitle className="text-sm font-medium text-muted-foreground dark:text-gray-300">
                        {stat.title}
                      </CardTitle>
                      <div className={`rounded-xl p-2 ${stat.bg}`}>
                        <stat.icon className={`h-5 w-5 ${stat.accent}`} />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-[#143E29] dark:text-white">
                        {stat.value}
                      </div>
                    </CardContent>
                  </Card>
                ))}
          </section>

          <Card className="border-[#68A243]/25 shadow-sm dark:border-[#68A243]/25 dark:bg-[#143E29]">
            <CardHeader className="border-b border-[#68A243]/10 px-5 py-4 dark:border-[#68A243]/20">
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <CardTitle className="text-[#143E29] dark:text-white text-lg leading-tight">
                    Filtros
                  </CardTitle>
                  <CardDescription className="text-xs dark:text-gray-300">
                    Elegí ronda, turno o buscá una empresa puntual.
                  </CardDescription>
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setTurnoFilter("all");
                    setSearchTerm("");
                  }}
                  disabled={!hasActiveFilters}
                  className="h-8 px-2.5 text-[#3F6E20] hover:bg-[#68A243]/10 hover:text-[#3F6E20] disabled:opacity-40 disabled:hover:bg-transparent dark:text-[#9FD27B] dark:hover:bg-[#68A243]/10 dark:hover:text-[#9FD27B]"
                >
                  <RotateCcw className="h-4 w-4" />
                  Limpiar
                </Button>
              </div>
            </CardHeader>
            <CardContent className="px-5 py-4">
              <div className="grid grid-cols-1 gap-3 lg:grid-cols-[220px_220px_minmax(0,1fr)] xl:grid-cols-[240px_240px_minmax(0,1fr)]">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#143E29] dark:text-white">
                    Ronda
                  </label>
                  <Select
                    value={selectedEventId || undefined}
                    onValueChange={setSelectedEventId}
                    disabled={isLoadingEvents || eventos.length === 0}
                  >
                    <SelectTrigger className="h-10 w-full border-[#68A243]/20 bg-white dark:border-[#68A243]/30 dark:bg-[#0f2f25] dark:text-white">
                      <SelectValue placeholder="Seleccioná una ronda" />
                    </SelectTrigger>
                    <SelectContent>
                      {eventos.map((evento) => (
                        <SelectItem key={evento.id} value={String(evento.id)}>
                          {evento.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#143E29] dark:text-white">
                    Turno
                  </label>
                  <Select value={turnoFilter} onValueChange={setTurnoFilter}>
                    <SelectTrigger className="h-10 w-full border-[#68A243]/20 bg-white dark:border-[#68A243]/30 dark:bg-[#0f2f25] dark:text-white">
                      <SelectValue placeholder="Todos los turnos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los turnos</SelectItem>
                      {availableTurnos.map((turno) => (
                        <SelectItem key={turno.id} value={String(turno.id)}>
                          {turno.horario}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#143E29] dark:text-white">
                    Buscar
                  </label>
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={searchTerm}
                      onChange={(event) => setSearchTerm(event.target.value)}
                      placeholder="Empresa, representante, email o mesa"
                      className="h-10 w-full pl-9 border-[#68A243]/20 bg-white dark:border-[#68A243]/30 dark:bg-[#0f2f25] dark:text-white"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <section className="space-y-4" aria-label="Vistas del resumen">
            <Tabs
              value={activeView}
              onValueChange={(value) =>
                setActiveView(value as "mesas" | "tabla")
              }
              className="space-y-4"
            >
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <TabsList className="h-auto flex w-full flex-col gap-2 rounded-2xl bg-[#68A243]/8 p-2 md:inline-flex md:w-auto md:flex-row dark:bg-[#0f2f25]">
                  <TabsTrigger
                    value="tabla"
                    className="rounded-xl px-4 py-2.5 data-[state=active]:bg-white data-[state=active]:text-[#143E29] dark:data-[state=active]:bg-[#143E29] dark:data-[state=active]:text-white"
                    aria-label="Mostrar vista tabular del resumen"
                  >
                    <TableProperties className="h-4 w-4" />
                    Tabla
                  </TabsTrigger>
                  <TabsTrigger
                    value="mesas"
                    className="rounded-xl px-4 py-2.5 data-[state=active]:bg-white data-[state=active]:text-[#143E29] dark:data-[state=active]:bg-[#143E29] dark:data-[state=active]:text-white"
                    aria-label="Mostrar vista en tarjetas del resumen"
                  >
                    <LayoutGrid className="h-4 w-4" />
                    Tarjetas
                  </TabsTrigger>
                </TabsList>

                <div
                  aria-live="polite"
                  className="text-sm text-muted-foreground dark:text-gray-300"
                >
                  {isLoading
                    ? "Cargando reuniones"
                    : `${filteredTableSummaries.length} mesas y ${filteredRows.length} registros`}
                </div>
              </div>

              <TabsContent value="mesas" className="mt-0 space-y-4">
                {isLoading ? (
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                    {Array.from({ length: 4 }).map((_, index) => (
                      <MeetingCardSkeleton key={index} />
                    ))}
                  </div>
                ) : filteredTableSummaries.length > 0 ? (
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                    {filteredTableSummaries.map((tableSummary) => {
                      const occupancyBadge = getOccupancyBadge(
                        tableSummary.estadoMesa,
                      );
                      const turnoBadge = formatTurnoStatus(
                        tableSummary.turnoEstado,
                      );

                      return (
                        <Card
                          key={tableSummary.key}
                          className="border-[#68A243]/20 dark:border-[#68A243]/25 dark:bg-[#143E29] overflow-hidden"
                        >
                          <CardHeader className="border-b border-[#68A243]/10 dark:border-[#68A243]/20 space-y-4">
                            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                              <div className="space-y-3">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <CardTitle className="text-xl text-[#143E29] dark:text-white">
                                    Mesa {tableSummary.mesaNumero}
                                  </CardTitle>
                                  <Badge className={occupancyBadge.className}>
                                    {occupancyBadge.label}
                                  </Badge>
                                  <Badge className={turnoBadge.className}>
                                    {turnoBadge.label}
                                  </Badge>
                                </div>
                                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground dark:text-gray-300">
                                  <span className="inline-flex items-center gap-2">
                                    <Clock3 className="h-4 w-4" />
                                    {tableSummary.turnoHorario}
                                  </span>
                                  <span className="inline-flex items-center gap-2">
                                    <Users className="h-4 w-4" />
                                    {tableSummary.ocupacionActual}/2 asientos
                                    ocupados
                                  </span>
                                </div>
                              </div>

                              <div className="rounded-2xl border border-[#68A243]/15 bg-[#68A243]/5 px-4 py-3 min-w-[180px] dark:bg-[#0f2f25] dark:border-[#68A243]/20">
                                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground dark:text-gray-400">
                                  Empresa anfitriona
                                </p>
                                <p className="mt-2 font-semibold text-[#143E29] dark:text-white">
                                  {tableSummary.anfitrionaEmpresa ??
                                    "Sin definir"}
                                </p>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              <div className="rounded-2xl border border-[#68A243]/15 bg-white/70 dark:bg-[#0f2f25] dark:border-[#68A243]/20 p-4">
                                <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground dark:text-gray-400">
                                  Participantes
                                </p>
                                <p className="mt-2 text-2xl font-bold text-[#143E29] dark:text-white">
                                  {tableSummary.participantes.length}
                                </p>
                              </div>
                              <div className="rounded-2xl border border-[#68A243]/15 bg-white/70 dark:bg-[#0f2f25] dark:border-[#68A243]/20 p-4">
                                <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground dark:text-gray-400">
                                  Representación
                                </p>
                                <p className="mt-2 font-semibold text-[#143E29] dark:text-white">
                                  {tableSummary.participantes.some(
                                    (participante) => participante.anfitriona,
                                  )
                                    ? "Con anfitriona"
                                    : "Sin anfitriona"}
                                </p>
                              </div>
                              <div className="rounded-2xl border border-[#68A243]/15 bg-white/70 dark:bg-[#0f2f25] dark:border-[#68A243]/20 p-4">
                                <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground dark:text-gray-400">
                                  Estado rápido
                                </p>
                                <p className="mt-2 font-semibold text-[#143E29] dark:text-white">
                                  {occupancyBadge.label}
                                </p>
                              </div>
                            </div>
                          </CardHeader>

                          <CardContent className="pt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="text-sm text-muted-foreground dark:text-gray-300">
                              {tableSummary.participantes.length > 0
                                ? `${tableSummary.participantes
                                    .map(
                                      (participante) =>
                                        participante.empresaNombre,
                                    )
                                    .join(" · ")}`
                                : "Esta mesa todavía no tiene asientos ocupados."}
                            </div>
                            <Button
                              variant="outline"
                              onClick={() =>
                                setSelectedTableSummary(tableSummary)
                              }
                              className="border-[#68A243]/30 text-[#68A243] hover:bg-[#68A243] hover:text-white"
                              aria-label={`Ver detalle de la mesa ${tableSummary.mesaNumero}`}
                            >
                              Ver detalle
                            </Button>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                ) : (
                  <Card className="border-[#68A243]/20 dark:border-[#68A243]/25 dark:bg-[#143E29]">
                    <CardContent className="py-12 text-center space-y-2">
                      <p className="text-lg font-semibold text-[#143E29] dark:text-white">
                        No hay reuniones para mostrar
                      </p>
                      <p className="text-sm text-muted-foreground dark:text-gray-300">
                        Ajustá los filtros o esperá a que las empresas ocupen
                        mesas.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="tabla" className="mt-0">
                <Card className="border-[#68A243]/20 dark:border-[#68A243]/25 dark:bg-[#143E29] overflow-hidden">
                  <CardHeader className="border-b border-[#68A243]/10 dark:border-[#68A243]/20">
                    <CardTitle className="text-[#143E29] dark:text-white">
                      Vista tabular
                    </CardTitle>
                    <CardDescription className="dark:text-gray-300">
                      Una fila por mesa para ver rápido qué empresa anfitriona
                      se cruza con qué empresa invitada.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <ScrollArea className="w-full">
                      <Table>
                        <TableHeader>
                          <TableRow className="hover:bg-transparent dark:border-[#68A243]/20">
                            <TableHead>Turno</TableHead>
                            <TableHead>Mesa</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead>Anfitriona</TableHead>
                            <TableHead>Invitada</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredTableSummaries.length > 0 ? (
                            filteredTableSummaries.map((tableSummary) => {
                              const anfitriona =
                                tableSummary.participantes.find(
                                  (participante) => participante.anfitriona,
                                ) ?? null;
                              const invitada =
                                tableSummary.participantes.find(
                                  (participante) => !participante.anfitriona,
                                ) ?? null;
                              const occupancyBadge = getOccupancyBadge(
                                tableSummary.estadoMesa,
                              );

                              return (
                                <TableRow
                                  key={tableSummary.key}
                                  className="dark:border-[#68A243]/15"
                                >
                                  <TableCell className="min-w-[140px] font-medium text-[#143E29] dark:text-white">
                                    {tableSummary.turnoHorario}
                                  </TableCell>
                                  <TableCell>
                                    Mesa {tableSummary.mesaNumero}
                                  </TableCell>
                                  <TableCell>
                                    <Badge className={occupancyBadge.className}>
                                      {occupancyBadge.label}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="min-w-[280px] align-top">
                                    {anfitriona ? (
                                      <div className="space-y-1 py-1">
                                        <p className="font-semibold text-[#143E29] dark:text-white">
                                          {anfitriona.empresaNombre}
                                        </p>
                                        <p className="text-sm text-muted-foreground dark:text-gray-300">
                                          {anfitriona.representanteNombre ||
                                            "Sin representante"}
                                        </p>
                                        <p className="text-sm text-muted-foreground dark:text-gray-400 break-all">
                                          {anfitriona.representanteEmail ||
                                            "Sin email"}
                                        </p>
                                      </div>
                                    ) : (
                                      <span className="text-sm text-muted-foreground dark:text-gray-300">
                                        Sin anfitriona asignada
                                      </span>
                                    )}
                                  </TableCell>
                                  <TableCell className="min-w-[280px] align-top">
                                    {invitada ? (
                                      <div className="space-y-1 py-1">
                                        <p className="font-semibold text-[#143E29] dark:text-white">
                                          {invitada.empresaNombre}
                                        </p>
                                        <p className="text-sm text-muted-foreground dark:text-gray-300">
                                          {invitada.representanteNombre ||
                                            "Sin representante"}
                                        </p>
                                        <p className="text-sm text-muted-foreground dark:text-gray-400 break-all">
                                          {invitada.representanteEmail ||
                                            "Sin email"}
                                        </p>
                                      </div>
                                    ) : (
                                      <span className="text-sm text-muted-foreground dark:text-gray-300">
                                        Sin invitada asignada
                                      </span>
                                    )}
                                  </TableCell>
                                </TableRow>
                              );
                            })
                          ) : (
                            <TableRow className="hover:bg-transparent dark:border-[#68A243]/15">
                              <TableCell
                                colSpan={5}
                                className="py-10 text-center text-muted-foreground dark:text-gray-300"
                              >
                                No hay registros para el filtro actual.
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </section>
        </div>
      </main>

      <Dialog
        open={Boolean(selectedTableSummary)}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedTableSummary(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-3xl border-[#68A243]/20 dark:border-[#68A243]/25 bg-white dark:bg-[#11161d]">
          {selectedTableSummary ? (
            <>
              <DialogHeader>
                <DialogTitle className="text-[#143E29] dark:text-white flex items-center gap-2">
                  Mesa {selectedTableSummary.mesaNumero}
                  <Badge
                    className={
                      getOccupancyBadge(selectedTableSummary.estadoMesa)
                        .className
                    }
                  >
                    {getOccupancyBadge(selectedTableSummary.estadoMesa).label}
                  </Badge>
                </DialogTitle>
                <DialogDescription className="dark:text-gray-300">
                  Turno {selectedTableSummary.turnoHorario}. Revisá
                  participantes, empresa anfitriona y estado actual de
                  ocupación.
                </DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-2xl border border-[#68A243]/15 bg-[#68A243]/5 dark:bg-[#0f2f25] dark:border-[#68A243]/20 p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground dark:text-gray-400">
                    Estado del turno
                  </p>
                  <div className="mt-2">
                    <Badge
                      className={
                        formatTurnoStatus(selectedTableSummary.turnoEstado)
                          .className
                      }
                    >
                      {
                        formatTurnoStatus(selectedTableSummary.turnoEstado)
                          .label
                      }
                    </Badge>
                  </div>
                </div>
                <div className="rounded-2xl border border-[#68A243]/15 bg-[#68A243]/5 dark:bg-[#0f2f25] dark:border-[#68A243]/20 p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground dark:text-gray-400">
                    Ocupación
                  </p>
                  <p className="mt-2 text-2xl font-bold text-[#143E29] dark:text-white">
                    {selectedTableSummary.ocupacionActual}/2
                  </p>
                </div>
                <div className="rounded-2xl border border-[#68A243]/15 bg-[#68A243]/5 dark:bg-[#0f2f25] dark:border-[#68A243]/20 p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground dark:text-gray-400">
                    Empresa anfitriona
                  </p>
                  <p className="mt-2 font-semibold text-[#143E29] dark:text-white">
                    {selectedTableSummary.anfitrionaEmpresa ?? "Sin definir"}
                  </p>
                </div>
              </div>

              {selectedTableSummary.participantes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {selectedTableSummary.participantes.map((participante) => (
                    <div
                      key={participante.asientoId}
                      className="rounded-2xl border border-[#68A243]/15 bg-white/70 dark:bg-[#0f2f25] dark:border-[#68A243]/20 p-4 space-y-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground dark:text-gray-400">
                            Empresa
                          </p>
                          <p className="mt-1 font-semibold text-[#143E29] dark:text-white">
                            {participante.empresaNombre}
                          </p>
                        </div>
                        {participante.anfitriona && (
                          <Badge className="bg-[#68A243]/15 text-[#3F6E20] border-[#68A243]/30 dark:bg-[#68A243]/20 dark:text-[#9FD27B] dark:border-[#68A243]/40">
                            Anfitriona
                          </Badge>
                        )}
                      </div>

                      <div className="space-y-2 text-sm text-muted-foreground dark:text-gray-300">
                        <p className="inline-flex items-center gap-2">
                          <UserRound className="h-4 w-4" />
                          {participante.representanteNombre ||
                            "Sin representante"}
                        </p>
                        <p className="inline-flex items-center gap-2 break-all">
                          <Mail className="h-4 w-4" />
                          {participante.representanteEmail || "Sin email"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 p-6 text-center text-sm text-muted-foreground dark:text-gray-300">
                  Esta mesa todavía no tiene asientos ocupados.
                </div>
              )}
            </>
          ) : null}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
