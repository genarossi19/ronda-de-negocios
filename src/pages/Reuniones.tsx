import { useEffect, useMemo, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../layout/Footer";
import { Badge } from "../components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Skeleton } from "../components/ui/skeleton";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  AlertCircle,
  Building2,
  Calendar,
  CalendarCheck,
  Clock,
  Handshake,
  History,
  LayoutGrid,
  Mail,
  MapPin,
  RotateCcw,
  Search,
  TableProperties,
  User,
} from "lucide-react";
import { useCurrentUser } from "../hooks/useCurrentUser";
import { getEventos } from "../api/EventoService";
import { getAsientoHistorial } from "../api/AsientoService";
import { getApiErrorMessage } from "../lib/axios";
import type { EventoResponse } from "../types/Evento";
import type {
  AsientoHistorialItem,
  AsientoHistorialParticipante,
} from "../types/Asiento";

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatDate(dateStr: string) {
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(`${dateStr}T00:00:00`));
}

function fmt(time: string) {
  return time.slice(0, 5);
}

function fmtShortDate(dateStr: string) {
  const [y, m, d] = dateStr.split("-");
  return `${d}/${m}/${y.slice(2)}`;
}

function turnoKey(item: AsientoHistorialItem) {
  return `${item.hora_inicio}-${item.hora_fin}`;
}

function turnoLabel(item: AsientoHistorialItem) {
  return `${fmt(item.hora_inicio)} - ${fmt(item.hora_fin)}`;
}

function getOtherParticipant(
  item: AsientoHistorialItem,
  myEmpresaNombre: string,
): AsientoHistorialParticipante | null {
  return (
    item.participantes.find((p) => p.empresa_nombre !== myEmpresaNombre) ?? null
  );
}

function getMyParticipant(
  item: AsientoHistorialItem,
  myEmpresaNombre: string,
): AsientoHistorialParticipante | null {
  return (
    item.participantes.find((p) => p.empresa_nombre === myEmpresaNombre) ?? null
  );
}

function amIAnfitriona(
  item: AsientoHistorialItem,
  myEmpresaNombre: string,
): boolean {
  const mine = item.participantes.find(
    (p) => p.empresa_nombre === myEmpresaNombre,
  );
  return mine?.anfitriona ?? false;
}

const ESTADO_BADGE: Record<string, { cls: string; label: string }> = {
  reservado: {
    cls: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800/40",
    label: "Reservado",
  },
  cancelado: {
    cls: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800/40",
    label: "Cancelado",
  },
  pendiente: {
    cls: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800/40",
    label: "Pendiente",
  },
};

function estadoBadge(estado: string) {
  const found = ESTADO_BADGE[estado];
  return (
    found ?? {
      cls: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700",
      label: estado.charAt(0).toUpperCase() + estado.slice(1),
    }
  );
}

function rolBadge(isAnfitriona: boolean) {
  return isAnfitriona
    ? "bg-[#143E29] text-white dark:bg-[#1a5032]"
    : "bg-[#68A243]/15 text-[#143E29] dark:bg-[#68A243]/20 dark:text-[#b8e39c]";
}

// ─── Filter badge button ─────────────────────────────────────────────────────

