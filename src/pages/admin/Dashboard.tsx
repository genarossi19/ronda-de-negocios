"use client";

import {
  AlertTriangle,
  Building2,
  Calendar,
  CheckCircle,
  Clock3,
  Handshake,
  LayoutDashboard,
  MapPin,
  TrendingUp,
  Users,
} from "lucide-react";
import { motion as m } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { getCompanies } from "../../api/EmpresaService";
import { getEventos } from "../../api/EventoService";
import { getMesasByTurnoId } from "../../api/MesaService";
import { getTurnoByEventoId } from "../../api/TurnoService";
import { useMotionContext } from "../../context/MotionPreferencesContext";
import Navbar from "../../components/Navbar";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Skeleton } from "../../components/ui/skeleton";
import Footer from "../../layout/Footer";
import { getApiErrorMessage, isSessionExpiredError } from "../../lib/axios";
import type { EmpresaResponse } from "../../types/Empresa";
import type { EventoResponse } from "../../types/Evento";
import type { MesaResponse } from "../../types/Mesa";
import type { TurnoResponse } from "../../types/Turno";

type QuickAction = {
  title: string;
  description: string;
  icon: typeof Calendar;
  href: string;
  requiresActiveEvent?: boolean;
};

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

function getClosestActiveEvent(eventos: EventoResponse[]) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    eventos
      .filter((evento) => evento.estado === "activo")
      .sort((first, second) => {
        const firstTime = new Date(`${first.fecha}T00:00:00`).getTime();
        const secondTime = new Date(`${second.fecha}T00:00:00`).getTime();
        const firstDistance = Math.abs(firstTime - today.getTime());
        const secondDistance = Math.abs(secondTime - today.getTime());

        if (firstDistance !== secondDistance) {
          return firstDistance - secondDistance;
        }

        return firstTime - secondTime;
      })[0] ?? null
  );
}

function sortTurnos(turnos: TurnoResponse[]) {
  return [...turnos].sort((firstTurno, secondTurno) => {
    if (firstTurno.hora_inicio === secondTurno.hora_inicio) {
      return firstTurno.id - secondTurno.id;
    }

    return firstTurno.hora_inicio.localeCompare(secondTurno.hora_inicio);
  });
}

function DashboardStatSkeleton() {
  return (
    <Card className="border-[#68A243]/20 dark:border-[#68A243]/30 dark:bg-[#143E29]">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <Skeleton className="h-4 w-32 dark:bg-[#0f2f25]" />
        <Skeleton className="h-10 w-10 rounded-lg dark:bg-[#0f2f25]" />
      </CardHeader>
      <CardContent>
        <Skeleton className="mb-2 h-10 w-20 dark:bg-[#0f2f25]" />
        <Skeleton className="h-4 w-40 dark:bg-[#0f2f25]" />
      </CardContent>
    </Card>
  );
}

function ContextSkeleton() {
  return (
    <Card className="overflow-hidden border-[#68A243]/20 dark:border-[#68A243]/30 dark:bg-[#143E29]">
      <CardHeader className="border-b border-[#68A243]/10 dark:border-[#68A243]/20">
        <Skeleton className="h-7 w-52 dark:bg-[#0f2f25]" />
      </CardHeader>
      <CardContent className="space-y-4 pt-6">
        <div className="space-y-4 rounded-2xl border border-[#68A243]/20 bg-[#68A243]/5 p-5 dark:bg-[#0f2f25]/70">
          <div className="flex items-start justify-between gap-3">
            <div className="w-full max-w-sm space-y-2">
              <Skeleton className="h-4 w-28 dark:bg-[#143E29]" />
              <Skeleton className="h-9 w-full dark:bg-[#143E29]" />
            </div>
            <Skeleton className="h-6 w-20 rounded-full dark:bg-[#143E29]" />
          </div>
          <Skeleton className="h-4 w-44 dark:bg-[#143E29]" />
          <Skeleton className="h-4 w-40 dark:bg-[#143E29]" />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Skeleton className="h-20 w-full rounded-xl dark:bg-[#143E29]" />
            <Skeleton className="h-20 w-full rounded-xl dark:bg-[#143E29]" />
          </div>
          <Skeleton className="h-10 w-full dark:bg-[#143E29]" />
        </div>
      </CardContent>
    </Card>
  );
}

