import { memo, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import {
  ArrowLeft,
  Building2,
  CalendarDays,
  Clock3,
  Coffee,
  Info,
  MapPin,
  Pause,
  Play,
  RefreshCw,
  RotateCcw,
  SkipForward,
  TableProperties,
  Timer,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Checkbox } from "../../components/ui/checkbox";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import { Skeleton } from "../../components/ui/skeleton";
import { toast } from "sonner";
import { ThemeToggle } from "../../components/ThemeToggle";
import { getEventos } from "../../api/EventoService";
import { getTurnoByEventoId } from "../../api/TurnoService";
import { getMesasByTurnoId } from "../../api/MesaService";
import { getApiErrorMessage, isSessionExpiredError } from "../../lib/axios";
import { createTurnoNumberMap } from "../../lib/utils";
import type { EventoResponse } from "../../types/Evento";
import type { TurnoResponse } from "../../types/Turno";
import type { MesaResponse } from "../../types/Mesa";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmt(time: string) {
  return time.slice(0, 5);
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(`${date}T00:00:00`));
}

/** Convierte "HH:MM" o "HH:MM:SS" a minutos */
function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

/** Calcula la duración de un turno en minutos */
function getTurnoDuration(turno: TurnoResponse): number {
  return Math.max(
    timeToMinutes(turno.hora_fin) - timeToMinutes(turno.hora_inicio),
    0,
  );
}

/**
 * Parsea entrada de tiempo flexible → segundos totales.
 * Acepta: "15" (minutos), "0030" o "030" (MMSS), "00:30" o "1:30" (MM:SS)
 */
function parseTimeInput(val: string): number {
  const trimmed = val.trim();
  if (trimmed.includes(":")) {
    const [mPart, sPart] = trimmed.split(":");
    const m = parseInt(mPart, 10) || 0;
    const s = Math.min(parseInt(sPart, 10) || 0, 59);
    return m * 60 + s;
  }
  if (/^\d{3,4}$/.test(trimmed)) {
    const s = Math.min(parseInt(trimmed.slice(-2), 10), 59);
    const m = parseInt(trimmed.slice(0, -2), 10) || 0;
    return m * 60 + s;
  }
  const mins = parseFloat(trimmed);
  return isNaN(mins) || mins <= 0 ? 0 : Math.round(mins * 60);
}

/** Minutos → "MM:SS" */
function formatCountdown(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function isInteractiveShortcutTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;

  return Boolean(
    target.closest(
      'input, textarea, select, button, a, [contenteditable="true"], [role="button"], [role="checkbox"], [role="combobox"], [role="menuitem"]',
    ),
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a1a15] flex flex-col">
      <header className="border-b border-[#68A243]/20 bg-white dark:bg-[#0f2f25] px-4 py-3 flex items-center gap-3">
        <Skeleton className="h-9 w-20 dark:bg-[#143E29]" />
        <Skeleton className="h-6 w-48 dark:bg-[#143E29]" />
      </header>
      <main className="flex-1 flex flex-col items-center justify-center gap-8 p-6">
        <Skeleton className="h-40 w-72 dark:bg-[#143E29] rounded-3xl" />
        <Skeleton className="h-10 w-52 dark:bg-[#143E29]" />
      </main>
    </div>
  );
}

// ─── Timer circular visual ────────────────────────────────────────────────────

interface CountdownDisplayProps {
  secondsLeft: number;
  totalSeconds: number;
  isRunning: boolean;
  isFinished: boolean;
  label: string;
  sublabel?: string;
  compact?: boolean;
  variant?: "turno" | "entretiempo";
}

function getRingColor(
  progress: number,
  isFinished: boolean,
  isIdle: boolean,
  variant: "turno" | "entretiempo",
): string {
  if (variant === "entretiempo") {
    if (isFinished) return "#3F6E20";
    if (isIdle) return "#3F6E2066";
    return "#3F6E20";
  }
  if (isFinished) return "#ef4444";
  if (isIdle) return "#68A24366";
  if (progress > 0.5) return "#68A243";
  if (progress > 0.25) return "#f97316";
  return "#ef4444";
}

function getTextColor(
  progress: number,
  isFinished: boolean,
  variant: "turno" | "entretiempo",
): string {
  if (variant === "entretiempo") {
    return isFinished
      ? "text-[#3F6E20] dark:text-[#9FD27B]"
      : "text-[#3F6E20] dark:text-[#9FD27B]";
  }
  if (isFinished) return "text-red-500 dark:text-red-400";
  if (progress > 0.5) return "text-[#143E29] dark:text-white";
  if (progress > 0.25) return "text-orange-500 dark:text-orange-400";
  return "text-red-500 dark:text-red-400";
}

