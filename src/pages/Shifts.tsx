import { useEffect, useState } from "react";
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
import {
  Calendar,
  Clock,
  Users,
  ArrowRight,
  AlertCircle,
  Settings,
} from "lucide-react";
import { useCurrentUser } from "../hooks/useCurrentUser";
import { HelpTutorial } from "../components/HelpTutorial";
import { Link, useNavigate } from "react-router";
import { getTurnoByEventoId } from "../api/TurnoService";
import { getEventos } from "../api/EventoService";
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
  const { isAuthenticated, isAdmin } = useCurrentUser();

  useEffect(() => {
    const fetchTurno = async () => {
      try {
        setLoading(true);
        setError(null);
        const eventos = await getEventos();
        const eventoActivo = getActiveEvent(eventos);

        if (!eventoActivo) {
          setActiveEvent(null);
          setShifts([]);
          setError("No hay una ronda activa disponible en este momento.");
          return;
        }

        setActiveEvent(eventoActivo);

        const data = await getTurnoByEventoId(eventoActivo.id);
        setShifts(data);
      } catch (err) {
        console.error(err);
        setError(
          "No se pudieron cargar los turnos. Intentá de nuevo más tarde.",
        );
      } finally {
        setLoading(false);
      }
    };
    fetchTurno();
  }, []);

  const filteredShifts = shifts;

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
        return <Badge variant="secondary">Cerrado</Badge>;
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
              <div className="hidden md:flex md:flex-col md:items-end md:gap-3">
                {isAdmin && (
                  <Button
                    onClick={() =>
                      navigate(
                        activeEvent
                          ? `/panel-administrador/turnos/${activeEvent.id}`
                          : "/gestionar-rondas",
                      )
                    }
                    className="gap-2 bg-[#68A243] hover:bg-[#5a9038] text-white"
                  >
                    <Settings className="h-4 w-4" />
                    Gestionar turnos
                  </Button>
                )}
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
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
            <Card className="dark:bg-[#143E29] dark:border-[#68A243]/20 transition-colors duration-300">
              <CardHeader>
                <CardTitle className="dark:text-white transition-colors duration-300">
                  No hay turnos disponibles
                </CardTitle>
                <CardDescription className="dark:text-gray-300 transition-colors duration-300">
                  No se encontraron turnos para este evento
                </CardDescription>
              </CardHeader>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
              {filteredShifts.map((shift, index) => (
                <Card
                  key={shift.id}
                  className="hover:shadow-lg transition-all duration-300 border-2 hover:border-[#68A243]/30 dark:bg-[#143E29] dark:border-[#68A243]/20 dark:hover:shadow-lg dark:hover:shadow-[#68A243]/20 dark:hover:border-[#68A243]/40"
                  style={{
                    animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both`,
                  }}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-2xl text-[#143E29] dark:text-white mb-1 transition-colors duration-300">
                          Turno {shift.id}
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
                      disabled={shift.estado === "full"}
                      className="w-full bg-[#68A243] hover:bg-[#68A243]/90 text-white font-semibold py-6 text-base disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {shift.estado === "full" ? (
                        "Turno Completo"
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