function HighlightsSkeleton() {
  return (
    <Card className="overflow-hidden border-[#68A243]/20 dark:border-[#68A243]/30 dark:bg-[#143E29]">
      <CardHeader className="border-b border-[#68A243]/10 dark:border-[#68A243]/20">
        <Skeleton className="h-7 w-40 dark:bg-[#0f2f25]" />
        <Skeleton className="h-4 w-64 dark:bg-[#0f2f25]" />
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-4 pt-6 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="space-y-2 rounded-2xl border border-[#68A243]/15 bg-white p-4 dark:bg-[#0f2f25]/70"
          >
            <Skeleton className="h-4 w-28 dark:bg-[#143E29]" />
            <Skeleton className="h-8 w-20 dark:bg-[#143E29]" />
            <Skeleton className="h-4 w-36 dark:bg-[#143E29]" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { shouldReduceMotion } = useMotionContext();
  const [eventos, setEventos] = useState<EventoResponse[]>([]);
  const [companies, setCompanies] = useState<EmpresaResponse[]>([]);
  const [activeEventTurnos, setActiveEventTurnos] = useState<TurnoResponse[]>(
    [],
  );
  const [activeEventMesas, setActiveEventMesas] = useState<MesaResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  console.log("[Dashboard] shouldReduceMotion:", shouldReduceMotion);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);

        const [eventosData, companiesData] = await Promise.all([
          getEventos(),
          getCompanies() as Promise<EmpresaResponse[]>,
        ]);

        setEventos(eventosData);
        setCompanies(companiesData);

        const activeEvent = getClosestActiveEvent(eventosData);

        if (!activeEvent) {
          setActiveEventTurnos([]);
          setActiveEventMesas([]);
          return;
        }

        const turnosData = await getTurnoByEventoId(activeEvent.id);
        setActiveEventTurnos(turnosData);

        const mesasData = await Promise.all(
          turnosData.map((turno) => getMesasByTurnoId(turno.id)),
        );
        setActiveEventMesas(mesasData.flat());
      } catch (error) {
        console.error("Error loading dashboard data:", error);
        if (!isSessionExpiredError(error)) {
          const message = getApiErrorMessage(
            error,
            "No se pudo cargar la información del panel",
          );
          if (message) {
            toast.error(message);
          }
        }
        setEventos([]);
        setCompanies([]);
        setActiveEventTurnos([]);
        setActiveEventMesas([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const activeEvent = useMemo(() => getClosestActiveEvent(eventos), [eventos]);
  const activeEventId = activeEvent?.id ?? null;

  const visibleCompanies = useMemo(
    () => companies.filter((company) => !company.eliminado),
    [companies],
  );

  const approvedCompanies = useMemo(
    () => visibleCompanies.filter((company) => company.aprobada),
    [visibleCompanies],
  );

  const pendingCompanies = useMemo(
    () => visibleCompanies.filter((company) => !company.aprobada),
    [visibleCompanies],
  );

  const pendingEmailValidationCount = useMemo(
    () =>
      approvedCompanies.filter(
        (company) => !(company.email_confirmado ?? company.email_confirmardo),
      ).length,
    [approvedCompanies],
  );

  const turnosOrdenados = useMemo(
    () => sortTurnos(activeEventTurnos),
    [activeEventTurnos],
  );

  const nextOpenTurno = useMemo(
    () => turnosOrdenados.find((turno) => turno.estado === "abierto") ?? null,
    [turnosOrdenados],
  );

  const totalSeatCapacity = activeEventMesas.length * 2;
  const occupiedSeats = useMemo(
    () =>
      activeEventMesas.reduce(
        (accumulator, mesa) => accumulator + mesa.asientos.length,
        0,
      ),
    [activeEventMesas],
  );
  const occupancyRate = totalSeatCapacity
    ? Math.round((occupiedSeats / totalSeatCapacity) * 100)
    : 0;
  const mesasConReunion = useMemo(
    () => activeEventMesas.filter((mesa) => mesa.asientos.length > 0).length,
    [activeEventMesas],
  );
  const mesasCompletas = useMemo(
    () => activeEventMesas.filter((mesa) => mesa.asientos.length >= 2).length,
    [activeEventMesas],
  );
  const mesasLibres = Math.max(activeEventMesas.length - mesasConReunion, 0);

  const stats = useMemo(
    () => [
      {
        title: "Rondas disponibles",
        value: String(eventos.length),
        description: `${eventos.filter((evento) => evento.estado === "activo").length} activas, ${eventos.filter((evento) => evento.estado === "finalizado").length} finalizadas`,
        icon: Calendar,
        color: "text-[#68A243]",
        bg: "bg-[#68A243]/10",
      },
      {
        title: "Empresas registradas",
        value: String(visibleCompanies.length),
        description: `${approvedCompanies.length} aprobadas, ${pendingCompanies.length} pendientes`,
        icon: Users,
        color: "text-[#F5891F]",
        bg: "bg-[#F5891F]/10",
      },
      {
        title: "Turnos de ronda activa",
        value: String(activeEventTurnos.length),
        description: activeEvent
          ? `${activeEventTurnos.filter((turno) => turno.estado === "abierto").length} abiertos, ${activeEventTurnos.filter((turno) => turno.estado === "cerrado").length} cerrados`
          : "Sin ronda activa para operar",
        icon: Clock3,
        color: "text-green-600",
        bg: "bg-green-50",
      },
      {
        title: "Ocupación de mesas",
        value: `${occupancyRate}%`,
        description: activeEvent
          ? `${mesasCompletas} completas, ${mesasLibres} libres`
          : "Todavía no hay mesas operativas",
        icon: TrendingUp,
        color: "text-[#143E29]",
        bg: "bg-[#143E29]/10",
      },
    ],
    [
      eventos,
      visibleCompanies,
      approvedCompanies,
      pendingCompanies,
      activeEventTurnos,
      activeEvent,
      occupancyRate,
      mesasCompletas,
      mesasLibres,
    ],
  );

  const quickActions: QuickAction[] = [
    {
      title: "Gestionar Rondas",
      description: "Crear, editar y cerrar rondas de negocios",
      icon: Calendar,
      href: "/panel-administrador/gestionar-rondas",
    },
    {
      title: "Gestionar Turnos",
      description: activeEventId
        ? "Crear y actualizar turnos de la ronda activa"
        : "Necesitás una ronda activa para administrar turnos",
      icon: Clock3,
      href: activeEventId
        ? `/panel-administrador/turnos/${activeEventId}`
        : "/panel-administrador/gestionar-rondas",
      requiresActiveEvent: true,
    },
    {
      title: "Aprobar Empresas",
      description: "Revisar y aprobar registros de empresas",
      icon: Users,
      href: "/panel-administrador/empresas",
    },
    {
      title: "Ver Reuniones",
      description: "Monitorear todas las reuniones agendadas",
      icon: CheckCircle,
      href: "/panel-administrador/reuniones",
    },
  ];

  const highlightCards = useMemo(
    () => [
      {
        title: "Mesas con reuniones",
        value: String(mesasConReunion),
        description: activeEvent
          ? `Sobre ${activeEventMesas.length} mesas creadas`
          : "Sin ronda activa",
        icon: Handshake,
      },
      {
        title: "Empresas por aprobar",
        value: String(pendingCompanies.length),
        description:
          pendingCompanies.length > 0
            ? "Requieren revisión administrativa"
            : "No hay aprobaciones pendientes",
        icon: Building2,
      },
      {
        title: "Emails pendientes",
        value: String(pendingEmailValidationCount),
        description:
          pendingEmailValidationCount > 0
            ? "Empresas aprobadas sin validar email"
            : "Todas las aprobadas validaron email",
        icon: CheckCircle,
      },
      {
        title: "Próximo turno abierto",
        value: nextOpenTurno
          ? `${nextOpenTurno.hora_inicio} - ${nextOpenTurno.hora_fin}`
          : "Sin turnos abiertos",
        description: nextOpenTurno
          ? `${nextOpenTurno.cant_mesas} mesas disponibles para operar`
          : activeEvent
            ? "Abrí un turno para habilitar reservas"
            : "Activá una ronda para gestionar turnos",
        icon: AlertTriangle,
      },
    ],
    [
      mesasConReunion,
      activeEvent,
      activeEventMesas.length,
      pendingCompanies.length,
      pendingEmailValidationCount,
      nextOpenTurno,
    ],
  );

  const handleQuickActionClick = (action: QuickAction) => {
    if (action.requiresActiveEvent && !activeEventId) {
      toast.info("Primero activá una ronda para poder gestionar sus turnos");
    }

    navigate(action.href);
  };

  // Variantes que se adaptan a shouldReduceMotion
  // IMPORTANTE: hidden siempre es opacity: 0 para que el skeleton se vea
  const containerVariants = shouldReduceMotion
    ? {
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: 0,
            delayChildren: 0,
            duration: 0,
          },
        },
      }
    : {
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: 0.1,
            delayChildren: 0.2,
          },
        },
      };

  const itemVariants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: shouldReduceMotion ? { duration: 0 } : { duration: 0.6 },
    },
  };

  // Viewport configuration para solo animar elementos visibles
  const viewportConfig = { once: false, amount: 0.2 };

  // Variantes modernas y minimalistas para acciones rápidas
  const quickActionVariants = {
    hidden: { opacity: 0, y: 12, scale: 0.98 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: shouldReduceMotion
        ? { duration: 0 }
        : {
            duration: 0.42,
            ease: [0.32, 0.72, 0.26, 1], // Custom ease: smooth with slight overshoot
          },
    },
  };

  // Contenedor de acciones rápidas con stagger rápido y moderno
  // IMPORTANTE: hidden siempre es opacity: 0 para que el skeleton se vea
  const quickActionContainerVariants = shouldReduceMotion
    ? {
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: 0,
            delayChildren: 0,
            duration: 0,
          },
        },
      }
    : {
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: 0.09,
            delayChildren: 0.08,
          },
        },
      };

  return (
    <div className="flex min-h-screen flex-col bg-white transition-colors duration-300 dark:bg-[#0a1a15]">
      <Navbar />

      <div className="flex-1 px-4 pb-12 pt-24">
        <div className="mx-auto max-w-7xl">
          <m.div
            variants={itemVariants}
            initial="hidden"
            whileInView="visible"
            viewport={viewportConfig}
            className="mb-8 flex items-start justify-between"
          >
            <div>
              <div className="mb-2 flex items-center gap-3">
                <div className="rounded-lg bg-[#68A243] p-2 shadow-lg shadow-[#68A243]/20 dark:bg-[#68A243]">
                  <LayoutDashboard className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-[#143E29] transition-colors duration-300 dark:text-white">
                  Panel de Administración
                </h1>
              </div>
              <p className="text-lg text-muted-foreground dark:text-gray-300">
                Gestión completa de la Ronda de Negocios
              </p>
            </div>
          </m.div>

          <m.section className="mb-12 overflow-hidden rounded-[2rem] border border-[#68A243]/15 bg-gradient-to-br from-[#F7FBF3] via-white to-[#EEF6E7] p-6 shadow-[0_24px_60px_-36px_rgba(20,62,41,0.35)] dark:border-[#68A243]/20 dark:bg-none dark:bg-[#10271d]">
            <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.24em] text-[#68A243]">
                  Acciones Rápidas
                </p>
                <h2 className="text-2xl font-bold text-[#143E29] transition-colors duration-300 dark:text-white">
                  Menú
                </h2>
              </div>
            </div>

            <m.div
              variants={quickActionContainerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={viewportConfig}
              className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4"
            >
              {quickActions.map((action, index) => (
                <m.div key={index} variants={quickActionVariants}>
                  <Card
                    className="group h-full cursor-pointer border-[#68A243]/20 bg-white/90 backdrop-blur-sm transition-all hover:-translate-y-1 hover:border-[#68A243] hover:shadow-lg dark:border-[#68A243]/30 dark:bg-[#143E29] dark:hover:border-[#68A243]/50 dark:hover:shadow-xl dark:hover:shadow-[#68A243]/10"
                    onClick={() => handleQuickActionClick(action)}
                  >
                    <CardHeader>
                      <div className="mb-2 flex items-center gap-3">
                        <div className="rounded-lg bg-[#68A243]/10 p-2 transition-colors group-hover:bg-[#68A243] dark:bg-[#68A243]/20 dark:group-hover:bg-[#68A243]/40">
                          <action.icon className="h-6 w-6 text-[#68A243] transition-colors group-hover:text-white dark:group-hover:text-white" />
                        </div>
                        <CardTitle className="text-lg text-[#143E29] transition-colors duration-300 dark:text-white">
                          {action.title}
                        </CardTitle>
                      </div>
                      <CardDescription className="transition-colors duration-300 dark:text-gray-300">
                        {action.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button
                        variant="outline"
                        className="w-full border-[#68A243] bg-transparent text-[#68A243] hover:bg-[#68A243] hover:text-white dark:border-[#68A243]/60 dark:bg-transparent dark:text-[#68A243] dark:hover:border-[#68A243] dark:hover:bg-[#68A243] dark:hover:text-white"
                      >
                        Acceder
                      </Button>
                    </CardContent>
                  </Card>
                </m.div>
              ))}
            </m.div>
          </m.section>

          <m.section
            variants={itemVariants}
            initial="hidden"
            whileInView="visible"
            viewport={viewportConfig}
            className="mb-4"
          >
            <div className="mb-6 flex flex-col gap-3 border-t border-[#68A243]/15 pt-8 dark:border-[#68A243]/20 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.24em] text-[#68A243]">
                  Panorama actual
                </p>
                <h2 className="text-2xl font-bold text-[#143E29] transition-colors duration-300 dark:text-white">
                  Resumen y estadísticas
                </h2>
                <p className="mt-2 max-w-2xl text-sm text-muted-foreground dark:text-gray-300">
                  Indicadores en tiempo real del estado de la ronda activa,
                  ocupación de mesas, aprobaciones y operación general.
                </p>
              </div>
            </div>
          </m.section>

          {isLoading ? (
            <div className="space-y-8">
              <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <DashboardStatSkeleton key={index} />
                ))}
              </div>
              <div className="mb-10 grid grid-cols-1 gap-6 xl:grid-cols-[1.1fr_1.6fr]">
                <ContextSkeleton />
                <HighlightsSkeleton />
              </div>
            </div>
          ) : (
            <>
              <m.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4"
              >
                {stats.map((stat, index) => (
                  <m.div
                    key={index}
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    <Card className="h-full border-[#68A243]/20 transition-all duration-300 dark:border-[#68A243]/30 dark:bg-[#143E29]">
                      <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground dark:text-gray-300">
                          {stat.title}
                        </CardTitle>
                        <div
                          className={`${stat.bg} rounded-lg p-2 transition-colors duration-300 dark:bg-[#68A243]/20`}
                        >
                          <stat.icon className={`h-5 w-5 ${stat.color}`} />
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="mb-1 text-3xl font-bold text-[#143E29] transition-colors duration-300 dark:text-white">
                          {stat.value}
                        </div>
                        <p className="text-sm text-muted-foreground transition-colors duration-300 dark:text-gray-300">
                          {stat.description}
                        </p>
                      </CardContent>
                    </Card>
                  </m.div>
                ))}
              </m.div>

              <m.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="mb-10 grid grid-cols-1 gap-6 xl:grid-cols-[1.1fr_1.6fr]"
              >
                <m.div
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <Card className="h-full overflow-hidden border-[#68A243]/20 dark:border-[#68A243]/30 dark:bg-[#143E29]">
                    <CardHeader className="border-b border-[#68A243]/10 dark:border-[#68A243]/20">
                      <CardTitle className="text-xl text-[#143E29] dark:text-white">
                        Estado de la ronda activa
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                      {activeEvent ? (
                        <div className="space-y-4 rounded-2xl border border-[#68A243]/20 bg-[#68A243]/5 p-5 dark:bg-[#0f2f25]/70">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="mb-1 text-sm font-medium text-[#68A243]">
                                Operación actual
                              </p>
                              <h2 className="text-2xl font-semibold text-[#143E29] dark:text-white">
                                {activeEvent.nombre}
                              </h2>
                            </div>
                            <Badge className="border-transparent bg-[#143E29] text-white dark:bg-[#68A243]">
                              Activa
                            </Badge>
                          </div>

                          <div className="space-y-3 text-sm text-gray-700 dark:text-gray-200">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-[#68A243]" />
                              <span>{formatDate(activeEvent.fecha)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-[#68A243]" />
                              <span>{activeEvent.ubicacion}</span>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                            <div className="rounded-xl border border-[#68A243]/15 bg-white p-4 dark:bg-[#143E29]">
                              <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground dark:text-gray-300">
                                Turnos configurados
                              </p>
                              <p className="text-xl font-semibold text-[#143E29] dark:text-white">
                                {activeEventTurnos.length}
                              </p>
                            </div>
                            <div className="rounded-xl border border-[#68A243]/15 bg-white p-4 dark:bg-[#143E29]">
                              <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground dark:text-gray-300">
                                Mesas creadas
                              </p>
                              <p className="text-xl font-semibold text-[#143E29] dark:text-white">
                                {activeEventMesas.length}
                              </p>
                            </div>
                          </div>

                          <Button
                            className="w-full bg-[#68A243] text-white hover:bg-[#5a9038]"
                            onClick={() =>
                              navigate(
                                `/panel-administrador/turnos/${activeEvent.id}`,
                              )
                            }
                          >
                            <Clock3 className="h-4 w-4" />
                            Gestionar turnos activos
                          </Button>
                        </div>
                      ) : (
                        <div className="rounded-2xl border border-dashed border-[#68A243]/30 bg-[#68A243]/5 p-6 text-center dark:bg-[#143E29]/50">
                          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#68A243]/10 dark:bg-[#68A243]/20">
                            <AlertTriangle className="h-6 w-6 text-[#68A243]" />
                          </div>
                          <h3 className="mb-2 text-lg font-semibold text-[#143E29] dark:text-white">
                            No hay una ronda activa
                          </h3>
                          <p className="mb-5 text-sm text-muted-foreground dark:text-gray-300">
                            Activá o creá una ronda para empezar a operar
                            turnos, mesas y reuniones desde el panel.
                          </p>
                          <Button
                            onClick={() =>
                              navigate("/panel-administrador/gestionar-rondas")
                            }
                            className="bg-[#68A243] text-white hover:bg-[#5a9038]"
                          >
                            <Calendar className="h-4 w-4" />
                            Ir a gestionar rondas
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </m.div>

                <m.div
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <Card className="h-full overflow-hidden border-[#68A243]/20 dark:border-[#68A243]/30 dark:bg-[#143E29]">
                    <CardHeader className="border-b border-[#68A243]/10 dark:border-[#68A243]/20">
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                          <CardTitle className="text-xl text-[#143E29] dark:text-white">
                            Resumen operativo
                          </CardTitle>
                          <CardDescription className="mt-1 dark:text-gray-300">
                            Estado actual de aprobaciones, mesas y turnos del
                            evento activo.
                          </CardDescription>
                        </div>
                        {activeEvent ? (
                          <Badge className="w-fit border-[#68A243]/20 bg-[#68A243]/10 text-[#3F6E20] dark:border-[#68A243]/30 dark:bg-[#68A243]/20 dark:text-[#9FD27B]">
                            {activeEvent.nombre}
                          </Badge>
                        ) : null}
                      </div>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 gap-4 pt-6 md:grid-cols-2">
                      {highlightCards.map((highlight, index) => (
                        <div
                          key={index}
                          className="space-y-3 rounded-2xl border border-[#68A243]/15 bg-white p-4 dark:bg-[#0f2f25]/70"
                        >
                          <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-[#68A243]/10 p-2 dark:bg-[#68A243]/20">
                              <highlight.icon className="h-5 w-5 text-[#68A243]" />
                            </div>
                            <p className="text-sm font-medium text-muted-foreground dark:text-gray-300">
                              {highlight.title}
                            </p>
                          </div>
                          <p className="text-2xl font-bold text-[#143E29] dark:text-white">
                            {highlight.value}
                          </p>
                          <p className="text-sm text-muted-foreground dark:text-gray-300">
                            {highlight.description}
                          </p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </m.div>
              </m.div>
            </>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