function CountdownDisplay({
  secondsLeft,
  totalSeconds,
  isRunning,
  isFinished,
  label,
  sublabel,
  compact = false,
  variant = "turno",
}: CountdownDisplayProps) {
  const progress = totalSeconds > 0 ? secondsLeft / totalSeconds : 0;

  // Compact mode uses fixed size; full mode uses responsive SVG
  const compactSize = 140;
  const compactStroke = 8;
  const compactR = (compactSize - compactStroke) / 2;
  const compactCirc = 2 * Math.PI * compactR;
  const compactDash = compactCirc * progress;

  // Full mode: viewBox 400×400 so SVG scales with its container
  const vbSize = 400;
  const stroke = 18;
  const r = (vbSize - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const dash = circ * progress;

  const isIdle = !isRunning && secondsLeft === totalSeconds && !isFinished;
  const ringColor = getRingColor(progress, isFinished, isIdle, variant);
  const textColorClass = getTextColor(progress, isFinished, variant);

  if (compact) {
    return (
      <div className="flex flex-col items-center gap-3">
        <div
          className="relative"
          style={{ width: compactSize, height: compactSize }}
        >
          <svg
            width={compactSize}
            height={compactSize}
            className="-rotate-90"
            viewBox={`0 0 ${compactSize} ${compactSize}`}
          >
            <circle
              cx={compactSize / 2}
              cy={compactSize / 2}
              r={compactR}
              fill="none"
              stroke={ringColor}
              strokeWidth={compactStroke}
              opacity={0.12}
            />
            <circle
              cx={compactSize / 2}
              cy={compactSize / 2}
              r={compactR}
              fill="none"
              stroke={ringColor}
              strokeWidth={compactStroke}
              strokeDasharray={`${compactDash} ${compactCirc}`}
              strokeLinecap="round"
              style={{
                transition: "stroke-dasharray 1s linear, stroke 0.8s ease",
              }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
            <span
              className={`text-3xl font-mono font-bold tabular-nums leading-none transition-colors duration-700 ${textColorClass}`}
            >
              {formatCountdown(secondsLeft)}
            </span>
            {isRunning && !isFinished && (
              <span
                className="text-[10px] font-semibold animate-pulse uppercase tracking-widest"
                style={{ color: ringColor }}
              >
                {variant === "entretiempo" ? "Entretiempo" : "En curso"}
              </span>
            )}
            {isFinished && (
              <span className="text-[10px] font-semibold uppercase tracking-widest text-red-500 dark:text-red-400">
                Finalizado
              </span>
            )}
          </div>
        </div>
        <div className="text-center space-y-0.5">
          <p className="text-xs font-semibold text-[#143E29] dark:text-white">
            {label}
          </p>
          {sublabel && (
            <p className="text-xs text-muted-foreground dark:text-gray-300">
              {sublabel}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center w-full h-full gap-4 min-h-0">
      {/* Responsive ring: fills available square space */}
      <div className="relative w-full min-h-0 flex-1 flex items-center justify-center">
        <div
          className="w-full h-full"
          style={{
            maxWidth: "min(100%, 100vh - 280px)",
            maxHeight: "min(100%, 100vh - 280px)",
            aspectRatio: "1 / 1",
            position: "relative",
          }}
        >
          <svg
            viewBox={`0 0 ${vbSize} ${vbSize}`}
            className="w-full h-full -rotate-90"
            style={{ overflow: "visible" }}
          >
            <circle
              cx={vbSize / 2}
              cy={vbSize / 2}
              r={r}
              fill="none"
              stroke={ringColor}
              strokeWidth={stroke}
              opacity={0.12}
            />
            <circle
              cx={vbSize / 2}
              cy={vbSize / 2}
              r={r}
              fill="none"
              stroke={ringColor}
              strokeWidth={stroke}
              strokeDasharray={`${dash} ${circ}`}
              strokeLinecap="round"
              style={{
                transition: "stroke-dasharray 1s linear, stroke 0.8s ease",
              }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
            {/* {isRunning && !isFinished && (
              <span
                className="text-[clamp(0.6rem,1.5vw,0.875rem)] font-semibold animate-pulse uppercase tracking-widest"
                style={{ color: ringColor }}
              >
                {variant === "entretiempo" ? "Entretiempo" : "En curso"}
              </span>
            )} */}
            {isFinished && (
              <span className="text-[clamp(0.6rem,1.5vw,0.875rem)] font-semibold uppercase tracking-widest text-red-500 dark:text-red-400">
                Finalizado
              </span>
            )}
            <span
              className={`text-[clamp(3rem,12vw,7rem)] font-mono font-bold tabular-nums leading-none transition-colors duration-700 ${textColorClass}`}
            >
              {formatCountdown(secondsLeft)}
            </span>
          </div>
        </div>
      </div>
      <div className="text-center space-y-1 shrink-0">
        <p className="text-xl font-semibold text-[#143E29] dark:text-white">
          {label}
        </p>
        {sublabel && (
          <p className="text-sm text-muted-foreground dark:text-gray-300">
            {sublabel}
          </p>
        )}
      </div>
    </div>
  );
}
// ─── Componente SponsorCarousel Aislado con Loop Infinito Protegido ───────────

interface SponsorCarouselProps {
  logos: string[];
  direction?: "up" | "down";
}

interface ImageErrors {
  [key: string]: boolean;
}

const SALA_EN_VIVO_SPONSOR_LOGOS = ["/logo1.png", "/logo2.png", "/logo3.png"];
const SPONSOR_CARD_HEIGHT = 96;
const SPONSOR_GAP = 24;
const SPONSOR_ITEM_BLOCK_SIZE = SPONSOR_CARD_HEIGHT + SPONSOR_GAP;
const SPONSOR_SCROLL_SPEED = 28;

const SponsorCarousel = memo(function SponsorCarousel({
  logos,
  direction = "up",
}: SponsorCarouselProps) {
  const [imageErrors, setImageErrors] = useState<ImageErrors>({});
  const [containerHeight, setContainerHeight] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastFrameTimeRef = useRef<number | null>(null);
  const offsetRef = useRef(0);

  const loopedLogos = useMemo(() => {
    if (!logos.length) return [];

    const minimumItems =
      containerHeight > 0
        ? Math.ceil(containerHeight / SPONSOR_ITEM_BLOCK_SIZE) + 1
        : logos.length;
    const loopCopies = Math.max(1, Math.ceil(minimumItems / logos.length));

    return Array.from({ length: loopCopies }, () => logos).flat();
  }, [containerHeight, logos]);

  const duplicatedLogos = useMemo(
    () => [...loopedLogos, ...loopedLogos],
    [loopedLogos],
  );

  const loopDistance = loopedLogos.length * SPONSOR_ITEM_BLOCK_SIZE;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateHeight = () => {
      setContainerHeight(container.clientHeight);
    };

    updateHeight();

    const resizeObserver = new ResizeObserver(updateHeight);
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track || loopDistance <= 0) return;

    const animate = (timestamp: number) => {
      if (lastFrameTimeRef.current === null) {
        lastFrameTimeRef.current = timestamp;
      }

      const delta = timestamp - lastFrameTimeRef.current;
      lastFrameTimeRef.current = timestamp;

      offsetRef.current += (delta / 1000) * SPONSOR_SCROLL_SPEED;

      if (offsetRef.current >= loopDistance) {
        offsetRef.current -= loopDistance;
      }

      const translateY =
        direction === "down"
          ? offsetRef.current - loopDistance
          : -offsetRef.current;

      track.style.transform = `translate3d(0, ${translateY}px, 0)`;
      animationFrameRef.current = window.requestAnimationFrame(animate);
    };

    if (offsetRef.current >= loopDistance) {
      offsetRef.current %= loopDistance;
    }

    const initialTranslateY =
      direction === "down"
        ? offsetRef.current - loopDistance
        : -offsetRef.current;

    track.style.transform = `translate3d(0, ${initialTranslateY}px, 0)`;
    animationFrameRef.current = window.requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current);
      }
      animationFrameRef.current = null;
      lastFrameTimeRef.current = null;
    };
  }, [direction, loopDistance]);

  if (!logos.length) return null;

  return (
    <div ref={containerRef} className="w-full h-full overflow-hidden relative">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 z-10 h-16 bg-gradient-to-b from-gray-50 via-gray-50/80 to-transparent dark:from-[#0a1a15] dark:via-[#0a1a15]/80"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-16 bg-gradient-to-t from-gray-50 via-gray-50/80 to-transparent dark:from-[#0a1a15] dark:via-[#0a1a15]/80"
      />
      <div
        ref={trackRef}
        className="flex flex-col gap-6 px-2 will-change-transform"
      >
        {duplicatedLogos.map((src, i) => {
          const imageKey = `${src}-${i}`;
          const isBroken = imageErrors[imageKey];

          return (
            <div
              key={imageKey}
              className="h-24 w-full bg-transparent flex items-center justify-center p-1 shrink-0"
            >
              {!isBroken ? (
                <img
                  src={src}
                  alt={`Sponsor logo ${i + 1}`}
                  onError={() => {
                    setImageErrors((prev) => ({
                      ...prev,
                      [imageKey]: true,
                    }));
                  }}
                  className="max-h-full max-w-full object-contain opacity-85 dark:brightness-110"
                />
              ) : (
                <div
                  aria-label="Logo no disponible"
                  className="h-16 w-16 rounded-xl bg-slate-200/50 dark:bg-[#143E29]/40 border border-slate-300/30 flex items-center justify-center text-slate-400 dark:text-[#68A243]/60"
                >
                  <Building2 className="h-8 w-8" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
});

SponsorCarousel.displayName = "SponsorCarousel";
// ─── Main component ───────────────────────────────────────────────────────────

export default function SalaEnVivo() {
  const navigate = useNavigate();
  const { eventoId } = useParams();

  const [evento, setEvento] = useState<EventoResponse | null>(null);
  const [turnos, setTurnos] = useState<TurnoResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Timer state
  const [selectedTurnoId, setSelectedTurnoId] = useState<number | null>(null);
  const [customMinutes, setCustomMinutes] = useState<string>("");
  const [secondsLeft, setSecondsLeft] = useState<number>(0);
  const [totalSeconds, setTotalSeconds] = useState<number>(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [activeTab, setActiveTab] = useState<"cronometro" | "reuniones">(
    "cronometro",
  );
  const [isPresentationMode, setIsPresentationMode] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Entretiempo state
  const [timerMode, setTimerMode] = useState<"turno" | "entretiempo">("turno");
  const [breakMinutes, setBreakMinutes] = useState<string>("5");
  const [autoAdvance, setAutoAdvance] = useState(false);
  const pendingAutoStartRef = useRef(false);

  // Meetings state
  const [mesas, setMesas] = useState<MesaResponse[]>([]);
  const [mesasTurnoId, setMesasTurnoId] = useState<number | null>(null);
  const [isLoadingMesas, setIsLoadingMesas] = useState(false);
  const areSponsorsVisible = false;

  const turnoNumberMap = useMemo(() => createTurnoNumberMap(turnos), [turnos]);

  const turnosOrdenados = useMemo(
    () =>
      [...turnos].sort((a, b) => a.hora_inicio.localeCompare(b.hora_inicio)),
    [turnos],
  );

  const selectedTurno = useMemo(
    () => turnosOrdenados.find((t) => t.id === selectedTurnoId) ?? null,
    [turnosOrdenados, selectedTurnoId],
  );

  const nextTurno = useMemo(() => {
    if (!selectedTurno) return null;
    const idx = turnosOrdenados.findIndex((t) => t.id === selectedTurno.id);
    return idx >= 0 && idx < turnosOrdenados.length - 1
      ? turnosOrdenados[idx + 1]
      : null;
  }, [selectedTurno, turnosOrdenados]);

  const reunionesProyectables = useMemo(
    () =>
      mesas
        .slice()
        .sort((a, b) => a.num_mesa - b.num_mesa)
        .filter((mesa) => mesa.asientos.length > 0),
    [mesas],
  );

  const cronometroGridClass = isPresentationMode
    ? areSponsorsVisible
      ? "grid-cols-[140px_minmax(0,1fr)_140px]"
      : "grid-cols-[minmax(0,1fr)]"
    : areSponsorsVisible
      ? "grid-cols-[300px_1fr_120px]"
      : "grid-cols-[300px_1fr]";

  const visibleTab = isPresentationMode ? "cronometro" : activeTab;

  // ─── Load data ────────────────────────────────────────────────────────────

  useEffect(() => {
    const selectedEventoId = Number(eventoId);
    if (!selectedEventoId || Number.isNaN(selectedEventoId)) {
      navigate("/panel-administrador/gestionar-rondas", { replace: true });
      return;
    }

    const fetchData = async () => {
      try {
        setIsLoading(true);
        const eventos = await getEventos();
        const found = eventos.find((e) => e.id === selectedEventoId);

        if (!found || found.estado !== "activo") {
          toast.error(
            "Solo se puede usar la sala en vivo con una ronda activa",
          );
          navigate("/panel-administrador/gestionar-rondas", { replace: true });
          return;
        }

        setEvento(found);
        const data = await getTurnoByEventoId(found.id);
        setTurnos(data);

        if (data.length > 0) {
          const firstOpen =
            data.find((t) => t.estado === "abierto") ??
            data.sort((a, b) => a.hora_inicio.localeCompare(b.hora_inicio))[0];
          setSelectedTurnoId(firstOpen.id);
          const dur = getTurnoDuration(firstOpen) * 60;
          setTotalSeconds(dur);
          setSecondsLeft(dur);
          setCustomMinutes(String(getTurnoDuration(firstOpen)));
        }
      } catch (error) {
        if (!isSessionExpiredError(error)) {
          const msg = getApiErrorMessage(
            error,
            "No se pudieron cargar los datos",
          );
          if (msg) toast.error(msg);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [eventoId, navigate]);

  // ─── When selected turn changes, reset timer ──────────────────────────────

  useEffect(() => {
    if (!selectedTurno) return;
    stopTimer();
    setTimerMode("turno");
    const dur = getTurnoDuration(selectedTurno) * 60;
    setTotalSeconds(dur);
    setSecondsLeft(dur);
    setCustomMinutes(String(getTurnoDuration(selectedTurno)));
    setIsFinished(false);

    // Update break time deduced from gap to next turno
    const idx = turnosOrdenados.findIndex((t) => t.id === selectedTurnoId);
    if (idx >= 0 && idx < turnosOrdenados.length - 1) {
      const next = turnosOrdenados[idx + 1];
      const gap =
        timeToMinutes(next.hora_inicio) - timeToMinutes(selectedTurno.hora_fin);
      if (gap > 0) setBreakMinutes(String(gap));
    }

    if (pendingAutoStartRef.current) {
      pendingAutoStartRef.current = false;
      setTimeout(() => setIsRunning(true), 60);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTurnoId]);

  // ─── Timer tick ───────────────────────────────────────────────────────────

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current!);
            setIsRunning(false);
            setIsFinished(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.repeat) return;
      if (isInteractiveShortcutTarget(event.target)) return;

      if (event.code === "Space") {
        if (!selectedTurno || isFinished || secondsLeft === 0) return;

        event.preventDefault();

        if (isRunning) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          setIsRunning(false);
        } else {
          setIsRunning(true);
        }

        return;
      }

      if (event.key.toLowerCase() === "o") {
        event.preventDefault();
        setIsPresentationMode((prev) => !prev);
        return;
      }

      if (event.key === "ArrowRight") {
        if (!selectedTurno || !nextTurno) return;

        event.preventDefault();

        if (timerMode === "turno") {
          const secs = Math.max(parseTimeInput(breakMinutes), 1);
          setTimerMode("entretiempo");
          setTotalSeconds(secs);
          setSecondsLeft(secs);
          setIsFinished(false);
          setIsRunning(true);
          return;
        }

        pendingAutoStartRef.current = false;
        setTimerMode("turno");
        setSelectedTurnoId(nextTurno.id);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    breakMinutes,
    isFinished,
    isRunning,
    nextTurno,
    secondsLeft,
    selectedTurno,
    timerMode,
  ]);

  // ─── Auto-advance effect ──────────────────────────────────────────────────

  useEffect(() => {
    if (!isFinished || !autoAdvance) return;

    const delay = setTimeout(() => {
      if (timerMode === "turno" && nextTurno) {
        // turno finished → start entretiempo automatically
        const secs = Math.max(parseTimeInput(breakMinutes), 1);
        setTimerMode("entretiempo");
        setTotalSeconds(secs);
        setSecondsLeft(secs);
        setIsFinished(false);
        setIsRunning(true);
      } else if (timerMode === "entretiempo" && nextTurno) {
        // entretiempo finished → advance to next turno automatically
        pendingAutoStartRef.current = true;
        setTimerMode("turno");
        setSelectedTurnoId(nextTurno.id);
      }
    }, 1500);

    return () => clearTimeout(delay);
  }, [isFinished, autoAdvance, timerMode, nextTurno, breakMinutes]);

  // ─── Timer controls ───────────────────────────────────────────────────────

  function stopTimer() {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsRunning(false);
  }

  function handleStart() {
    if (isFinished) return;
    if (!isRunning) setIsRunning(true);
  }

  function handlePause() {
    stopTimer();
  }

  function handleReset() {
    stopTimer();
    setIsFinished(false);
    if (timerMode === "entretiempo") {
      const secs = Math.max(parseTimeInput(breakMinutes), 1);
      setTotalSeconds(secs);
      setSecondsLeft(secs);
    } else {
      const secs = parseTimeInput(customMinutes);
      if (secs > 0) {
        setTotalSeconds(secs);
        setSecondsLeft(secs);
      }
    }
  }

  function handleCustomMinutesChange(val: string) {
    setCustomMinutes(val);
    if (!isRunning) {
      const secs = parseTimeInput(val);
      if (secs > 0) {
        setTotalSeconds(secs);
        setSecondsLeft(secs);
        setIsFinished(false);
      }
    }
  }

  /** Inicia el entretiempo manualmente (sin auto-avance) */
  function startEntretiempo() {
    const secs = Math.max(parseTimeInput(breakMinutes), 1);
    setTimerMode("entretiempo");
    setTotalSeconds(secs);
    setSecondsLeft(secs);
    setIsFinished(false);
    setIsRunning(true);
  }

  /** Saltea el entretiempo y va al siguiente turno (sin auto-start) */
  function skipToNextTurno() {
    if (!nextTurno) return;
    pendingAutoStartRef.current = false;
    setTimerMode("turno");
    setSelectedTurnoId(nextTurno.id);
  }

  /** Avanza al siguiente turno e inicia automáticamente (post-entretiempo manual) */
  function advanceToNextTurno() {
    if (!nextTurno) return;
    pendingAutoStartRef.current = true;
    setTimerMode("turno");
    setSelectedTurnoId(nextTurno.id);
  }

  // ─── Load mesas for meetings tab ──────────────────────────────────────────

  async function loadMesas(turnoId: number, force = false) {
    if (!force && mesasTurnoId === turnoId) return;
    try {
      setIsLoadingMesas(true);
      const data = await getMesasByTurnoId(turnoId);
      setMesas(data);
      setMesasTurnoId(turnoId);
    } catch (error) {
      if (!isSessionExpiredError(error)) {
        const msg = getApiErrorMessage(
          error,
          "No se pudieron cargar las mesas",
        );
        if (msg) toast.error(msg);
      }
    } finally {
      setIsLoadingMesas(false);
    }
  }

  function handleTabChange(tab: string) {
    setActiveTab(tab === "reuniones" ? "reuniones" : "cronometro");

    if (tab === "reuniones" && selectedTurnoId) {
      loadMesas(selectedTurnoId);
    }
  }

  useEffect(() => {
    if (activeTab !== "reuniones" || !selectedTurnoId) return;
    if (mesasTurnoId === selectedTurnoId) return;
    loadMesas(selectedTurnoId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, selectedTurnoId, mesasTurnoId]);

  // ─── Render ───────────────────────────────────────────────────────────────

  if (isLoading) return <LoadingSkeleton />;
  if (!evento) return null;

  return (
    <div className="relative h-screen flex flex-col bg-gray-50 dark:bg-[#0a1a15] transition-colors duration-300 overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0">
        <img
          src="/fondo-claro.webp"
          alt=""
          className="block dark:hidden h-full w-full object-cover object-center"
        />
        <img
          src="/fondo-oscuro.webp"
          alt=""
          className="hidden dark:block h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-white/40 dark:bg-[#071710]/35" />
      </div>
      {/* ── Compact header ── */}
      <header
        className={`${isPresentationMode ? "hidden" : "shrink-0"} relative z-10 border-b border-[#0f2f25] bg-gradient-to-r from-[#143E29] via-[#1a5032] to-[#143E29] shadow-lg shadow-black/10 px-4 py-2.5`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                navigate(`/panel-administrador/turnos/${eventoId}`)
              }
              className="shrink-0 text-white/80 hover:text-white hover:bg-white/10 h-8 px-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Turnos
            </Button>

            <div className="h-5 w-px bg-white/20" />

            <div className="flex items-center gap-2 min-w-0">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-white/15">
                <Timer className="h-3 w-3 text-white" />
              </div>
              <span className="font-semibold text-white truncate text-sm">
                Sala en vivo
              </span>
              <span className="hidden sm:inline text-sm text-white/80 truncate">
                — {evento.nombre}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-2 text-xs text-white/90">
              <CalendarDays className="h-3.5 w-3.5 text-[#9FD27B]" />
              <span>{formatDate(evento.fecha)}</span>
              <MapPin className="h-3.5 w-3.5 text-[#9FD27B] ml-1" />
              <span>{evento.ubicacion}</span>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* ── Content ── */}
      <main
        className={`relative z-10 flex-1 min-h-0 ${isPresentationMode ? "px-0 py-0" : "px-4 py-3"}`}
      >
        <div
          className={`h-full flex flex-col ${isPresentationMode ? "w-full" : "max-w-7xl mx-auto"}`}
        >
          <Tabs
            value={visibleTab}
            onValueChange={handleTabChange}
            className="flex flex-col h-full"
          >
            <TabsList
              className={`${isPresentationMode ? "hidden" : "shrink-0 mb-3 w-fit"} bg-[#68A243]/10 dark:bg-[#143E29]/60`}
            >
              <TabsTrigger
                value="cronometro"
                className="data-[state=active]:bg-[#143E29] data-[state=active]:text-white dark:data-[state=active]:bg-[#68A243]"
              >
                <Clock3 className="h-4 w-4 mr-1.5" />
                Cronómetro
              </TabsTrigger>
              <TabsTrigger
                value="reuniones"
                className="data-[state=active]:bg-[#143E29] data-[state=active]:text-white dark:data-[state=active]:bg-[#68A243]"
              >
                <TableProperties className="h-4 w-4 mr-1.5" />
                Reuniones
              </TabsTrigger>
            </TabsList>

            {/* ── Cronómetro tab ── */}
            <TabsContent
              value="cronometro"
              className="flex-1 min-h-0 mt-0 data-[state=inactive]:hidden overflow-hidden"
            >
              <div
                className={`h-full grid gap-4 items-stretch ${cronometroGridClass}`}
              >
                {/* Left: settings + controls */}
                {(!isPresentationMode || areSponsorsVisible) && (
                  <div
                    className={
                      isPresentationMode
                        ? "py-4 overflow-hidden"
                        : "flex flex-col justify-center gap-3 overflow-y-auto"
                    }
                  >
                    {isPresentationMode ? (
                      <SponsorCarousel
                        logos={SALA_EN_VIVO_SPONSOR_LOGOS}
                        direction="down"
                      />
                    ) : (
                      <>
                  {/* Settings card */}
                  <div className="rounded-2xl border border-[#68A243]/25 bg-white dark:bg-[#0f2f25] shadow-sm p-4 space-y-3">
                    {timerMode === "turno" && (
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold uppercase tracking-wider text-[#68A243]">
                          Turno
                        </Label>
                        <Select
                          value={selectedTurnoId?.toString() ?? ""}
                          onValueChange={(val) =>
                            setSelectedTurnoId(Number(val))
                          }
                          disabled={isRunning}
                        >
                          <SelectTrigger className="h-10 border-[#68A243]/30 bg-[#68A243]/5 dark:bg-[#143E29] focus:ring-[#68A243] font-medium text-[#143E29] dark:text-white disabled:opacity-40">
                            <SelectValue placeholder="Seleccioná un turno" />
                          </SelectTrigger>
                          <SelectContent>
                            {turnosOrdenados.map((t) => (
                              <SelectItem key={t.id} value={t.id.toString()}>
                                Turno {turnoNumberMap.get(t.id)} ·{" "}
                                {fmt(t.hora_inicio)} – {fmt(t.hora_fin)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    {timerMode === "turno" && (
                      <div className="space-y-1.5">
                        <Label
                          htmlFor="custom-minutes"
                          className="text-xs font-semibold uppercase tracking-wider text-[#68A243]"
                        >
                          Duración (min o MM:SS)
                        </Label>
                        <Input
                          id="custom-minutes"
                          type="text"
                          inputMode="numeric"
                          value={customMinutes}
                          disabled={isRunning}
                          onChange={(e) =>
                            handleCustomMinutesChange(e.target.value)
                          }
                          className="h-10 border-[#68A243]/30 bg-[#68A243]/5 dark:bg-[#143E29] focus-visible:ring-[#68A243] font-semibold text-center text-[#143E29] dark:text-white disabled:opacity-40"
                          placeholder="15 ó 00:30"
                        />
                      </div>
                    )}
                    <div className="space-y-1.5">
                      <Label
                        htmlFor="break-minutes"
                        className="text-xs font-semibold uppercase tracking-wider text-[#3F6E20] dark:text-[#9FD27B]"
                      >
                        <Coffee className="h-3 w-3 inline mr-1" />
                        Entretiempo (min o MM:SS)
                      </Label>
                      <Input
                        id="break-minutes"
                        type="text"
                        inputMode="numeric"
                        value={breakMinutes}
                        disabled={timerMode === "entretiempo" && isRunning}
                        onChange={(e) => {
                          setBreakMinutes(e.target.value);
                          if (timerMode === "entretiempo" && !isRunning) {
                            const secs = Math.max(
                              parseTimeInput(e.target.value),
                              1,
                            );
                            setTotalSeconds(secs);
                            setSecondsLeft(secs);
                            setIsFinished(false);
                          }
                        }}
                        className="h-10 border-[#68A243]/30 bg-[#68A243]/5 dark:bg-[#3F6E20]/20 dark:border-[#3F6E20]/40 focus-visible:ring-[#3F6E20] font-semibold text-center text-[#3F6E20] dark:text-[#9FD27B] disabled:opacity-40"
                        placeholder="5"
                      />
                    </div>
                    {/* Auto-avance con Tooltip restaurado */}
                    {nextTurno && (
                      <div className="flex items-center gap-2.5 pt-1 pb-0.5">
                        <Checkbox
                          id="auto-advance"
                          checked={autoAdvance}
                          onCheckedChange={(v) => setAutoAdvance(!!v)}
                          className="border-[#68A243]/50 data-[state=checked]:bg-[#68A243] data-[state=checked]:border-[#68A243]"
                        />
                        <Label
                          htmlFor="auto-advance"
                          className="text-xs text-gray-700 dark:text-gray-300 cursor-pointer leading-tight flex items-center gap-2"
                        >
                          Avance automático
                          <TooltipProvider delayDuration={200}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="h-3.5 w-3.5 text-muted-foreground dark:text-gray-500 cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent
                                side="right"
                                className="max-w-56 text-xs leading-snug"
                              >
                                Al terminar cada turno, el entretiempo arranca
                                solo. Al terminar el entretiempo, el siguiente
                                turno arranca solo. Sin intervención manual.
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </Label>
                      </div>
                    )}
                  </div>

                  {/* Controls — modo TURNO corriendo o en pausa */}
                  {selectedTurno && timerMode === "turno" && !isFinished && (
                    <div className="flex flex-col gap-2">
                      {!isRunning ? (
                        <Button
                          onClick={handleStart}
                          disabled={secondsLeft === 0}
                          size="lg"
                          className="w-full bg-[#143E29] hover:bg-[#0f2f25] text-white dark:bg-[#68A243] dark:hover:bg-[#5a9038] gap-2 text-base"
                        >
                          <Play className="h-5 w-5" /> Iniciar turno
                        </Button>
                      ) : (
                        <Button
                          onClick={handlePause}
                          size="lg"
                          variant="outline"
                          className="w-full border-[#143E29] text-[#143E29] dark:border-[#68A243] dark:text-[#68A243] hover:bg-[#143E29] hover:text-white dark:hover:bg-[#68A243] dark:hover:text-white gap-2 text-base"
                        >
                          <Pause className="h-5 w-5" /> Pausar
                        </Button>
                      )}
                      {nextTurno && (
                        <Button
                          onClick={startEntretiempo}
                          variant="outline"
                          size="lg"
                          className="w-full border-[#143E29]/40 text-[#143E29]/80 dark:border-[#68A243]/40 dark:text-[#68A243]/70 hover:border-[#143E29] hover:text-[#143E29] dark:hover:border-[#68A243] dark:hover:text-[#68A243] hover:bg-transparent dark:hover:bg-transparent gap-2 text-base"
                        >
                          <SkipForward className="h-5 w-5" /> Saltar a
                          entretiempo
                        </Button>
                      )}
                      {/* Botón de reinicio recuperado */}
                      <Button
                        onClick={handleReset}
                        variant="ghost"
                        size="sm"
                        className="w-full text-muted-foreground hover:text-[#143E29] hover:bg-transparent dark:hover:text-[#9FD27B] dark:hover:bg-transparent gap-2"
                      >
                        <RotateCcw className="h-4 w-4" />
                        Reiniciar turno
                      </Button>
                    </div>
                  )}
                  {selectedTurno &&
                    timerMode === "turno" &&
                    isFinished &&
                    nextTurno && (
                      <div className="flex flex-col gap-2">
                        <Button
                          onClick={startEntretiempo}
                          size="lg"
                          className="w-full bg-[#3F6E20] hover:bg-[#143E29] dark:bg-[#3F6E20] dark:hover:bg-[#143E29] text-white gap-2 text-base"
                        >
                          <Coffee className="h-5 w-5" /> Iniciar entretiempo
                        </Button>
                        <Button
                          onClick={skipToNextTurno}
                          variant="outline"
                          size="lg"
                          className="w-full border-[#143E29] text-[#143E29] dark:border-[#68A243] dark:text-[#68A243] hover:bg-[#143E29] hover:text-white dark:hover:bg-[#68A243] dark:hover:text-white gap-2 text-base"
                        >
                          <SkipForward className="h-5 w-5" /> Saltear → Turno{" "}
                          {turnoNumberMap.get(nextTurno.id)}
                        </Button>
                      </div>
                    )}
                  {timerMode === "entretiempo" && !isFinished && (
                    <div className="flex flex-col gap-2">
                      {!isRunning ? (
                        <Button
                          onClick={handleStart}
                          size="lg"
                          className="w-full bg-[#3F6E20] hover:bg-[#143E29] text-white gap-2 text-base"
                        >
                          <Play className="h-5 w-5" /> Reanudar
                        </Button>
                      ) : (
                        <Button
                          onClick={handlePause}
                          size="lg"
                          variant="outline"
                          className="w-full border-[#3F6E20] text-[#3F6E20] dark:border-[#9FD27B] dark:text-[#9FD27B] hover:bg-[#3F6E20] hover:text-white dark:hover:bg-[#3F6E20] dark:hover:text-white gap-2 text-base"
                        >
                          <Pause className="h-5 w-5" /> Pausar
                        </Button>
                      )}
                      {nextTurno && (
                        <Button
                          onClick={skipToNextTurno}
                          variant="outline"
                          size="lg"
                          className="w-full border-[#3F6E20]/40 text-[#3F6E20]/80 dark:border-[#9FD27B]/40 dark:text-[#9FD27B]/70 hover:border-[#3F6E20] hover:text-[#3F6E20] dark:hover:border-[#9FD27B] dark:hover:text-[#9FD27B] hover:bg-transparent dark:hover:bg-transparent gap-2 text-base"
                        >
                          <SkipForward className="h-5 w-5" /> Saltear → Turno{" "}
                          {turnoNumberMap.get(nextTurno.id)}
                        </Button>
                      )}
                      {/* Botón Reiniciar Entretiempo */}
                      <Button
                        onClick={handleReset}
                        variant="ghost"
                        size="sm"
                        className="w-full text-muted-foreground hover:text-[#3F6E20] hover:bg-transparent dark:hover:text-[#9FD27B] dark:hover:bg-transparent gap-2"
                      >
                        <RotateCcw className="h-4 w-4" />
                        Reiniciar entretiempo
                      </Button>
                    </div>
                  )}
                  {timerMode === "entretiempo" && isFinished && nextTurno && (
                    <div className="flex flex-col gap-2">
                      <Button
                        onClick={advanceToNextTurno}
                        size="lg"
                        className="w-full bg-[#143E29] hover:bg-[#0f2f25] text-white dark:bg-[#68A243] dark:hover:bg-[#5a9038] gap-2 text-base"
                      >
                        <Play className="h-5 w-5" /> Iniciar Turno{" "}
                        {turnoNumberMap.get(nextTurno.id)}
                      </Button>
                    </div>
                  )}
                      </>
                    )}
                  </div>
                )}

                {/* Center: big timer */}
                <div className="flex flex-col items-center justify-center min-h-0 h-full p-2 min-w-0">
                  {isPresentationMode && (
                    <div className="shrink-0 text-center mb-4 sm:mb-6">
                      <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-[0.2em] uppercase mb-1 text-[#143E29] dark:text-white">
                        Ronda de Negocios
                      </h1>
                      <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-balance block bg-gradient-to-b from-[#143E29] from-40% to-[#68A243] dark:from-white dark:to-[#a0a0a0] bg-clip-text text-transparent">
                        Trenque Lauquen
                      </h2>
                    </div>
                  )}

                  <div className="flex-1 min-h-0 w-full flex items-center justify-center">
                    {selectedTurno ? (
                      <CountdownDisplay
                        secondsLeft={secondsLeft}
                        totalSeconds={totalSeconds}
                        isRunning={isRunning}
                        isFinished={isFinished}
                        variant={timerMode}
                        label={
                          timerMode === "entretiempo"
                            ? `Entretiempo · ${fmt(selectedTurno.hora_fin)} → ${nextTurno ? fmt(nextTurno.hora_inicio) : "–"}`
                            : `Turno ${turnoNumberMap.get(selectedTurno.id)} · ${fmt(selectedTurno.hora_inicio)} – ${fmt(selectedTurno.hora_fin)}`
                        }
                        sublabel={
                          timerMode === "entretiempo" && nextTurno
                            ? `A continuación: Turno ${turnoNumberMap.get(nextTurno.id)} (${getTurnoDuration(nextTurno)} min)`
                            : timerMode === "turno" && nextTurno
                              ? `Próximo turno: ${fmt(nextTurno.hora_inicio)} – ${fmt(nextTurno.hora_fin)}`
                              : undefined
                        }
                      />
                    ) : (
                      <div className="text-center text-muted-foreground dark:text-gray-300">
                        <Clock3 className="h-14 w-14 mx-auto mb-3 opacity-20" />
                        <p className="text-lg">
                          Seleccioná un turno para empezar
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Vertical Sponsor Carousel Continuous Loop */}
                {areSponsorsVisible && (
                  <div className="py-4 overflow-hidden">
                    <SponsorCarousel
                      logos={SALA_EN_VIVO_SPONSOR_LOGOS}
                      direction="up"
                    />
                  </div>
                )}
              </div>
            </TabsContent>

            {/* ── Reuniones tab ── */}
            <TabsContent
              value="reuniones"
              className="flex-1 min-h-0 mt-0 data-[state=inactive]:hidden"
            >
              <div className="h-full flex flex-col gap-3">
                <div className="shrink-0 rounded-2xl border border-[#68A243]/20 bg-white/88 dark:bg-[#0f2f25]/88 backdrop-blur-sm px-5 py-3 shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#68A243]">
                        Reuniones del turno actual
                      </p>
                      <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1">
                        <h2 className="text-2xl sm:text-3xl font-bold text-[#143E29] dark:text-white leading-tight">
                          {selectedTurno
                            ? `Turno ${turnoNumberMap.get(selectedTurno.id)}`
                            : "Turno sin seleccionar"}
                        </h2>
                        {selectedTurno && (
                          <span className="text-base sm:text-lg font-medium text-gray-700 dark:text-gray-200">
                            {fmt(selectedTurno.hora_inicio)} - {fmt(selectedTurno.hora_fin)}
                          </span>
                        )}
                        <Badge className="border-[#68A243]/30 bg-[#68A243]/10 text-[#3F6E20] dark:bg-[#68A243]/20 dark:text-[#9FD27B]">
                          {reunionesProyectables.length} mesa{reunionesProyectables.length === 1 ? "" : "s"}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#68A243]">
                          Cronometro
                        </p>
                        <p className="font-mono text-3xl sm:text-4xl font-bold tabular-nums leading-none text-[#143E29] dark:text-white">
                          {formatCountdown(secondsLeft)}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (selectedTurnoId) loadMesas(selectedTurnoId, true);
                        }}
                        className="text-[#68A243] hover:text-[#68A243] hover:bg-[#68A243]/10 gap-1.5"
                      >
                        <RefreshCw className="h-3.5 w-3.5" />
                        Actualizar
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="min-h-0 flex-1 rounded-2xl border border-[#68A243]/20 bg-white/88 dark:bg-[#0f2f25]/88 backdrop-blur-sm p-3 shadow-sm overflow-hidden">
                  {isLoadingMesas ? (
                    <div className="grid h-full grid-cols-2 xl:grid-cols-3 gap-3 auto-rows-fr">
                      {Array.from({ length: 12 }).map((_, i) => (
                        <Skeleton
                          key={i}
                          className="h-full min-h-24 rounded-2xl dark:bg-[#143E29]"
                        />
                      ))}
                    </div>
                  ) : reunionesProyectables.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground dark:text-gray-300 gap-3">
                      <TableProperties className="h-12 w-12 opacity-25" />
                      <p className="text-xl font-semibold">
                        No hay reuniones asignadas para el turno actual
                      </p>
                      <p className="text-sm max-w-md">
                        Actualiza la vista cuando las mesas ya esten armadas.
                      </p>
                    </div>
                  ) : (
                    <div className="h-full overflow-y-auto pr-1">
                      <div className="grid grid-cols-2 xl:grid-cols-3 gap-3 auto-rows-fr">
                        {reunionesProyectables.map((mesa) => {
                          const participantes = mesa.asientos.map((asiento) => ({
                            id: asiento.id,
                            empresa: asiento.empresa_nombre,
                            representante: [
                              asiento.representante_nombre,
                              asiento.representante_apellido,
                            ]
                              .filter(Boolean)
                              .join(" "),
                          }));

                          return (
                            <article
                              key={mesa.id}
                              className="grid grid-cols-[78px_1fr] gap-3 rounded-2xl border border-[#68A243]/20 bg-white/75 dark:bg-[#143E29]/60 p-3 shadow-sm min-h-28"
                            >
                              <div className="rounded-xl bg-[#143E29] text-white dark:bg-[#68A243] dark:text-[#143E29] flex flex-col items-center justify-center text-center px-2">
                                <span className="text-[10px] font-semibold uppercase tracking-[0.18em] opacity-80">
                                  Mesa
                                </span>
                                <span className="mt-1 text-3xl font-extrabold leading-none">
                                  {mesa.num_mesa}
                                </span>
                              </div>

                              <div className="min-w-0 flex flex-col justify-center divide-y divide-[#68A243]/15">
                                {participantes.map((participante) => (
                                  <div key={participante.id} className="py-1.5 first:pt-0 last:pb-0">
                                    <p className="text-base 2xl:text-lg font-bold leading-tight text-[#143E29] dark:text-white truncate">
                                      {participante.empresa}
                                    </p>
                                    <p className="text-sm 2xl:text-base leading-tight text-gray-700 dark:text-gray-200 truncate">
                                      {participante.representante || "Representante no asignado"}
                                    </p>
                                  </div>
                                ))}
                                {participantes.length === 1 && (
                                  <div className="py-1.5 text-xs font-medium text-amber-700 dark:text-amber-300">
                                    Mesa parcial
                                  </div>
                                )}
                              </div>
                            </article>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
