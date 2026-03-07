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
import { Calendar, Clock, Users, ArrowRight, AlertCircle } from "lucide-react";
import { useCurrentUser } from "../hooks/useCurrentUser";
import { HelpTutorial } from "../components/HelpTutorial";
import { Link, useNavigate } from "react-router";
import { getTurnoByEventoId } from "../api/TurnoService";
import type { TurnoResponse } from "../types/Turno";

export default function Shifts() {
  const navigate = useNavigate();
  const [shifts, setShifts] = useState<TurnoResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useCurrentUser();

  useEffect(() => {
    const fetchTurno = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getTurnoByEventoId(1);
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "available":
        return (
          <Badge className="bg-[#68A243] hover:bg-[#68A243]/90">
            Disponible
          </Badge>
        );
      case "full":
        return <Badge variant="destructive">Completo</Badge>;
      case "finished":
        return <Badge variant="secondary">Finalizado</Badge>;
      default:
        return null;
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + "T00:00:00");
    return date.toLocaleDateString("es-AR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
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
        <div className="min-h-screen bg-gray-50 pt-20">
          <div className="max-w-4xl mx-auto px-4 py-16">
            <Card className="text-center">
              <CardHeader>
                <CardTitle className="text-2xl text-[#143E29]">
                  Acceso Restringido
                </CardTitle>
                <CardDescription>
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
      <div className="min-h-screen bg-gray-50 pt-8 pb-4">
        <div className="bg-gradient-to-br from-[#143E29] to-[#143E29]/90 text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold mb-2">Turnos Disponibles</h1>
                <p className="text-gray-200 text-lg">
                  Seleccioná un turno y elegí tu mesa para la ronda de negocios
                </p>
              </div>
              <div className="hidden md:block">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                  <div className="flex items-center gap-2 text-sm mb-2">
                    <Calendar className="h-4 w-4 text-[#68A243]" />
                    <span className="font-semibold">Fecha del Evento</span>
                  </div>
                  <p className="text-xl font-bold">
                    {/* {formatDate(selectedDate)} */}
                    colocar fecha
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
                <Card key={i} className="border-2">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <Skeleton className="h-7 w-28" />
                        <Skeleton className="h-4 w-48" />
                      </div>
                      <Skeleton className="h-6 w-20 rounded-full" />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-9 w-9 rounded-lg" />
                        <div className="space-y-1">
                          <Skeleton className="h-3 w-16" />
                          <Skeleton className="h-5 w-32" />
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-9 w-9 rounded-lg" />
                        <div className="space-y-1">
                          <Skeleton className="h-3 w-16" />
                          <Skeleton className="h-5 w-24" />
                        </div>
                      </div>
                    </div>
                    <div className="pt-2 space-y-2">
                      <div className="flex justify-between">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-4 w-10" />
                      </div>
                      <Skeleton className="h-2 w-full rounded-full" />
                    </div>
                    <Skeleton className="h-12 w-full rounded-md" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : error ? (
            <Card className="border-destructive/50 bg-destructive/5">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-6 w-6 text-destructive" />
                  <CardTitle className="text-destructive">
                    Error al cargar los turnos
                  </CardTitle>
                </div>
                <CardDescription>{error}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  variant="outline"
                  onClick={() => window.location.reload()}
                  className="border-destructive/50 text-destructive hover:bg-destructive/10"
                >
                  Reintentar
                </Button>
              </CardContent>
            </Card>
          ) : filteredShifts.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>No hay turnos disponibles</CardTitle>
                <CardDescription>
                  No se encontraron turnos para este evento
                </CardDescription>
              </CardHeader>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
              {filteredShifts.map((shift, index) => (
                <Card
                  key={shift.id}
                  className="hover:shadow-lg transition-all duration-300 border-2 hover:border-[#68A243]/30"
                  style={{
                    animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both`,
                  }}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-2xl text-[#143E29] mb-1">
                          Turno {shift.id}
                        </CardTitle>
                        <CardDescription className="text-base">
                          Ronda de negocios - Reuniones 1 a 1
                        </CardDescription>
                      </div>
                      {getStatusBadge(shift.estado)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-gray-700">
                        <div className="bg-[#68A243]/10 p-2 rounded-lg">
                          <Clock className="h-5 w-5 text-[#68A243]" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Horario</p>
                          <p className="font-semibold text-lg">
                            {shift.hora_inicio} - {shift.hora_fin}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 text-gray-700">
                        <div className="bg-[#68A243]/10 p-2 rounded-lg">
                          <Users className="h-5 w-5 text-[#68A243]" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">
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
                        <span className="text-gray-600">Ocupación</span>
                        <span className="font-semibold text-[#143E29]">
                          {Math.round(
                            ((shift.cant_mesas -
                              (shift.cant_mesas - shift.mesas_ocupadas)) /
                              shift.cant_mesas) *
                              100,
                          )}
                          %
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-[#68A243] h-2 rounded-full transition-all duration-500"
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
