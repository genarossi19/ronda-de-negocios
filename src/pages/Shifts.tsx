import { useEffect, useMemo, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../layout/Footer";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Skeleton } from "../components/ui/skeleton";
import ConfirmarParticipacionDialog from "../components/ConfirmarParticipacionDialog";
import {
  Calendar,
  CalendarDays,
  Clock,
  Users,
  ArrowRight,
  AlertCircle,
  Settings,
  Mail,
  ShieldAlert,
  Bell,
  Sparkles,
  CheckCircle2,
  MapPin,
} from "lucide-react";
import { useCurrentUser } from "../hooks/useCurrentUser";
import { HelpTutorial } from "../components/HelpTutorial";
import { Link, useNavigate } from "react-router";
import { getTurnoByEventoId } from "../api/TurnoService";
import { getEventos } from "../api/EventoService";
import { confirmarParticipacion } from "../api/EmpresaService";
import { getApiErrorMessage } from "../lib/axios";
import { createTurnoNumberMap } from "../lib/utils";
import { toast } from "sonner";
import type { EventoResponse } from "../types/Evento";
import type { TurnoResponse } from "../types/Turno";

function formatDate(date: string) {
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(`${date}T00:00:00`));
}

function getActiveEvent(eventos: EventoResponse[]) {
  return eventos.find((evento) => evento.estado === "activo") ?? null;
}

