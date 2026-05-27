import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import {
  ArrowLeft,
  Check,
  Clock3,
  Download,
  Edit2,
  Printer,
  RotateCcw,
  Handshake,
  LayoutGrid,
  Mail,
  Search,
  TableProperties,
  UserRound,
  Users,
  X,
} from "lucide-react";
import Navbar from "../../components/Navbar";
import Footer from "../../layout/Footer";
import GestionarAsientosModal from "../../components/GestionarAsientosModal";
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
import { updateAsientoEstado } from "../../api/AsientoService";
import { getApiErrorMessage, isSessionExpiredError } from "../../lib/axios";
import type { EventoResponse } from "../../types/Evento";
import type { MesaResponse } from "../../types/Mesa";
import type { TurnoResponse } from "../../types/Turno";

type SummarySeatRow = {
  key: string;
  asientoId?: number;
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
  turno: TurnoResponse;
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

function printSummary(
  rows: TableSummary[],
  eventName: string,
  eventDate?: string,
  asientoEstados: Record<number, "asistio" | "ausente"> = {},
) {
  const headers = [
    "Turno",
    "Mesa",
    "Anfitriona",
    "Rep. Anfitriona",
    "Asistencia",
    "Invitada",
    "Rep. Invitada",
    "Asistencia",
  ];

  const subtitle = eventDate
    ? `${eventName} \u2014 ${new Intl.DateTimeFormat("es-AR", { day: "2-digit", month: "long", year: "numeric" }).format(new Date(`${eventDate}T00:00:00`))}`
    : eventName;

  const headerHtml = headers.map((h) => `<th>${h}</th>`).join("");

  // Agrupar por turno e insertar filas separadoras
  const bodyHtml = (() => {
    let lastTurnoId: number | null = null;
    return rows
      .map((row) => {
        const anfitriona = row.participantes.find((p) => p.anfitriona) ?? null;
        const invitada = row.participantes.find((p) => !p.anfitriona) ?? null;
        const asistenciaAnfitriona =
          (anfitriona && asientoEstados[anfitriona.asientoId]) || "";
        const asistenciaInvitada =
          (invitada && asientoEstados[invitada.asientoId]) || "";
        const cells = [
          row.turnoHorario,
          `Mesa ${row.mesaNumero}`,
          anfitriona?.empresaNombre || "Sin anfitriona",
          anfitriona?.representanteNombre || "Sin representante",
          asistenciaAnfitriona,
          invitada?.empresaNombre || "Sin invitada",
          invitada?.representanteNombre || "Sin representante",
          asistenciaInvitada,
        ];
        const dataRow = `<tr>${cells.map((c) => `<td>${c}</td>`).join("")}</tr>`;
        if (row.turnoId !== lastTurnoId) {
          lastTurnoId = row.turnoId;
          const separator = `<tr class='turno-sep'><td colspan='8'>Turno: ${row.turnoHorario}</td></tr>`;
          return separator + dataRow;
        }
        return dataRow;
      })
      .join("");
  })();

  const scriptTag =
    "<scr" +
    "ipt>window.onload=()=>{window.print();window.onafterprint=()=>window.close();}</scr" +
    "ipt>";

  const html = [
    "<!DOCTYPE html><html lang='es'><head><meta charset='UTF-8'/>",
    `<title>Resumen de reuniones \u2013 ${eventName}</title>`,
    "<style>",
    "* { box-sizing: border-box; margin: 0; padding: 0; }",
    // @page margin: 0 elimina el encabezado (about:blank) y pie (fecha) que agrega el navegador
    "@page { margin: 0; size: landscape; }",
    "body { font-family: Arial, sans-serif; font-size: 11px; color: #111; padding: 15mm; print-color-adjust: exact; -webkit-print-color-adjust: exact; }",
    "h1 { font-size: 15px; font-weight: bold; margin-bottom: 3px; }",
    "p.subtitle { font-size: 11px; color: #444; margin-bottom: 14px; }",
    "table { width: 100%; border-collapse: collapse; }",
    "th, td { border: 1px solid #999; padding: 5px 7px; text-align: left; vertical-align: middle; }",
    // Header de tabla: negro puro → imprime como negro sólido en B&N
    "th { background: #111; color: #fff; font-size: 10px; text-transform: uppercase; letter-spacing: 0.05em; }",
    // Filas pares: gris muy claro → se distingue en B&N
    "tr:nth-child(even) td { background: #f0f0f0; }",
    // Columnas de asistencia: blanco con borde punteado para marcar a mano
    "td:nth-child(5), td:nth-child(8) { min-width: 70px; background: #fff; border-style: dashed; }",
    // Separador de turno: gris medio + borde superior grueso → claro en B&N
    ".turno-sep td { background: #ddd; color: #000; font-weight: bold; font-size: 10px; text-transform: uppercase; letter-spacing: 0.08em; padding: 5px 7px; border: 1px solid #999; border-top: 2.5px solid #333; }",
    "</style></head><body>",
    "<h1>Resumen de reuniones</h1>",
    `<p class='subtitle'>${subtitle}</p>`,
    `<table><thead><tr>${headerHtml}</tr></thead><tbody>${bodyHtml}</tbody></table>`,
    scriptTag,
    "</body></html>",
  ].join("");

  const win = window.open("", "_blank", "width=1100,height=700");
  if (win) {
    win.document.write(html);
    win.document.close();
  }
}

function downloadCsv(
  rows: TableSummary[],
  eventName: string,
  asientoEstados: Record<number, "asistio" | "ausente"> = {},
) {
  const headers = [
    "Turno",
    "Mesa",
    "Anfitriona",
    "Rep. Anfitriona",
    "Asistencia anfitriona",
    "Invitada",
    "Rep. Invitada",
    "Asistencia invitada",
  ];

  // Agrupar por turno e insertar filas separadoras
  const dataLines: string[] = [];
  let lastTurnoId: number | null = null;
  rows.forEach((row) => {
    const anfitriona =
      row.participantes.find((participante) => participante.anfitriona) ?? null;
    const invitada =
      row.participantes.find((participante) => !participante.anfitriona) ??
      null;
    const asistenciaAnfitriona =
      (anfitriona && asientoEstados[anfitriona.asientoId]) || "";
    const asistenciaInvitada =
      (invitada && asientoEstados[invitada.asientoId]) || "";

    if (row.turnoId !== lastTurnoId) {
      lastTurnoId = row.turnoId;
      // Fila separadora de turno: ocupa la primera columna
      const separator = [
        escapeCsvValue(`TURNO: ${row.turnoHorario}`),
        "",
        "",
        "",
        "",
        "",
        "",
        "",
      ].join(",");
      dataLines.push(separator);
    }

    dataLines.push(
      [
        row.turnoHorario,
        `Mesa ${row.mesaNumero}`,
        anfitriona?.empresaNombre || "Sin anfitriona asignada",
        anfitriona?.representanteNombre || "Sin representante",
        asistenciaAnfitriona,
        invitada?.empresaNombre || "Sin invitada asignada",
        invitada?.representanteNombre || "Sin representante",
        asistenciaInvitada,
      ]
        .map(escapeCsvValue)
        .join(","),
    );
  });

  const content = [headers.map(escapeCsvValue).join(","), ...dataLines].join(
    "\n",
  );

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
    <section className="rounded-3xl bg-gradient-to-br from-[#143E29] via-[#1a5236] to-[#143E29] px-6 py-8 md:px-8 shadow-xl shadow-[#143E29]/10 text-white">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl space-y-4">
          {/* Botón volver - ESTÁTICO, sin skeleton */}
          <Button variant="ghost" disabled className="w-fit text-white/90 px-0">
            <ArrowLeft className="h-4 w-4" />
            Volver al panel
          </Button>

          <div className="space-y-4">
            {/* Título e icono - ESTÁTICO, sin skeleton */}
            <div className="flex items-start gap-4">
              <div className="rounded-2xl bg-white/10 p-3 shadow-lg shadow-black/10">
                <Handshake className="h-7 w-7" />
              </div>
              <h1 className="pt-1 text-3xl md:text-4xl font-bold tracking-tight">
                Resumen de reuniones
              </h1>
            </div>
            {/* Descripción - ESTÁTICA, sin skeleton */}
            <p className="text-white/80 text-base md:text-lg max-w-2xl">
              Vista rápida de mesas, empresas sentadas, representantes,
              anfitrionas y horarios por turno.
            </p>
          </div>
        </div>

        <div className="flex flex-col items-start lg:items-end gap-3">
          {/* Skeleton individual para la caja de evento seleccionado */}
          <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 w-full lg:w-fit">
            <p className="text-xs uppercase tracking-[0.18em] text-white/60">
              Evento seleccionado
            </p>
            <div className="mt-3 space-y-2">
              <Skeleton className="h-6 w-40 bg-white/20 rounded-lg" />
              <Skeleton className="h-4 w-32 bg-white/15 rounded-lg" />
            </div>
          </div>

          {/* Skeleton individual para el botón descargar */}
          <Skeleton className="h-10 w-full lg:w-48 bg-white/20 rounded-lg" />
        </div>
      </div>
    </section>
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
  const [estadoMesaFilter, setEstadoMesaFilter] = useState<
    "all" | "libre" | "parcial" | "completa"
  >("all");
  const [eventSearchTerm, setEventSearchTerm] = useState("");
  const [turnoSearchTerm, setTurnoSearchTerm] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeView, setActiveView] = useState<"mesas" | "tabla">("tabla");
  const [selectedTableSummary, setSelectedTableSummary] =
    useState<TableSummary | null>(null);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  const [summaryRows, setSummaryRows] = useState<SummarySeatRow[]>([]);
  const [tableSummaries, setTableSummaries] = useState<TableSummary[]>([]);
  const [turnoGestionado, setTurnoGestionado] = useState<TurnoResponse | null>(
    null,
  );
  const [asientoEstados, setAsientoEstados] = useState<
    Record<number, "asistio" | "ausente">
  >({});
  const [updatingAsientos, setUpdatingAsientos] = useState<Set<number>>(
    new Set(),
  );
  const [mesaEdicion, setMesaEdicion] = useState<{
    mesaNumero: number;
    turnoHorario: string;
    participantes: Array<{
      asientoId: number;
      empresaNombre: string;
      representanteNombre: string;
      anfitriona: boolean;
    }>;
  } | null>(null);

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
        setEstadoMesaFilter("all");
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
                turno,
                anfitrionaEmpresa:
                  participantes.find((participante) => participante.anfitriona)
                    ?.empresaNombre ?? null,
                participantes,
              });

              if (mesa.asientos.length === 0) {
                nextRows.push({
                  key: `${turno.id}-${mesa.id}-empty`,
                  asientoId: undefined,
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
                  asientoId: asiento.id,
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

      // Búsqueda de dos empresas separadas por "y"
      if (normalizedSearch.includes(" y ")) {
        const [empresa1, empresa2] = normalizedSearch
          .split(" y ")
          .map((s) => s.trim())
          .filter(Boolean);

        if (!empresa1 || !empresa2) {
          return false;
        }

        // Encontrar la mesa correspondiente en tableSummaries
        const tableSummary = tableSummaries.find(
          (ts) => ts.turnoId === row.turnoId && ts.mesaId === row.mesaId,
        );

        if (!tableSummary || tableSummary.participantes.length < 2) {
          return false;
        }

        // Verificar que ambas empresas estén en la mesa (búsqueda parcial)
        const empresasEnMesa = tableSummary.participantes.map((p) =>
          p.empresaNombre.toLowerCase(),
        );

        const empresa1Lower = empresa1.toLowerCase();
        const empresa2Lower = empresa2.toLowerCase();

        const match1 = empresasEnMesa.some((e) => e.includes(empresa1Lower));
        const match2 = empresasEnMesa.some((e) => e.includes(empresa2Lower));

        return match1 && match2;
      }

      // Búsqueda estándar
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
  }, [searchTerm, summaryRows, turnoFilter, tableSummaries]);

  const filteredTableSummaries = useMemo(() => {
    const allowedKeys = new Set(
      filteredRows.map((row) => `${row.turnoId}-${row.mesaId}`),
    );

    return tableSummaries.filter((tableSummary) => {
      const hasKey = allowedKeys.has(
        `${tableSummary.turnoId}-${tableSummary.mesaId}`,
      );
      const estadoMatches =
        estadoMesaFilter === "all" ||
        tableSummary.estadoMesa === estadoMesaFilter;
      return hasKey && estadoMatches;
    });
  }, [filteredRows, tableSummaries, estadoMesaFilter]);

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

  const filteredEventos = useMemo(() => {
    const query = eventSearchTerm.trim().toLowerCase();

    if (!query) {
      return eventos;
    }

    return eventos.filter((evento) =>
      evento.nombre.toLowerCase().includes(query),
    );
  }, [eventSearchTerm, eventos]);

  const filteredTurnos = useMemo(() => {
    const query = turnoSearchTerm.trim().toLowerCase();

    if (!query) {
      return availableTurnos;
    }

    return availableTurnos.filter(
      (turno) =>
        turno.horario.toLowerCase().includes(query) ||
        String(turno.id).includes(query),
    );
  }, [availableTurnos, turnoSearchTerm]);

  const turnoNumberMap = useMemo(() => {
    const map = new Map<number, number>();
    availableTurnos.forEach((turno, index) => {
      map.set(turno.id, index + 1);
    });
    return map;
  }, [availableTurnos]);

  const handleAsistenciaChange = async (
    asientoId: number,
    nuevoEstado: "asistio" | "ausente",
  ) => {
    try {
      setUpdatingAsientos((prev) => new Set(prev).add(asientoId));
      await updateAsientoEstado(asientoId, nuevoEstado);
      setAsientoEstados((prev) => ({
        ...prev,
        [asientoId]: nuevoEstado,
      }));
      toast.success(`Asistencia marcada como "${nuevoEstado}"`);
    } catch (error) {
      const errMsg = getApiErrorMessage(
        error,
        "No se pudo actualizar la asistencia",
      );
      const translatedMsg =
        errMsg && errMsg.includes("is not a valid choice")
          ? `"${nuevoEstado}" no es una opción válida`
          : errMsg || "No se pudo actualizar la asistencia";
      toast.error(translatedMsg);
    } finally {
      setUpdatingAsientos((prev) => {
        const next = new Set(prev);
        next.delete(asientoId);
        return next;
      });
    }
  };

  const handleCloseTurnoModal = () => {
    setTurnoGestionado(null);
  };

  const handleTurnoUpdated = async () => {
    // En MeetingsSummary, no necesitamos recargar porque los datos ya están en el estado
    setTurnoGestionado(null);
  };

  const hasActiveFilters =
    turnoFilter !== "all" || searchTerm.trim().length > 0;

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

                  <div className="flex items-center gap-2 w-full lg:w-auto">
                    <Button
                      variant="outline"
                      onClick={() => {
                        if (
                          !selectedEvent ||
                          filteredTableSummaries.length === 0
                        ) {
                          toast.info(
                            "No hay datos para imprimir en el filtro actual",
                          );
                          return;
                        }
                        printSummary(
                          filteredTableSummaries,
                          selectedEvent.nombre,
                          selectedEvent.fecha,
                          asientoEstados,
                        );
                      }}
                      className="flex-1 lg:flex-none bg-transparent border-white/40 text-white hover:bg-white/15 hover:text-white hover:border-white/60"
                    >
                      <Printer className="h-4 w-4" />
                      Imprimir
                    </Button>

                    <Button
                      onClick={() => {
                        if (
                          !selectedEvent ||
                          filteredTableSummaries.length === 0
                        ) {
                          toast.info(
                            "No hay datos para exportar en el filtro actual",
                          );
                          return;
                        }

                        downloadCsv(
                          filteredTableSummaries,
                          selectedEvent.nombre,
                          asientoEstados,
                        );
                      }}
                      className="flex-1 lg:flex-none bg-white text-[#143E29] hover:bg-white/90"
                    >
                      <Download className="h-4 w-4" />
                      Descargar CSV
                    </Button>
                  </div>
                </div>
              </div>
            </section>
          )}

          <Card className="border-[#68A243]/15 shadow-sm dark:border-[#68A243]/20 dark:bg-[#143E29]">
            <CardContent className="px-4 py-4 md:px-5">
              <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
                <div className="grid flex-1 grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-[minmax(280px,1.05fr)_minmax(280px,1fr)_minmax(240px,0.85fr)]">
                  <div className="flex items-center gap-3">
                    <span className="shrink-0 text-xs font-semibold uppercase tracking-[0.14em] text-[#3F6E20] dark:text-[#9FD27B]">
                      Ronda
                    </span>
                    <Select
                      value={selectedEventId || undefined}
                      onValueChange={setSelectedEventId}
                      onOpenChange={(open) => {
                        if (!open) {
                          setEventSearchTerm("");
                        }
                      }}
                      disabled={isLoadingEvents || eventos.length === 0}
                    >
                      <SelectTrigger
                        aria-label="Filtrar por ronda"
                        className="h-10 w-full border-[#68A243]/20 text-[#143E29] focus-visible:border-[#68A243] focus-visible:ring-[#68A243]/20 bg-white dark:bg-[#143E29] dark:border-[#68A243]/20 dark:text-white transition-colors"
                      >
                        <SelectValue placeholder="Seleccioná una ronda" />
                      </SelectTrigger>
                      <SelectContent>
                        <div className="px-2 py-2">
                          <Input
                            value={eventSearchTerm}
                            onChange={(event) =>
                              setEventSearchTerm(event.target.value)
                            }
                            onKeyDown={(event) => event.stopPropagation()}
                            placeholder="Buscar ronda por nombre"
                            className="h-9 border-[#68A243]/20 focus-visible:border-[#68A243] focus-visible:ring-[#68A243]/20"
                          />
                        </div>
                        {filteredEventos.length > 0 ? (
                          filteredEventos.map((evento) => (
                            <SelectItem
                              key={evento.id}
                              value={String(evento.id)}
                              className="py-2.5 font-medium text-[#143E29] hover:text-[#143E29] data-[highlighted]:bg-[#143E29]/12 data-[highlighted]:text-[#143E29] dark:text-white dark:hover:text-white dark:data-[highlighted]:bg-[#68A243]/25 dark:data-[highlighted]:text-white"
                            >
                              {evento.nombre}
                            </SelectItem>
                          ))
                        ) : (
                          <div className="px-3 py-2 text-sm text-muted-foreground">
                            No se encontraron rondas
                          </div>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="shrink-0 text-xs font-semibold uppercase tracking-[0.14em] text-[#3F6E20] dark:text-[#9FD27B]">
                      Turno
                    </span>
                    <Select
                      value={turnoFilter}
                      onValueChange={setTurnoFilter}
                      onOpenChange={(open) => {
                        if (!open) {
                          setTurnoSearchTerm("");
                        }
                      }}
                    >
                      <SelectTrigger
                        aria-label="Filtrar por turno"
                        className="h-10 w-full border-[#68A243]/20 text-[#143E29] focus-visible:border-[#68A243] focus-visible:ring-[#68A243]/20 bg-white dark:bg-[#143E29] dark:border-[#68A243]/20 dark:text-white transition-colors"
                      >
                        <SelectValue placeholder="Todos los turnos" />
                      </SelectTrigger>
                      <SelectContent>
                        <div className="px-2 py-2">
                          <Input
                            value={turnoSearchTerm}
                            onChange={(event) =>
                              setTurnoSearchTerm(event.target.value)
                            }
                            onKeyDown={(event) => event.stopPropagation()}
                            placeholder="Buscar por número u horario"
                            className="h-9 border-[#68A243]/20 focus-visible:border-[#68A243] focus-visible:ring-[#68A243]/20"
                          />
                        </div>
                        <SelectItem
                          value="all"
                          className="py-2.5 font-medium text-[#143E29] hover:text-[#143E29] data-[highlighted]:bg-[#143E29]/12 data-[highlighted]:text-[#143E29] dark:text-white dark:hover:text-white dark:data-[highlighted]:bg-[#68A243]/25 dark:data-[highlighted]:text-white"
                        >
                          Todos los turnos
                        </SelectItem>
                        {filteredTurnos.length > 0 ? (
                          filteredTurnos.map((turno) => (
                            <SelectItem
                              key={turno.id}
                              value={String(turno.id)}
                              className="py-2.5 text-[#143E29] hover:text-[#143E29] data-[highlighted]:bg-[#143E29]/12 data-[highlighted]:text-[#143E29] dark:text-white dark:hover:text-white dark:data-[highlighted]:bg-[#68A243]/25 dark:data-[highlighted]:text-white"
                            >
                              <div className="flex w-full items-center justify-between gap-3">
                                <span className="rounded-full border border-[#68A243]/25 bg-[#68A243]/10 px-2.5 py-0.5 text-xs font-semibold text-[#3F6E20] dark:border-[#68A243]/30 dark:bg-[#68A243]/15 dark:text-[#9FD27B]">
                                  Turno {turnoNumberMap.get(turno.id)}
                                </span>
                                <span className="text-sm font-medium text-[#425249] dark:text-gray-200">
                                  {turno.horario}
                                </span>
                              </div>
                            </SelectItem>
                          ))
                        ) : (
                          <div className="px-3 py-2 text-sm text-muted-foreground">
                            No se encontraron turnos
                          </div>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      aria-label="Buscar reuniones"
                      value={searchTerm}
                      onChange={(event) => setSearchTerm(event.target.value)}
                      placeholder="Empresa, representante, email, mesa o 'Empresa1 y Empresa2'"
                      className="h-10 w-full pl-9 border-[#68A243]/20 focus-visible:border-[#68A243] focus-visible:ring-[#68A243]/20 bg-white dark:bg-[#143E29] dark:border-[#68A243]/20 dark:text-white dark:placeholder-[#b8c0ca] transition-colors"
                    />
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setTurnoFilter("all");
                    setSearchTerm("");
                    setEstadoMesaFilter("all");
                  }}
                  disabled={!hasActiveFilters}
                  className="h-10 justify-start border-[#68A243]/20 bg-white px-3 text-[#3F6E20] hover:bg-[#68A243]/10 hover:text-[#3F6E20] disabled:opacity-40 disabled:hover:bg-white dark:border-[#68A243]/20 dark:bg-[#143E29] dark:text-[#9FD27B] dark:hover:bg-[#68A243]/10 dark:hover:text-[#9FD27B]"
                >
                  <RotateCcw className="h-4 w-4" />
                  Limpiar
                </Button>
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
                <div>
                  <h2 className="text-xl font-semibold text-[#143E29] dark:text-white">
                    Reuniones
                  </h2>
                  <p
                    aria-live="polite"
                    className="text-sm text-muted-foreground dark:text-gray-300"
                  >
                    {isLoading
                      ? "Cargando reuniones"
                      : ` ${filteredRows.length} registros`}
                  </p>
                </div>

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
                  <CardHeader className="border-b border-[#68A243]/10 dark:border-[#68A243]/20 flex items-center justify-between gap-4">
                    <div>
                      <CardTitle className="text-[#143E29] dark:text-white">
                        Vista tabular
                      </CardTitle>
                      <CardDescription className="dark:text-gray-300">
                        Una fila por mesa.
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      {(["all", "libre", "parcial", "completa"] as const).map(
                        (estado) => (
                          <button
                            key={estado}
                            onClick={() => setEstadoMesaFilter(estado)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                              estadoMesaFilter === estado
                                ? "bg-[#68A243] text-white"
                                : "bg-white dark:bg-[#143E29] text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-[#68A243]/20 hover:border-[#68A243]/50"
                            }`}
                          >
                            {estado === "all" && "Todas"}
                            {estado === "libre" && "Vacías"}
                            {estado === "parcial" && "Parciales"}
                            {estado === "completa" && "Completas"}
                          </button>
                        ),
                      )}
                    </div>
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
                            <TableHead>Rep. Anfitriona</TableHead>
                            <TableHead>Invitada</TableHead>
                            <TableHead>Rep. Invitada</TableHead>
                            <TableHead className="text-right">
                              Asistencia
                            </TableHead>
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
                                  className="dark:border-[#68A243]/15 even:bg-gray-100/90 dark:even:bg-[#68A243]/[0.04]"
                                >
                                  <TableCell className="min-w-[140px] font-medium text-[#143E29] dark:text-white">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setTurnoGestionado(tableSummary.turno)
                                      }
                                      className="cursor-pointer text-[#68A243] hover:text-[#5a9038] hover:underline transition-colors"
                                      aria-label={`Gestionar asientos para turno ${tableSummary.turnoHorario}`}
                                    >
                                      {tableSummary.turnoHorario}
                                    </button>
                                  </TableCell>
                                  <TableCell>
                                    Mesa {tableSummary.mesaNumero}
                                  </TableCell>
                                  <TableCell>
                                    <Badge className={occupancyBadge.className}>
                                      {occupancyBadge.label}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="min-w-[200px] align-top font-semibold text-[#143E29] dark:text-white">
                                    <div className="flex items-center gap-2">
                                      <span>
                                        {anfitriona?.empresaNombre ||
                                          "Sin anfitriona"}
                                      </span>
                                      {anfitriona?.asientoId &&
                                        asientoEstados[anfitriona.asientoId] ===
                                          "asistio" && (
                                          <Check className="h-4 w-4 text-green-500" />
                                        )}
                                      {anfitriona?.asientoId &&
                                        asientoEstados[anfitriona.asientoId] ===
                                          "ausente" && (
                                          <X className="h-4 w-4 text-red-500" />
                                        )}
                                    </div>
                                  </TableCell>
                                  <TableCell className="min-w-[200px] align-top text-sm text-muted-foreground dark:text-gray-300">
                                    {anfitriona?.representanteNombre ||
                                      "Sin representante"}
                                  </TableCell>
                                  <TableCell className="min-w-[200px] align-top font-semibold text-[#143E29] dark:text-white">
                                    <div className="flex items-center gap-2">
                                      <span>
                                        {invitada?.empresaNombre ||
                                          "Sin invitada"}
                                      </span>
                                      {invitada?.asientoId &&
                                        asientoEstados[invitada.asientoId] ===
                                          "asistio" && (
                                          <Check className="h-4 w-4 text-green-500" />
                                        )}
                                      {invitada?.asientoId &&
                                        asientoEstados[invitada.asientoId] ===
                                          "ausente" && (
                                          <X className="h-4 w-4 text-red-500" />
                                        )}
                                    </div>
                                  </TableCell>
                                  <TableCell className="min-w-[200px] align-top text-sm text-muted-foreground dark:text-gray-300">
                                    {invitada?.representanteNombre ||
                                      "Sin representante"}
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() =>
                                        setMesaEdicion({
                                          mesaNumero: tableSummary.mesaNumero,
                                          turnoHorario:
                                            tableSummary.turnoHorario,
                                          participantes:
                                            tableSummary.participantes.map(
                                              (p) => ({
                                                asientoId: p.asientoId,
                                                empresaNombre: p.empresaNombre,
                                                representanteNombre:
                                                  p.representanteNombre,
                                                anfitriona: p.anfitriona,
                                              }),
                                            ),
                                        })
                                      }
                                      className="text-[#68A243] hover:text-[#5a9038] hover:bg-[#68A243]/10"
                                    >
                                      <Edit2 className="h-4 w-4" />
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              );
                            })
                          ) : (
                            <TableRow className="hover:bg-transparent dark:border-[#68A243]/15">
                              <TableCell
                                colSpan={8}
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

      <GestionarAsientosModal
        isOpen={Boolean(turnoGestionado)}
        onClose={handleCloseTurnoModal}
        turnoGestionado={turnoGestionado}
        evento={selectedEvent}
        loadTurnos={async () => {
          handleTurnoUpdated();
        }}
      />

      <Dialog
        open={Boolean(mesaEdicion)}
        onOpenChange={(open) => {
          if (!open) {
            setMesaEdicion(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-lg border-[#68A243]/20 dark:border-[#68A243]/25 bg-white dark:bg-[#11161d]">
          <DialogHeader>
            <DialogTitle className="text-[#143E29] dark:text-white">
              Marcar asistencia
            </DialogTitle>
            <DialogDescription className="dark:text-gray-300">
              Mesa {mesaEdicion?.mesaNumero} • Turno {mesaEdicion?.turnoHorario}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            {mesaEdicion?.participantes.map((participante) => (
              <div
                key={participante.asientoId}
                className="rounded-2xl border border-[#68A243]/15 bg-[#68A243]/5 dark:bg-[#0f2f25] dark:border-[#68A243]/20 p-4 space-y-3"
              >
                <div>
                  <p className="text-sm font-semibold text-[#143E29] dark:text-white">
                    {participante.empresaNombre}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {participante.representanteNombre}{" "}
                    {participante.anfitriona && "(Anfitriona)"}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={
                      asientoEstados[participante.asientoId] === "asistio"
                        ? "default"
                        : "outline"
                    }
                    onClick={() =>
                      handleAsistenciaChange(participante.asientoId, "asistio")
                    }
                    disabled={updatingAsientos.has(participante.asientoId)}
                    className={
                      asientoEstados[participante.asientoId] === "asistio"
                        ? "bg-[#68A243] text-white hover:bg-[#5a9038]"
                        : ""
                    }
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Asistió
                  </Button>
                  <Button
                    size="sm"
                    variant={
                      asientoEstados[participante.asientoId] === "ausente"
                        ? "destructive"
                        : "outline"
                    }
                    onClick={() =>
                      handleAsistenciaChange(participante.asientoId, "ausente")
                    }
                    disabled={updatingAsientos.has(participante.asientoId)}
                  >
                    <X className="h-4 w-4 mr-1" />
                    No asistió
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