function FilterBadge({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
        active
          ? "bg-[#68A243] text-white"
          : "bg-white dark:bg-[#143E29] text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-[#68A243]/20 hover:border-[#68A243]/50"
      }`}
    >
      {label}
    </button>
  );
}

// ─── Meeting row (table) ────────────────────────────────────────────────────

function MeetingTableRow({
  item,
  myEmpresaNombre,
  showRonda,
}: {
  item: AsientoHistorialItem;
  myEmpresaNombre: string;
  showRonda?: boolean;
}) {
  const other = getOtherParticipant(item, myEmpresaNombre);
  const mine = getMyParticipant(item, myEmpresaNombre);
  const isAnf = amIAnfitriona(item, myEmpresaNombre);
  const { cls, label } = estadoBadge(item.estado);

  return (
    <TableRow className="dark:border-[#68A243]/15 even:bg-gray-100/90 dark:even:bg-[#68A243]/[0.04]">
      {showRonda && (
        <TableCell className="min-w-[180px] text-sm font-medium text-[#143E29] dark:text-white">
          {item.evento}
        </TableCell>
      )}
      <TableCell className="min-w-[90px] text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
        {fmtShortDate(item.fecha_evento)}
      </TableCell>
      <TableCell className="min-w-[130px] text-sm font-medium text-[#143E29] dark:text-white">
        {turnoLabel(item)}
      </TableCell>
      <TableCell className="min-w-[90px] text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">
        Mesa {item.num_mesa}
      </TableCell>
      <TableCell className="min-w-[90px]">
        <Badge className={`border-0 text-xs font-medium ${rolBadge(isAnf)}`}>
          {isAnf ? "Anfitriona" : "Invitada"}
        </Badge>
      </TableCell>
      <TableCell className="min-w-[180px] text-sm text-muted-foreground dark:text-gray-300">
        {mine
          ? `${mine.representante_nombre} ${mine.representante_apellido}`.trim()
          : "—"}
      </TableCell>
      <TableCell className="min-w-[180px] font-semibold text-[#143E29] dark:text-white">
        {other?.empresa_nombre ?? (
          <span className="text-gray-400 dark:text-gray-400 font-normal italic text-xs">
            Sin empresa asignada
          </span>
        )}
      </TableCell>
      <TableCell className="min-w-[180px] text-sm text-muted-foreground dark:text-gray-300">
        {other
          ? `${other.representante_nombre} ${other.representante_apellido}`.trim()
          : "—"}
      </TableCell>
      <TableCell className="min-w-[200px] text-sm text-muted-foreground dark:text-gray-300">
        {other?.representante_email ?? "—"}
      </TableCell>
      <TableCell className="min-w-[90px]">
        <Badge className={`text-xs ${cls}`}>{label}</Badge>
      </TableCell>
    </TableRow>
  );
}

// ─── Meeting card ────────────────────────────────────────────────────────────

function MeetingCard({
  item,
  myEmpresaNombre,
}: {
  item: AsientoHistorialItem;
  myEmpresaNombre: string;
}) {
  const other = getOtherParticipant(item, myEmpresaNombre);
  const isAnf = amIAnfitriona(item, myEmpresaNombre);
  const { cls, label } = estadoBadge(item.estado);

  return (
    <Card className="border border-gray-200 dark:border-[#68A243]/20 dark:bg-[#143E29] hover:shadow-md transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-[#68A243] flex-shrink-0" />
            <span className="font-semibold text-gray-900 dark:text-white">
              {fmt(item.hora_inicio)} – {fmt(item.hora_fin)}
            </span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
              <TableProperties className="h-3.5 w-3.5" />
              Mesa {item.num_mesa}
            </span>
            <Badge
              className={`border-0 text-xs font-medium ${rolBadge(isAnf)}`}
            >
              {isAnf ? "Anfitriona" : "Invitada"}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-2">
        {other ? (
          <>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Reunión con
            </p>
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-[#68A243] flex-shrink-0" />
              <span className="font-semibold text-gray-900 dark:text-white">
                {other.empresa_nombre}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-gray-400 flex-shrink-0" />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {other.representante_nombre} {other.representante_apellido}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-gray-400 flex-shrink-0" />
              <span className="text-sm text-gray-600 dark:text-gray-400 break-all">
                {other.representante_email}
              </span>
            </div>
          </>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400 italic">
            Lugar reservado — aún sin empresa asignada
          </p>
        )}
        {(() => {
          const mine = item.participantes.find(
            (p) => p.empresa_nombre === myEmpresaNombre,
          );
          return mine ? (
            <div className="pt-2 mt-1 border-t border-gray-100 dark:border-[#68A243]/15 space-y-1">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Mi representante
              </p>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-[#68A243] flex-shrink-0" />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {mine.representante_nombre} {mine.representante_apellido}
                </span>
              </div>
            </div>
          ) : null;
        })()}
        <div className="pt-2 border-t border-gray-100 dark:border-[#68A243]/15">
          <Badge className={`text-xs ${cls}`}>{label}</Badge>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Skeleton ────────────────────────────────────────────────────────────────

function TableSkeleton() {
  return (
    <Card className="border border-gray-200 dark:border-[#68A243]/20 dark:bg-[#143E29] overflow-hidden">
      <CardHeader className="border-b border-gray-100 dark:border-[#68A243]/15 pb-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-32 dark:bg-[#0f2f25]" />
          <Skeleton className="h-8 w-48 dark:bg-[#0f2f25]" />
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-gray-100 dark:divide-[#68A243]/10">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-4 py-3">
              <Skeleton className="h-4 w-28 dark:bg-[#0f2f25]" />
              <Skeleton className="h-4 w-16 dark:bg-[#0f2f25]" />
              <Skeleton className="h-5 w-20 dark:bg-[#0f2f25]" />
              <Skeleton className="h-4 w-36 dark:bg-[#0f2f25]" />
              <Skeleton className="h-4 w-28 dark:bg-[#0f2f25]" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function Reuniones() {
  const { user, isPendingApproval } = useCurrentUser();
  const [historial, setHistorial] = useState<AsientoHistorialItem[]>([]);
  const [eventos, setEventos] = useState<EventoResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // View state (tabla por defecto)
  const [currView, setCurrView] = useState<"tabla" | "tarjetas">("tabla");
  const [histView, setHistView] = useState<"tabla" | "tarjetas">("tabla");

  // Filtros evento actual
  const [currTurnoFilter, setCurrTurnoFilter] = useState("all");
  const [currRolFilter, setCurrRolFilter] = useState<
    "all" | "anfitriona" | "invitada"
  >("all");

  // Filtros historial
  const [histEventoFilter, setHistEventoFilter] = useState("all");
  const [histTurnoFilter, setHistTurnoFilter] = useState("all");
  const [histRolFilter, setHistRolFilter] = useState<
    "all" | "anfitriona" | "invitada"
  >("all");
  const [histEstadoFilter, setHistEstadoFilter] = useState("all");
  const [histSearch, setHistSearch] = useState("");

  useEffect(() => {
    if (!user?.empresa_id) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [hist, evts] = await Promise.all([
          getAsientoHistorial(user.empresa_id),
          getEventos(),
        ]);
        setHistorial(hist);
        setEventos(evts);
      } catch (err) {
        const msg = getApiErrorMessage(err, "Error al cargar las reuniones");
        if (msg?.includes("You do not have permission")) {
          // La empresa está pendiente de aprobación — el aviso amarillo ya lo explica
          setError(null);
        } else {
          setError(msg);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.empresa_id]);

  const myEmpresaNombre = user?.razon_social ?? "";

  const activeEvent = useMemo(
    () => eventos.find((e) => e.estado === "activo") ?? null,
    [eventos],
  );

  const currentMeetings = useMemo(() => {
    if (!activeEvent) return [];
    return [
      ...historial.filter((item) => item.fecha_evento === activeEvent.fecha),
    ].sort((a, b) => a.hora_inicio.localeCompare(b.hora_inicio));
  }, [historial, activeEvent]);

  const pastMeetings = useMemo(() => {
    const base = activeEvent
      ? historial.filter((item) => item.fecha_evento !== activeEvent.fecha)
      : historial;
    return [...base].sort((a, b) =>
      b.fecha_evento.localeCompare(a.fecha_evento),
    );
  }, [historial, activeEvent]);

  // ── Opciones para filtros de historial ──────────────────────────────────

  const histEventos = useMemo(() => {
    return Array.from(new Set(pastMeetings.map((i) => i.evento))).sort();
  }, [pastMeetings]);

  const histTurnos = useMemo(() => {
    const seen = new Set<string>();
    const result: Array<{ key: string; label: string }> = [];
    const base =
      histEventoFilter === "all"
        ? pastMeetings
        : pastMeetings.filter((i) => i.evento === histEventoFilter);
    for (const item of base) {
      const k = turnoKey(item);
      if (!seen.has(k)) {
        seen.add(k);
        result.push({ key: k, label: turnoLabel(item) });
      }
    }
    return result.sort((a, b) => a.key.localeCompare(b.key));
  }, [pastMeetings, histEventoFilter]);

  const histEstados = useMemo(
    () => Array.from(new Set(pastMeetings.map((i) => i.estado))),
    [pastMeetings],
  );

  const currTurnos = useMemo(() => {
    const seen = new Set<string>();
    const result: Array<{ key: string; label: string }> = [];
    for (const item of currentMeetings) {
      const k = turnoKey(item);
      if (!seen.has(k)) {
        seen.add(k);
        result.push({ key: k, label: turnoLabel(item) });
      }
    }
    return result.sort((a, b) => a.key.localeCompare(b.key));
  }, [currentMeetings]);

  // ── Reuniones filtradas ─────────────────────────────────────────────────

  const filteredCurrentMeetings = useMemo(() => {
    return currentMeetings.filter((item) => {
      if (currTurnoFilter !== "all" && turnoKey(item) !== currTurnoFilter)
        return false;
      if (currRolFilter !== "all") {
        const isAnf = amIAnfitriona(item, myEmpresaNombre);
        if (currRolFilter === "anfitriona" && !isAnf) return false;
        if (currRolFilter === "invitada" && isAnf) return false;
      }
      return true;
    });
  }, [currentMeetings, currTurnoFilter, currRolFilter, myEmpresaNombre]);

  const filteredPastMeetings = useMemo(() => {
    return pastMeetings.filter((item) => {
      if (histEventoFilter !== "all" && item.evento !== histEventoFilter)
        return false;
      if (histTurnoFilter !== "all" && turnoKey(item) !== histTurnoFilter)
        return false;
      if (histRolFilter !== "all") {
        const isAnf = amIAnfitriona(item, myEmpresaNombre);
        if (histRolFilter === "anfitriona" && !isAnf) return false;
        if (histRolFilter === "invitada" && isAnf) return false;
      }
      if (histEstadoFilter !== "all" && item.estado !== histEstadoFilter)
        return false;
      if (histSearch.trim()) {
        const q = histSearch.trim().toLowerCase();
        const other = getOtherParticipant(item, myEmpresaNombre);
        const haystack = [
          item.evento,
          other?.empresa_nombre,
          other?.representante_nombre,
          other?.representante_apellido,
          other?.representante_email,
          `mesa ${item.num_mesa}`,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [
    pastMeetings,
    histEventoFilter,
    histTurnoFilter,
    histRolFilter,
    histEstadoFilter,
    histSearch,
    myEmpresaNombre,
  ]);

  // Grupos para la vista de tarjetas del historial
  const filteredPastByEvent = useMemo(() => {
    const groups: Record<string, AsientoHistorialItem[]> = {};
    for (const item of filteredPastMeetings) {
      if (!groups[item.evento]) groups[item.evento] = [];
      groups[item.evento].push(item);
    }
    return groups;
  }, [filteredPastMeetings]);

  const hasCurrFilters = currTurnoFilter !== "all" || currRolFilter !== "all";

  const hasHistFilters =
    histEventoFilter !== "all" ||
    histTurnoFilter !== "all" ||
    histRolFilter !== "all" ||
    histEstadoFilter !== "all" ||
    histSearch.trim().length > 0;

  const handleHistEventoChange = (value: string) => {
    setHistEventoFilter(value);
    setHistTurnoFilter("all"); // resetear turno al cambiar la ronda
  };

  const resetCurrFilters = () => {
    setCurrTurnoFilter("all");
    setCurrRolFilter("all");
  };

  const resetHistFilters = () => {
    setHistEventoFilter("all");
    setHistTurnoFilter("all");
    setHistRolFilter("all");
    setHistEstadoFilter("all");
    setHistSearch("");
  };

  return (
    <div className="min-h-screen bg-[#FAFBF8] dark:bg-[#0a1a15] flex flex-col transition-colors duration-300">
      <Navbar />

      {/* Hero — sin data-navbar-theme para que el navbar quede siempre verde oscuro */}
      <section className="bg-gradient-to-r from-[#143E29] via-[#1a5032] to-[#143E29] pt-24 pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-6 flex-wrap">
            <div className="flex items-center gap-4">
              <div className="rounded-2xl bg-white/10 p-3 shadow-lg shadow-black/10">
                <Handshake className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white tracking-tight">
                  Mis Reuniones
                </h1>
                <p className="text-white/70 text-base mt-0.5">
                  Gestión de turnos actuales e historial de reuniones
                </p>
              </div>
            </div>

            {activeEvent && (
              <div className="flex items-center gap-3 rounded-xl bg-white/10 px-4 py-2.5 backdrop-blur-sm border border-white/10">
                <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-[#68A243] shrink-0">
                  <Calendar className="h-4 w-4 text-white" />
                </div>
                <div className="min-w-0">
                  <p className="text-white font-semibold text-sm leading-tight truncate">
                    {activeEvent.nombre}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <span className="text-white/70 text-xs">
                      {formatDate(activeEvent.fecha)}
                    </span>
                    {activeEvent.ubicacion && (
                      <>
                        <span className="text-white/40 text-xs">·</span>
                        <span className="text-white/70 text-xs flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {activeEvent.ubicacion}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <span className="shrink-0 inline-flex items-center rounded-full bg-green-400/20 border border-green-400/30 px-2 py-0.5 text-[11px] font-semibold text-green-300">
                  Activo
                </span>
              </div>
            )}
          </div>
        </div>
      </section>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Pending */}
        {isPendingApproval && (
          <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 dark:border-amber-500/20 dark:bg-amber-500/10 p-4">
            <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800 dark:text-amber-200">
              Tu empresa todavía no fue aprobada. Una vez aprobada podrás
              inscribirte a turnos y ver tus reuniones aquí.
            </p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 dark:border-red-500/20 dark:bg-red-500/10 p-4">
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {/* Main tabs: Próximo evento / Historial */}
        <Tabs defaultValue="actual">
          <TabsList className="mb-2 bg-white dark:bg-[#143E29] border border-gray-200 dark:border-[#68A243]/20">
            <TabsTrigger
              value="actual"
              className="gap-2 data-[state=active]:bg-[#143E29] data-[state=active]:text-white dark:data-[state=active]:bg-white dark:data-[state=active]:text-[#143E29] dark:text-gray-300"
            >
              <CalendarCheck className="h-4 w-4" />
              Próximo evento
              {currentMeetings.length > 0 && (
                <span className="ml-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#68A243] text-[10px] font-bold text-white">
                  {currentMeetings.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="historial"
              className="gap-2 data-[state=active]:bg-[#143E29] data-[state=active]:text-white dark:data-[state=active]:bg-white dark:data-[state=active]:text-[#143E29] dark:text-gray-300"
            >
              <History className="h-4 w-4" />
              Historial
              {pastMeetings.length > 0 && (
                <span className="ml-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-gray-500 dark:bg-gray-600 text-[10px] font-bold text-white">
                  {pastMeetings.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          {/* ══════════════════════════════════════════
              PESTAÑA: PRÓXIMO EVENTO
          ══════════════════════════════════════════ */}
          <TabsContent value="actual" className="space-y-4">
            {loading ? (
              <TableSkeleton />
            ) : !activeEvent ? (
              <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
                <div className="p-4 rounded-full bg-gray-100 dark:bg-[#1a5032]">
                  <Calendar className="h-8 w-8 text-gray-400 dark:text-[#68A243]" />
                </div>
                <p className="font-medium text-gray-700 dark:text-gray-200">
                  No hay ningún evento activo en este momento
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm">
                  Cuando haya un evento activo, tus turnos reservados aparecerán
                  aquí.
                </p>
              </div>
            ) : (
              <>
                {currentMeetings.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center gap-3">
                    <div className="p-4 rounded-full bg-gray-100 dark:bg-[#1a5032]">
                      <Handshake className="h-8 w-8 text-gray-400 dark:text-[#68A243]" />
                    </div>
                    <p className="font-medium text-gray-700 dark:text-gray-200">
                      No tenés turnos reservados en este evento
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm">
                      Inscribite desde{" "}
                      <a
                        href="/turnos"
                        className="text-[#68A243] hover:underline font-medium"
                      >
                        Turnos
                      </a>
                      .
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Filtros de evento actual */}
                    <Card className="border border-gray-200 dark:border-[#68A243]/20 dark:bg-[#143E29]">
                      <CardContent className="px-4 py-4">
                        <div className="flex flex-wrap items-center gap-3">
                          {/* Turno */}
                          {currTurnos.length > 1 && (
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#3F6E20] dark:text-[#9FD27B] shrink-0">
                                Turno
                              </span>
                              <Select
                                value={currTurnoFilter}
                                onValueChange={setCurrTurnoFilter}
                              >
                                <SelectTrigger className="h-9 w-[160px] border-[#68A243]/20 bg-white dark:bg-[#0f2f25] dark:border-[#68A243]/20 dark:text-white">
                                  <SelectValue placeholder="Todos" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="all">
                                    Todos los turnos
                                  </SelectItem>
                                  {currTurnos.map((t) => (
                                    <SelectItem key={t.key} value={t.key}>
                                      {t.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          )}

                          {/* Rol */}
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#3F6E20] dark:text-[#9FD27B] shrink-0">
                              Mi rol
                            </span>
                            <Select
                              value={currRolFilter}
                              onValueChange={(v) =>
                                setCurrRolFilter(
                                  v as "all" | "anfitriona" | "invitada",
                                )
                              }
                            >
                              <SelectTrigger className="h-9 w-[150px] border-[#68A243]/20 bg-white dark:bg-[#0f2f25] dark:border-[#68A243]/20 dark:text-white">
                                <SelectValue placeholder="Todos" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">Todos</SelectItem>
                                <SelectItem value="anfitriona">
                                  Anfitriona
                                </SelectItem>
                                <SelectItem value="invitada">
                                  Invitada
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {hasCurrFilters && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={resetCurrFilters}
                              className="ml-auto h-9 border-[#68A243]/20 text-[#3F6E20] hover:bg-[#68A243]/10 dark:border-[#68A243]/20 dark:text-[#9FD27B] dark:bg-[#143E29] dark:hover:bg-[#68A243]/10"
                            >
                              <RotateCcw className="h-3.5 w-3.5 mr-1" />
                              Limpiar
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Vista tabla / tarjetas */}
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground dark:text-gray-400">
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {filteredCurrentMeetings.length}
                        </span>{" "}
                        {filteredCurrentMeetings.length === 1
                          ? "reunión"
                          : "reuniones"}
                      </p>
                      <div className="inline-flex rounded-xl bg-[#68A243]/8 dark:bg-[#0f2f25] p-1.5 gap-1">
                        {(
                          [
                            {
                              v: "tabla",
                              icon: TableProperties,
                              label: "Tabla",
                            },
                            {
                              v: "tarjetas",
                              icon: LayoutGrid,
                              label: "Tarjetas",
                            },
                          ] as const
                        ).map(({ v, icon: Icon, label }) => (
                          <button
                            key={v}
                            onClick={() => setCurrView(v)}
                            className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                              currView === v
                                ? "bg-white text-[#143E29] shadow-sm dark:bg-[#143E29] dark:text-white"
                                : "text-[#3F6E20] dark:text-[#9FD27B] hover:bg-white/60 dark:hover:bg-[#143E29]/60"
                            }`}
                          >
                            <Icon className="h-4 w-4" />
                            <span className="hidden sm:inline">{label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Vista tabla */}
                    {currView === "tabla" && (
                      <Card className="border border-gray-200 dark:border-[#68A243]/20 dark:bg-[#143E29] overflow-hidden">
                        <CardHeader className="border-b border-gray-100 dark:border-[#68A243]/15">
                          <CardTitle className="text-[#143E29] dark:text-white text-base">
                            Vista tabular
                          </CardTitle>
                          <CardDescription className="dark:text-gray-300">
                            Una fila por reunión del evento actual.
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                          <div className="w-full overflow-x-scroll [scrollbar-width:thin] [scrollbar-color:#d1d5db_transparent] dark:[scrollbar-color:#4a7c3f_transparent] [&::-webkit-scrollbar]:h-2.5 [&::-webkit-scrollbar-track]:rounded-b-lg [&::-webkit-scrollbar-track]:bg-gray-100 dark:[&::-webkit-scrollbar-track]:bg-[#0f2f25] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-300 hover:[&::-webkit-scrollbar-thumb]:bg-gray-400 dark:[&::-webkit-scrollbar-thumb]:bg-[#68A243]/60 dark:hover:[&::-webkit-scrollbar-thumb]:bg-[#68A243]/80">
                            <Table className="min-w-[1050px]">
                              <TableHeader>
                                <TableRow className="hover:bg-transparent dark:border-[#68A243]/20">
                                  <TableHead className="dark:text-gray-300">
                                    Fecha
                                  </TableHead>
                                  <TableHead className="dark:text-gray-300">
                                    Turno
                                  </TableHead>
                                  <TableHead className="dark:text-gray-300">
                                    Mesa
                                  </TableHead>
                                  <TableHead className="dark:text-gray-300">
                                    Mi rol
                                  </TableHead>
                                  <TableHead className="dark:text-gray-300">
                                    Mi representante
                                  </TableHead>
                                  <TableHead className="dark:text-gray-300">
                                    Empresa
                                  </TableHead>
                                  <TableHead className="dark:text-gray-300">
                                    Representante
                                  </TableHead>
                                  <TableHead className="dark:text-gray-300">
                                    Email representante
                                  </TableHead>
                                  <TableHead className="dark:text-gray-300">
                                    Estado
                                  </TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {filteredCurrentMeetings.length > 0 ? (
                                  filteredCurrentMeetings.map((item) => (
                                    <MeetingTableRow
                                      key={item.id}
                                      item={item}
                                      myEmpresaNombre={myEmpresaNombre}
                                    />
                                  ))
                                ) : (
                                  <TableRow className="hover:bg-transparent dark:border-[#68A243]/15">
                                    <TableCell
                                      colSpan={9}
                                      className="py-10 text-center text-muted-foreground dark:text-gray-300"
                                    >
                                      No hay reuniones para el filtro actual.
                                    </TableCell>
                                  </TableRow>
                                )}
                              </TableBody>
                            </Table>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Vista tarjetas */}
                    {currView === "tarjetas" &&
                      (filteredCurrentMeetings.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                          {filteredCurrentMeetings.map((item) => (
                            <MeetingCard
                              key={item.id}
                              item={item}
                              myEmpresaNombre={myEmpresaNombre}
                            />
                          ))}
                        </div>
                      ) : (
                        <div className="py-12 text-center text-muted-foreground dark:text-gray-300">
                          No hay reuniones para el filtro actual.
                        </div>
                      ))}
                  </>
                )}
              </>
            )}
          </TabsContent>

          {/* ══════════════════════════════════════════
              PESTAÑA: HISTORIAL
          ══════════════════════════════════════════ */}
          <TabsContent value="historial" className="space-y-4">
            {loading ? (
              <TableSkeleton />
            ) : pastMeetings.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
                <div className="p-4 rounded-full bg-gray-100 dark:bg-[#1a5032]">
                  <History className="h-8 w-8 text-gray-400 dark:text-[#68A243]" />
                </div>
                <p className="font-medium text-gray-700 dark:text-gray-200">
                  No hay historial de reuniones todavía
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm">
                  Una vez que participes de un evento, tus reuniones pasadas
                  aparecerán aquí.
                </p>
              </div>
            ) : (
              <>
                {/* ─── Barra de filtros historial ─── */}
                <Card className="border border-gray-200 dark:border-[#68A243]/20 dark:bg-[#143E29]">
                  <CardContent className="px-4 py-4 space-y-3">
                    {/* Fila 1: Ronda + Turno + Rol + Búsqueda + Limpiar */}
                    <div className="flex flex-wrap gap-3 items-center">
                      <div className="flex items-center gap-2">
                        <span className="shrink-0 text-xs font-semibold uppercase tracking-[0.14em] text-[#3F6E20] dark:text-[#9FD27B]">
                          Ronda
                        </span>
                        <Select
                          value={histEventoFilter}
                          onValueChange={handleHistEventoChange}
                        >
                          <SelectTrigger className="h-9 w-[180px] border-[#68A243]/20 bg-white dark:bg-[#0f2f25] dark:border-[#68A243]/20 dark:text-white">
                            <SelectValue placeholder="Todas las rondas" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">
                              Todas las rondas
                            </SelectItem>
                            {histEventos.map((nombre) => (
                              <SelectItem key={nombre} value={nombre}>
                                {nombre}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {histTurnos.length > 1 && (
                        <div className="flex items-center gap-2">
                          <span className="shrink-0 text-xs font-semibold uppercase tracking-[0.14em] text-[#3F6E20] dark:text-[#9FD27B]">
                            Turno
                          </span>
                          <Select
                            value={histTurnoFilter}
                            onValueChange={setHistTurnoFilter}
                          >
                            <SelectTrigger className="h-9 w-[150px] border-[#68A243]/20 bg-white dark:bg-[#0f2f25] dark:border-[#68A243]/20 dark:text-white">
                              <SelectValue placeholder="Todos" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">
                                Todos los turnos
                              </SelectItem>
                              {histTurnos.map((t) => (
                                <SelectItem key={t.key} value={t.key}>
                                  {t.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      <div className="flex items-center gap-2">
                        <span className="shrink-0 text-xs font-semibold uppercase tracking-[0.14em] text-[#3F6E20] dark:text-[#9FD27B]">
                          Mi rol
                        </span>
                        <Select
                          value={histRolFilter}
                          onValueChange={(v) =>
                            setHistRolFilter(
                              v as "all" | "anfitriona" | "invitada",
                            )
                          }
                        >
                          <SelectTrigger className="h-9 w-[140px] border-[#68A243]/20 bg-white dark:bg-[#0f2f25] dark:border-[#68A243]/20 dark:text-white">
                            <SelectValue placeholder="Todos" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Todos</SelectItem>
                            <SelectItem value="anfitriona">
                              Anfitriona
                            </SelectItem>
                            <SelectItem value="invitada">Invitada</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="relative flex-1 min-w-0">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          value={histSearch}
                          onChange={(e) => setHistSearch(e.target.value)}
                          placeholder="Buscar…"
                          className="h-9 w-full pl-9 border-[#68A243]/20 focus-visible:border-[#68A243] focus-visible:ring-[#68A243]/20 bg-white dark:bg-[#0f2f25] dark:border-[#68A243]/20 dark:text-white dark:placeholder-gray-400"
                        />
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={resetHistFilters}
                        disabled={!hasHistFilters}
                        className="h-9 shrink-0 border-[#68A243]/20 text-[#3F6E20] hover:bg-[#68A243]/10 disabled:opacity-40 dark:border-[#68A243]/20 dark:text-[#9FD27B] dark:bg-[#143E29] dark:hover:bg-[#68A243]/10"
                      >
                        <RotateCcw className="h-4 w-4 mr-1.5" />
                        Limpiar
                      </Button>
                    </div>

                    {/* Fila 2: Estado (solo si hay más de uno) */}
                    {histEstados.length > 1 && (
                      <div className="flex flex-wrap gap-4 items-center">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#3F6E20] dark:text-[#9FD27B] shrink-0">
                            Estado
                          </span>
                          <div className="flex gap-1.5 flex-wrap">
                            <FilterBadge
                              label="Todos"
                              active={histEstadoFilter === "all"}
                              onClick={() => setHistEstadoFilter("all")}
                            />
                            {histEstados.map((e) => (
                              <FilterBadge
                                key={e}
                                label={
                                  ESTADO_BADGE[e]?.label ??
                                  e.charAt(0).toUpperCase() + e.slice(1)
                                }
                                active={histEstadoFilter === e}
                                onClick={() => setHistEstadoFilter(e)}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Contador + toggle de vista */}
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground dark:text-gray-400">
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {filteredPastMeetings.length}
                    </span>{" "}
                    {filteredPastMeetings.length === 1
                      ? "reunión"
                      : "reuniones"}
                    {hasHistFilters && (
                      <span className="text-[#68A243] ml-1">(filtrado)</span>
                    )}
                  </p>
                  <div className="inline-flex rounded-xl bg-[#68A243]/8 dark:bg-[#0f2f25] p-1.5 gap-1">
                    {(
                      [
                        { v: "tabla", icon: TableProperties, label: "Tabla" },
                        { v: "tarjetas", icon: LayoutGrid, label: "Tarjetas" },
                      ] as const
                    ).map(({ v, icon: Icon, label }) => (
                      <button
                        key={v}
                        onClick={() => setHistView(v)}
                        className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                          histView === v
                            ? "bg-white text-[#143E29] shadow-sm dark:bg-[#143E29] dark:text-white"
                            : "text-[#3F6E20] dark:text-[#9FD27B] hover:bg-white/60 dark:hover:bg-[#143E29]/60"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        <span className="hidden sm:inline">{label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Vista tabla del historial */}
                {histView === "tabla" && (
                  <Card className="border border-gray-200 dark:border-[#68A243]/20 dark:bg-[#143E29] overflow-hidden">
                    <CardHeader className="border-b border-gray-100 dark:border-[#68A243]/15">
                      <CardTitle className="text-[#143E29] dark:text-white text-base">
                        Vista tabular
                      </CardTitle>
                      <CardDescription className="dark:text-gray-300">
                        Una fila por reunión. Ordenado de más reciente a más
                        antiguo.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="w-full overflow-x-scroll [scrollbar-width:thin] [scrollbar-color:#d1d5db_transparent] dark:[scrollbar-color:#4a7c3f_transparent] [&::-webkit-scrollbar]:h-2.5 [&::-webkit-scrollbar-track]:rounded-b-lg [&::-webkit-scrollbar-track]:bg-gray-100 dark:[&::-webkit-scrollbar-track]:bg-[#0f2f25] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-300 hover:[&::-webkit-scrollbar-thumb]:bg-gray-400 dark:[&::-webkit-scrollbar-thumb]:bg-[#68A243]/60 dark:hover:[&::-webkit-scrollbar-thumb]:bg-[#68A243]/80">
                        <Table className="min-w-[1200px]">
                          <TableHeader>
                            <TableRow className="hover:bg-transparent dark:border-[#68A243]/20">
                              <TableHead className="dark:text-gray-300">
                                Ronda
                              </TableHead>
                              <TableHead className="dark:text-gray-300">
                                Fecha
                              </TableHead>
                              <TableHead className="dark:text-gray-300">
                                Turno
                              </TableHead>
                              <TableHead className="dark:text-gray-300">
                                Mesa
                              </TableHead>
                              <TableHead className="dark:text-gray-300">
                                Mi rol
                              </TableHead>
                              <TableHead className="dark:text-gray-300">
                                Mi representante
                              </TableHead>
                              <TableHead className="dark:text-gray-300">
                                Empresa
                              </TableHead>
                              <TableHead className="dark:text-gray-300">
                                Representante
                              </TableHead>
                              <TableHead className="dark:text-gray-300">
                                Email representante
                              </TableHead>
                              <TableHead className="dark:text-gray-300">
                                Estado
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredPastMeetings.length > 0 ? (
                              filteredPastMeetings.map((item) => (
                                <MeetingTableRow
                                  key={item.id}
                                  item={item}
                                  myEmpresaNombre={myEmpresaNombre}
                                  showRonda
                                />
                              ))
                            ) : (
                              <TableRow className="hover:bg-transparent dark:border-[#68A243]/15">
                                <TableCell
                                  colSpan={10}
                                  className="py-10 text-center text-muted-foreground dark:text-gray-300"
                                >
                                  No hay registros para el filtro actual.
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Vista tarjetas del historial (agrupada por evento) */}
                {histView === "tarjetas" &&
                  (filteredPastMeetings.length === 0 ? (
                    <div className="py-12 text-center text-muted-foreground dark:text-gray-300">
                      No hay registros para el filtro actual.
                    </div>
                  ) : (
                    <div className="space-y-10">
                      {Object.entries(filteredPastByEvent).map(
                        ([eventoNombre, items]) => (
                          <div key={eventoNombre}>
                            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-200 dark:border-[#68A243]/20">
                              <div className="p-2 rounded-lg bg-gray-100 dark:bg-[#0f2f25]">
                                <Calendar className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900 dark:text-white">
                                  {eventoNombre}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  {formatDate(items[0]?.fecha_evento ?? "")}
                                </p>
                              </div>
                              <span className="ml-auto text-sm text-gray-400 dark:text-gray-400">
                                {items.length}{" "}
                                {items.length === 1 ? "reunión" : "reuniones"}
                              </span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                              {[...items]
                                .sort((a, b) =>
                                  a.hora_inicio.localeCompare(b.hora_inicio),
                                )
                                .map((item) => (
                                  <MeetingCard
                                    key={item.id}
                                    item={item}
                                    myEmpresaNombre={myEmpresaNombre}
                                  />
                                ))}
                            </div>
                          </div>
                        ),
                      )}
                    </div>
                  ))}
              </>
            )}
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
}