export default function Shifts() {
  const navigate = useNavigate();
  const [shifts, setShifts] = useState<TurnoResponse[]>([]);
  const [activeEvent, setActiveEvent] = useState<EventoResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [noActiveEvent, setNoActiveEvent] = useState(false);
  const [approvalNotice, setApprovalNotice] = useState<string | null>(null);
  const [noParticipation, setNoParticipation] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [fetchKey, setFetchKey] = useState(0);
  const { isAuthenticated, isAdmin, isPendingApproval, isApprovedCompany } =
    useCurrentUser();

  useEffect(() => {
    const fetchTurno = async () => {
      if (isPendingApproval) {
        setActiveEvent(null);
        setShifts([]);
        setError(null);
        setApprovalNotice(
          "Tu empresa todavía no fue aprobada por el equipo administrador. Cuando eso ocurra vas a poder inscribirte a los turnos y recibirás un mail de confirmación. Mientras tanto puedes ver las empresas inscriptas y gestionar tus representantes",
        );
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        setNoActiveEvent(false);
        setApprovalNotice(null);
        setNoParticipation(false);
        const eventos = await getEventos();
        const eventoActivo = getActiveEvent(eventos);

        if (!eventoActivo) {
          setActiveEvent(null);
          setShifts([]);
          setNoActiveEvent(true);
          return;
        }

        setActiveEvent(eventoActivo);

        const data = await getTurnoByEventoId(eventoActivo.id);
        setShifts(data);
      } catch (err) {
        console.error(err);
        const apiMessage = getApiErrorMessage(
          err,
          "No se pudieron cargar los turnos. Intentá de nuevo más tarde.",
        );

        if (
          apiMessage?.includes(
            "You do not have permission to perform this action",
          )
        ) {
          // Solo mostrar el mensaje de aprobación pendiente si la empresa NO está aprobada
          if (!isApprovedCompany) {
            setError(null);
            setApprovalNotice(
              "Tu empresa todavía no fue aprobada por el equipo administrador. Cuando eso ocurra vas a poder inscribirte a los turnos y recibirás un mail de confirmación.",
            );
            return;
          }
          // Si está aprobada pero aún recibe error de permiso, mostrar como error genérico
          setError(
            apiMessage ??
              "No se pudieron cargar los turnos. Intentá de nuevo más tarde.",
          );
          return;
        }

        if (
          apiMessage?.includes("permiso para ver los turnos") ||
          apiMessage?.includes("no participa del evento activo")
        ) {
          setNoParticipation(true);
          setError(null);
          return;
        }

        setError(
          apiMessage ??
            "No se pudieron cargar los turnos. Intentá de nuevo más tarde.",
        );
      } finally {
        setLoading(false);
      }
    };
    fetchTurno();
  }, [isPendingApproval, fetchKey]);

  const filteredShifts = shifts;

  const handleConfirmarParticipacion = async () => {
    setIsConfirming(true);
    try {
      await confirmarParticipacion();
      setIsConfirmOpen(false);
      setNoParticipation(false);
      setFetchKey((k) => k + 1);
      toast.success("¡Participación confirmada! Ya podés ver los turnos.");
    } catch (err) {
      const msg = getApiErrorMessage(
        err,
        "Error al confirmar participación. Intentá de nuevo.",
      );
      toast.error(msg ?? "Error al confirmar participación.");
    } finally {
      setIsConfirming(false);
    }
  };

  const turnoNumberMap = useMemo(
    () => createTurnoNumberMap(filteredShifts),
    [filteredShifts],
  );

  const getStatusBadge = (status: TurnoResponse["estado"]) => {
    switch (status) {
      case "abierto":
        return (
          <Badge className="bg-[#68A243] hover:bg-[#68A243]/90">
            Disponible
          </Badge>
        );
      case "full":
        return <Badge variant="destructive">Completo</Badge>;
      case "cerrado":
        return (
          <Badge className="bg-gray-400 text-gray-800 hover:bg-gray-500 dark:bg-gray-600 dark:text-gray-100 dark:hover:bg-gray-700">
            Cerrado
          </Badge>
        );
      default:
        return null;
    }
  };

  const tutorialSteps = [
    {
      title: "Bienvenido a los Turnos",
      description:
        "En esta sección podés ver todos los turnos disponibles para la ronda de negocios. Cada turno tiene mesas donde podrás reunirte 1 a 1 con otras empresas.",
      icon: <Calendar className="h-16 w-16 text-[#68A243]" />,
    },
    {
      title: "Información del Turno",
      description:
        "Cada tarjeta muestra el horario del turno, la cantidad de mesas disponibles y el porcentaje de ocupación. Los turnos con estado 'Disponible' tienen mesas libres para reservar.",
      icon: <Clock className="h-16 w-16 text-[#68A243]" />,
    },
    {
      title: "Ver Mesas Disponibles",
      description:
        "Hacé click en 'Ver Mesas Disponibles' para acceder a la vista de mesas del turno. Allí podrás elegir una mesa libre o unirte a una donde ya hay otra empresa esperando.",
      icon: <ArrowRight className="h-16 w-16 text-[#68A243]" />,
    },
    {
      title: "Estado de Ocupación",
      description:
        "La barra de progreso te muestra visualmente qué tan ocupado está cada turno. Cuanto más llena la barra, menos mesas disponibles hay. Los turnos con estado 'Completo' no admiten más reservas.",
      icon: <Users className="h-16 w-16 text-[#68A243]" />,
    },
  ];

  if (!isAuthenticated) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-white dark:bg-[#0a1a15] pt-20 transition-colors duration-300">
          <div className="max-w-4xl mx-auto px-4 py-16">
            <Card className="text-center dark:bg-[#143E29] dark:border-[#68A243]/20 transition-colors duration-300">
              <CardHeader>
                <CardTitle className="text-2xl text-[#143E29] dark:text-white transition-colors duration-300">
                  Acceso Restringido
                </CardTitle>
                <CardDescription className="dark:text-gray-300 transition-colors duration-300">
                  Debes iniciar sesión para ver y reservar turnos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link to={"/login"}>
                  <Button className="bg-[#68A243] hover:bg-[#68A243]/90 text-white">
                    Iniciar Sesión
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-white dark:bg-[#0a1a15] pt-8 pb-4 transition-colors duration-300">
        <div className="bg-gradient-to-br from-[#143E29] to-[#143E29]/90 dark:from-[#0f2f25] dark:to-[#143E29] text-white py-12 transition-colors duration-300">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold mb-2">Turnos Disponibles</h1>
                <p className="text-gray-200 text-lg">
                  Seleccioná un turno y elegí tu mesa para la ronda de negocios
                </p>
              </div>
              <div className="hidden md:flex md:flex-col md:gap-3">
                {isAdmin && (
                  <Button
                    onClick={() =>
                      navigate(
                        activeEvent
                          ? `/panel-administrador/turnos/${activeEvent.id}`
                          : "/panel-administrador/gestionar-rondas",
                      )
                    }
                    className="w-full h-11 gap-2 bg-[#68A243] hover:bg-[#5a9038] text-white font-semibold"
                  >
                    <Settings className="h-4 w-4" />
                    Gestionar turnos
                  </Button>
                )}
                <div className="w-full bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                  <div className="flex items-center gap-2 text-sm mb-2">
                    <Calendar className="h-4 w-4 text-[#68A243]" />
                    <span className="font-semibold">Fecha del Evento</span>
                  </div>
                  <p className="text-xl font-bold">
                    {activeEvent ? formatDate(activeEvent.fecha) : "Sin fecha"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {loading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
              {[...Array(4)].map((_, i) => (
                <Card
                  key={i}
                  className="border-2 dark:bg-[#143E29] dark:border-[#68A243]/20 transition-colors duration-300"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <Skeleton className="h-7 w-28 dark:bg-[#0f2f25]" />
                        <Skeleton className="h-4 w-48 dark:bg-[#0f2f25]" />
                      </div>
                      <Skeleton className="h-6 w-20 rounded-full dark:bg-[#0f2f25]" />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-9 w-9 rounded-lg dark:bg-[#0f2f25]" />
                        <div className="space-y-1">
                          <Skeleton className="h-3 w-16 dark:bg-[#0f2f25]" />
                          <Skeleton className="h-5 w-32 dark:bg-[#0f2f25]" />
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-9 w-9 rounded-lg dark:bg-[#0f2f25]" />
                        <div className="space-y-1">
                          <Skeleton className="h-3 w-16 dark:bg-[#0f2f25]" />
                          <Skeleton className="h-5 w-24 dark:bg-[#0f2f25]" />
                        </div>
                      </div>
                    </div>
                    <div className="pt-2 space-y-2">
                      <div className="flex justify-between">
                        <Skeleton className="h-4 w-16 dark:bg-[#0f2f25]" />
                        <Skeleton className="h-4 w-10 dark:bg-[#0f2f25]" />
                      </div>
                      <Skeleton className="h-2 w-full rounded-full dark:bg-[#0f2f25]" />
                    </div>
                    <Skeleton className="h-12 w-full rounded-md dark:bg-[#0f2f25]" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : approvalNotice ? (
            <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/15 dark:border-amber-500/20 transition-colors duration-300">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <ShieldAlert className="h-6 w-6 text-amber-700 dark:text-amber-300" />
                  <CardTitle className="text-amber-800 dark:text-amber-200 transition-colors duration-300">
                    Tu empresa está pendiente de aprobación
                  </CardTitle>
                </div>
                <CardDescription className="text-amber-900/80 dark:text-amber-100/80 transition-colors duration-300">
                  {approvalNotice}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3 rounded-2xl border border-amber-200/80 bg-white/70 px-4 py-3 dark:border-amber-500/20 dark:bg-[#143E29]/40">
                  <Mail className="mt-0.5 h-4 w-4 text-amber-700 dark:text-amber-300" />
                  <p className="text-sm text-amber-900/80 dark:text-amber-100/80">
                    Te enviaremos un correo cuando la aprobación quede
                    confirmada y ya puedas reservar tu turno.
                    <span className="block mt-1 text-xs text-amber-700 dark:text-amber-300 font-semibold">
                      Cuando recibas la notificación, recuerda volver a iniciar
                      sesión para actualizar tu acceso.
                    </span>
                  </p>
                </div>

                <Link to="/representantes">
                  <Button className="bg-amber-700 hover:bg-amber-800 dark:bg-amber-500 dark:hover:bg-amber-400 text-white font-semibold shadow-sm transition-colors duration-200">
                    Revisar representantes
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : noActiveEvent ? (
            <div className="flex flex-col items-center text-center py-20 px-4">
              <div className="h-20 w-20 rounded-2xl bg-[#143E29]/8 dark:bg-[#143E29]/40 flex items-center justify-center mb-6 ring-1 ring-[#143E29]/15 dark:ring-[#68A243]/20">
                <Calendar className="h-10 w-10 text-[#143E29] dark:text-[#9FD27B]" />
              </div>
              <h3 className="text-2xl font-bold text-[#143E29] dark:text-white mb-2 transition-colors">
                No hay una ronda activa por el momento
              </h3>
              <p className="text-gray-500 dark:text-gray-300 max-w-md leading-relaxed transition-colors">
                Próximamente se realizará una nueva ronda de negocios en Trenque
                Lauquen. Cuando esté disponible, vas a poder inscribirte a los
                turnos y elegir tus mesas.
              </p>
              <div className="mt-6 flex items-center gap-2 rounded-2xl border border-[#68A243]/25 bg-[#68A243]/5 dark:bg-[#68A243]/10 dark:border-[#68A243]/20 px-5 py-3">
                <Bell className="h-4 w-4 text-[#68A243] flex-shrink-0" />
                <p className="text-sm text-[#3F6E20] dark:text-[#9FD27B] font-medium">
                  Te notificaremos por correo cuando la próxima ronda sea
                  habilitada.
                </p>
              </div>
            </div>
          ) : noParticipation ? (
            <>
              <div className="flex flex-col items-center text-center gap-8 py-8">
                {/* Header llamativo */}
                <div className="flex flex-col items-center gap-4">
                  <div className="relative">
                    <div className="h-24 w-24 rounded-2xl bg-gradient-to-br from-[#68A243] to-[#143E29] flex items-center justify-center shadow-lg shadow-[#68A243]/30">
                      <Sparkles className="h-12 w-12 text-white" />
                    </div>
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-[#143E29] dark:text-white mb-2">
                      ¡Hay una nueva ronda de negocios!
                    </h2>
                    <p className="text-gray-500 dark:text-gray-300 text-lg max-w-lg">
                      Nos encantaría que tu empresa sea parte de este evento.
                      Confirmá tu participación y empezá a reservar tus turnos.
                    </p>
                  </div>
                </div>

                {/* Info del evento */}
                {activeEvent && (
                  <div className="flex flex-wrap items-center justify-center gap-3">
                    <div className="flex items-center gap-2 rounded-xl border border-[#68A243]/30 bg-[#68A243]/8 dark:bg-[#68A243]/10 dark:border-[#68A243]/25 px-4 py-2.5">
                      <CalendarDays className="h-4 w-4 text-[#68A243]" />
                      <span className="text-sm font-semibold text-[#3F6E20] dark:text-[#9FD27B]">
                        {formatDate(activeEvent.fecha)}
                      </span>
                    </div>
                    {activeEvent.hora_inicio && (
                      <div className="flex items-center gap-2 rounded-xl border border-[#68A243]/30 bg-[#68A243]/8 dark:bg-[#68A243]/10 dark:border-[#68A243]/25 px-4 py-2.5">
                        <Clock className="h-4 w-4 text-[#68A243]" />
                        <span className="text-sm font-semibold text-[#3F6E20] dark:text-[#9FD27B]">
                          {activeEvent.hora_inicio.slice(0, 5)} hs
                        </span>
                      </div>
                    )}
                    {activeEvent.ubicacion && (
                      <div className="flex items-center gap-2 rounded-xl border border-[#68A243]/30 bg-[#68A243]/8 dark:bg-[#68A243]/10 dark:border-[#68A243]/25 px-4 py-2.5">
                        <MapPin className="h-4 w-4 text-[#68A243]" />
                        <span className="text-sm font-semibold text-[#3F6E20] dark:text-[#9FD27B]">
                          {activeEvent.ubicacion}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* CTA */}
                <Button
                  size="lg"
                  onClick={() => setIsConfirmOpen(true)}
                  className="h-13 px-8 text-base font-semibold bg-[#68A243] hover:bg-[#5a9038] text-white shadow-lg shadow-[#68A243]/25 hover:shadow-[#68A243]/40 transition-all duration-200"
                >
                  <Sparkles className="h-5 w-5 mr-2" />
                  Quiero participar
                </Button>

                {/* Beneficios */}
                <Card className="w-full max-w-lg text-left dark:bg-[#143E29] dark:border-[#68A243]/20 transition-colors duration-300">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg text-[#143E29] dark:text-white">
                      ¿Qué implica participar?
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {[
                      {
                        text: "Confirmás tu asistencia al evento presencial",
                      },
                      {
                        text: "Tu empresa aparece en la lista de participantes del evento",
                      },
                      {
                        text: "Podés anotarte en los turnos y elegir tus mesas de reunión",
                      },
                    ].map((benefit, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-[#68A243] mt-0.5 flex-shrink-0" />
                        <p className="text-gray-700 dark:text-gray-200 text-sm leading-relaxed">
                          {benefit.text}
                        </p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* Dialog de confirmación */}
              <ConfirmarParticipacionDialog
                isOpen={isConfirmOpen}
                onOpenChange={setIsConfirmOpen}
                isConfirming={isConfirming}
                onConfirm={handleConfirmarParticipacion}
              />
            </>
          ) : error ? (
            <Card className="border-destructive/50 bg-destructive/5 dark:bg-destructive/10 dark:border-destructive/30 dark:text-white transition-colors duration-300">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-6 w-6 text-destructive" />
                  <CardTitle className="text-destructive dark:text-red-400 transition-colors duration-300">
                    Error al cargar los turnos
                  </CardTitle>
                </div>
                <CardDescription className="dark:text-gray-300 transition-colors duration-300">
                  {error}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  variant="outline"
                  onClick={() => window.location.reload()}
                  className="border-destructive/50 text-destructive hover:bg-destructive/10 dark:border-destructive/30 dark:hover:bg-destructive/20"
                >
                  Reintentar
                </Button>
              </CardContent>
            </Card>
          ) : filteredShifts.length === 0 ? (
            <div className="flex flex-col items-center text-center py-20 px-4">
              <div className="h-20 w-20 rounded-2xl bg-[#68A243]/10 dark:bg-[#68A243]/15 flex items-center justify-center mb-6">
                <Calendar className="h-10 w-10 text-[#68A243]" />
              </div>
              <h3 className="text-2xl font-bold text-[#143E29] dark:text-white mb-2 transition-colors">
                ¡Los turnos están por llegar!
              </h3>
              <p className="text-gray-500 dark:text-gray-300 max-w-md leading-relaxed transition-colors">
                Estamos preparando todo para que puedas inscribirte.
                Habilitaremos los turnos próximamente y nos entusiasma mucho que
                seas parte de esta ronda de negocios.
              </p>
              <p className="mt-3 text-sm text-[#68A243] dark:text-[#9FD27B] font-medium">
                Volvé pronto
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
              {filteredShifts.map((shift, index) => (
                <Card
                  key={shift.id}
                  className={`hover:shadow-lg transition-all duration-300 border-2 dark:bg-[#143E29] dark:border-[#68A243]/20 dark:hover:shadow-lg dark:hover:shadow-[#68A243]/20 ${
                    shift.estado === "cerrado"
                      ? "opacity-50 hover:shadow-none hover:border-[#68A243]/20 dark:hover:shadow-none dark:hover:border-[#68A243]/20"
                      : "hover:border-[#68A243]/30 dark:hover:border-[#68A243]/40"
                  }`}
                  style={{
                    animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both`,
                  }}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-2xl text-[#143E29] dark:text-white mb-1 transition-colors duration-300">
                          Turno {turnoNumberMap.get(shift.id)}
                        </CardTitle>
                        <CardDescription className="text-base dark:text-gray-200 transition-colors duration-300">
                          Ronda de negocios - Reuniones 1 a 1
                        </CardDescription>
                      </div>
                      {getStatusBadge(shift.estado)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300 transition-colors duration-300">
                        <div className="bg-[#68A243]/10 dark:bg-[#68A243]/20 p-2 rounded-lg transition-colors duration-300">
                          <Clock className="h-5 w-5 text-[#68A243]" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-300 transition-colors duration-300">
                            Horario
                          </p>
                          <p className="font-semibold text-lg dark:text-white transition-colors duration-300">
                            {shift.hora_inicio} - {shift.hora_fin}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300 transition-colors duration-300">
                        <div className="bg-[#68A243]/10 dark:bg-[#68A243]/20 p-2 rounded-lg transition-colors duration-300">
                          <Users className="h-5 w-5 text-[#68A243]" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-300 transition-colors duration-300">
                            Mesas Disponibles
                          </p>
                          <p className="font-semibold text-lg">
                            {shift.cant_mesas - shift.mesas_ocupadas} de{" "}
                            {shift.cant_mesas}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-600 dark:text-gray-300 transition-colors duration-300">
                          Ocupación
                        </span>
                        <span className="font-semibold text-[#143E29] dark:text-white transition-colors duration-300">
                          {Math.round(
                            ((shift.cant_mesas -
                              (shift.cant_mesas - shift.mesas_ocupadas)) /
                              shift.cant_mesas) *
                              100,
                          )}
                          %
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-[#0f2f25] rounded-full h-2 transition-colors duration-300">
                        <div
                          className="bg-[#68A243] dark:bg-[#68A243] h-2 rounded-full transition-all duration-500"
                          style={{
                            width: `${
                              ((shift.cant_mesas -
                                (shift.cant_mesas - shift.mesas_ocupadas)) /
                                shift.cant_mesas) *
                              100
                            }%`,
                          }}
                        />
                      </div>
                    </div>

                    <Button
                      onClick={() => navigate(`/mesas/${shift.id}`)}
                      disabled={
                        shift.estado === "full" || shift.estado === "cerrado"
                      }
                      className="w-full bg-[#68A243] hover:bg-[#68A243]/90 text-white font-semibold py-6 text-base disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {shift.estado === "full" ? (
                        "Turno Completo"
                      ) : shift.estado === "cerrado" ? (
                        "Turno Cerrado"
                      ) : (
                        <>
                          Ver Mesas Disponibles
                          <ArrowRight className="ml-2 h-5 w-5" />
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
      <HelpTutorial title="Guía de Turnos" steps={tutorialSteps} />
      <Footer />
    </>
  );
}
