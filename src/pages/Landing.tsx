import { useEffect, useMemo, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../layout/Footer";
import Carousel from "../components/Carousel";
import { Button } from "../components/ui/button";
import { Skeleton } from "../components/ui/skeleton";
import {
  ArrowRight,
  Building2,
  Users,
  Handshake,
  TrendingUp,
  Calendar,
  MapPin,
  Clock,
} from "lucide-react";
import { getEventos } from "../api/EventoService";
import { confirmarParticipacion } from "../api/EmpresaService";
import type { EventoResponse } from "../types/Evento";

import { TextAnimate } from "../components/ui/text-animate";
import { Link, useNavigate } from "react-router";
import { useAuth } from "../hooks/useAuth";
import { useCurrentUser } from "../hooks/useCurrentUser";
import { toast } from "sonner";
import ConfirmarParticipacionDialog from "../components/ConfirmarParticipacionDialog";

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

function formatEventHeadlineDate(date: string) {
  return new Intl.DateTimeFormat("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date(`${date}T00:00:00`));
}

function formatEventYear(date: string) {
  return new Intl.DateTimeFormat("es-AR", {
    year: "numeric",
  }).format(new Date(`${date}T00:00:00`));
}

function formatEventTime(time: string) {
  if (!time) return "Hora a confirmar";
  const [hours, minutes] = time.split(":").slice(0, 2);
  const hoursNum = parseInt(hours, 10);
  const minutesStr = minutes || "00";
  return `${hoursNum}:${minutesStr} hs`;
}

function EventInfoSkeleton({ icon: Icon }: { icon: typeof Calendar }) {
  return (
    <div className="inline-flex items-center gap-3 px-4 py-3 rounded-lg border border-white/10 bg-white/5 backdrop-blur-sm">
      <Icon className="h-6 w-6 text-secondary dark:text-[#68A243]" />
      <div className="text-left text-white min-w-[220px] space-y-2">
        <Skeleton className="h-4 w-16 bg-white/15" />
        <Skeleton className="h-5 w-44 bg-white/15" />
        <Skeleton className="h-4 w-24 bg-white/10" />
      </div>
    </div>
  );
}

export default function Landing() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { isPendingApproval } = useCurrentUser();
  const [companyCount, setCompanyCount] = useState(0);
  const [isLoadingCompanies, setIsLoadingCompanies] = useState(true);

  const handleCompaniesLoaded = (count: number) => {
    setCompanyCount(count);
    setIsLoadingCompanies(false);
  };
  const [eventos, setEventos] = useState<EventoResponse[]>([]);
  const [isLoadingEventInfo, setIsLoadingEventInfo] = useState(true);

  useEffect(() => {
    const fetchEventos = async () => {
      try {
        setIsLoadingEventInfo(true);
        const data = await getEventos();
        setEventos(data);
      } catch (error) {
        console.error("Error loading active event info:", error);
        setEventos([]);
      } finally {
        setIsLoadingEventInfo(false);
      }
    };

    fetchEventos();
  }, []);

  const activeEvent = useMemo(() => getClosestActiveEvent(eventos), [eventos]);

  const headlineDate = activeEvent
    ? formatEventHeadlineDate(activeEvent.fecha)
    : "Fecha a confirmar";

  const headlineYear = activeEvent
    ? formatEventYear(activeEvent.fecha)
    : "Próximamente";

  const headlineLocation = activeEvent?.ubicacion ?? "Ubicación a confirmar";

  const headlineDireccion = activeEvent?.direccion ?? null;

  const headlineHora = activeEvent
    ? formatEventTime(activeEvent.hora_inicio)
    : "Hora a confirmar";

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

  const handleConfirmarParticipacion = async () => {
    try {
      setIsConfirming(true);
      await confirmarParticipacion();
      setIsConfirmOpen(false);
      toast.success("¡Participación confirmada! Ya podés ver los turnos.");
    } catch {
      toast.error("Error al confirmar participación. Intentá de nuevo.");
    } finally {
      setIsConfirming(false);
    }
  };

  const handleViewCompanies = () => {
    navigate("/empresas");
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a1a15] transition-colors duration-300">
      <Navbar />

      {/* Hero Section */}
      <section
        data-navbar-theme="light"
        className="relative flex flex-col justify-center items-center min-h-screen bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/portada.jpg')",
        }}
      >
        {/* Overlay para oscurecer fondo y mejorar legibilidad */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/80  to-black/70" />

        {/* Contenido: agregamos padding-top = altura navbar */}
        <div className="relative z-10 w-full pt-[80px] pb-20 px-4 sm:px-6 lg:px-8">
          {/* Aviso superior */}
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/20 dark:bg-[#ffb900]/20 text-accent dark:text-[#ffb900] border border-accent/30 dark:border-[#ffb900]/30 text-sm font-medium mb-8 transition-colors duration-300">
              <span className="w-2 h-2 rounded-full bg-accent dark:bg-[#ffb900] animate-pulse"></span>
              Inscripciones abiertas
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-6 mb-6">
            {isLoadingEventInfo ? (
              <EventInfoSkeleton icon={Calendar} />
            ) : (
              <div className="inline-flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/5 dark:hover:bg-white/5 hover:backdrop-blur-sm transition-all duration-150 ease-in-out">
                <Calendar className="h-6 w-6 text-secondary dark:text-[#68A243]" />
                <div className="text-left text-white">
                  <div className="text-sm text-gray-300 dark:text-gray-400 transition-colors duration-300">
                    Fecha
                  </div>
                  <div className="font-semibold flex flex-col capitalize">
                    {headlineDate}
                    <span className="text-gray-300 dark:text-gray-400 transition-colors duration-300">
                      {headlineYear}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {isLoadingEventInfo ? (
              <EventInfoSkeleton icon={MapPin} />
            ) : (
              <div className="inline-flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/5 dark:hover:bg-white/5 hover:backdrop-blur-sm transition-all duration-150 ease-in-out">
                <MapPin className="h-6 w-6 text-secondary dark:text-[#68A243]" />
                <div className="text-left text-white">
                  <div className="text-sm text-gray-300 dark:text-gray-400 transition-colors duration-300">
                    Lugar
                  </div>
                  <div className="font-semibold flex flex-col">
                    {headlineLocation}
                    {headlineDireccion ? (
                      <span className="text-gray-300 dark:text-gray-400 transition-colors duration-300">
                        {headlineDireccion}
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>
            )}

            {isLoadingEventInfo ? (
              <EventInfoSkeleton icon={Clock} />
            ) : (
              <div className="inline-flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/5 dark:hover:bg-white/5 hover:backdrop-blur-sm transition-all duration-150 ease-in-out">
                <Clock className="h-6 w-6 text-secondary dark:text-[#68A243]" />
                <div className="text-left text-white">
                  <div className="text-sm text-gray-300 dark:text-gray-400 transition-colors duration-300">
                    Hora
                  </div>
                  <div className="font-semibold flex flex-col">
                    {headlineHora}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="max-w-7xl mx-auto text-center">
            <TextAnimate
              animation="blurInUp"
              by="character"
              once
              as="h1"
              className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-[0.2em] uppercase mb-1"
            >
              Ronda de Negocios
            </TextAnimate>

            <TextAnimate
              animation="blurInUp"
              by="text"
              once
              as="h2"
              className="text-6xl sm:text-7xl lg:text-8xl font-extrabold mb-3 text-balance block"
              segmentClassName="bg-gradient-to-b from-white from-40% to-[#a0a0a0] bg-clip-text text-transparent"
            >
              Trenque Lauquen
            </TextAnimate>

            <p className="text-base sm:text-lg font-medium text-white/60 tracking-widest uppercase mb-10">
              2da edición
            </p>

            <p className="text-xl text-white/90 max-w-3xl mx-auto mb-12 leading-relaxed">
              Conectá con empresas líderes, expandí tu red de contactos y
              descubrí nuevas oportunidades de negocio en el evento empresarial
              más importante de la región.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              {!isAuthenticated ? (
                <Link to="/register" rel="noopener noreferrer">
                  <Button
                    size="lg"
                    className="bg-secondary hover:bg-secondary/90 text-white text-lg px-8 py-6 group"
                  >
                    Inscribir mi empresa
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              ) : (
                <Button
                  size="lg"
                  className="bg-secondary hover:bg-secondary/90 text-white text-lg px-8 py-6 group"
                  onClick={() => navigate("/turnos")}
                >
                  Anotarse a un turno
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              )}

              <Button
                size="lg"
                variant="outline"
                onClick={handleViewCompanies}
                className="text-lg px-8 py-6 bg-transparent text-white border-white/30 hover:bg-accent hover:border-accent hover:text-white transition-colors duration-200 ease-in-out"
              >
                Ver empresas inscriptas
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Companies Carousel */}
      <section
        data-navbar-theme="dark"
        className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-[#0a1a15] transition-colors duration-300"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-[#143E29] dark:text-white transition-colors duration-300">
              Empresas Participantes
            </h2>
            <p className="text-lg text-muted-foreground dark:text-gray-300 transition-colors duration-300">
              {isLoadingCompanies
                ? "Cargando empresas..."
                : companyCount > 0
                  ? `${companyCount} empresa${companyCount !== 1 ? "s" : ""} ya confirm${companyCount !== 1 ? "aron" : "ó"} su participación`
                  : null}
            </p>
          </div>
          <Carousel
            onCompaniesLoaded={handleCompaniesLoaded}
            isAuthenticated={isAuthenticated}
            isPendingApproval={isPendingApproval}
            onParticipate={() => setIsConfirmOpen(true)}
          />
        </div>
      </section>

      {/* Features Section */}
      <section
        data-navbar-theme="dark"
        className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-[#0a1a15] transition-colors duration-300"
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-secondary/10 dark:bg-[#68A243]/20 text-secondary dark:text-[#68A243] mb-4 transition-colors duration-300">
                <Building2 className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-primary dark:text-white transition-colors duration-300">
                Empresas Líderes
              </h3>
              <p className="text-muted-foreground dark:text-gray-300 leading-relaxed transition-colors duration-300">
                Conectá con las empresas más importantes de la región
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-secondary/10 dark:bg-[#68A243]/20 text-secondary dark:text-[#68A243] mb-4 transition-colors duration-300">
                <Users className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-primary dark:text-white transition-colors duration-300">
                Networking
              </h3>
              <p className="text-muted-foreground dark:text-gray-300 leading-relaxed transition-colors duration-300">
                Expandí tu red de contactos profesionales
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-secondary/10 dark:bg-[#68A243]/20 text-secondary dark:text-[#68A243] mb-4 transition-colors duration-300">
                <Handshake className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-primary dark:text-white transition-colors duration-300">
                Oportunidades
              </h3>
              <p className="text-muted-foreground dark:text-gray-300 leading-relaxed transition-colors duration-300">
                Descubrí nuevas alianzas estratégicas
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-secondary/10 dark:bg-[#68A243]/20 text-secondary dark:text-[#68A243] mb-4 transition-colors duration-300">
                <TrendingUp className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-primary dark:text-white transition-colors duration-300">
                Crecimiento
              </h3>
              <p className="text-muted-foreground dark:text-gray-300 leading-relaxed transition-colors duration-300">
                Impulsá el desarrollo de tu negocio
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section
        data-navbar-theme="light"
        className="py-20 px-4 sm:px-6 lg:px-8 bg-[#143E29] dark:bg-[#0f2f25] text-white transition-colors duration-300"
      >
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-balance text-white dark:text-white transition-colors duration-300">
            ¿Listo para hacer crecer tu negocio?
          </h2>
          <p className="text-xl mb-8 dark:text-gray-300 text-pretty leading-relaxed transition-colors duration-300">
            No te pierdas la oportunidad de conectar con las empresas más
            importantes de la región. Inscribite ahora y asegurá tu lugar.
          </p>
          {!isAuthenticated ? (
            <Button
              size="lg"
              className="bg-secondary hover:bg-accent text-white text-lg px-8 py-6 group"
            >
              <Link to="/register">Inscribir mi empresa ahora</Link>

              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          ) : (
            <Button
              size="lg"
              className="bg-secondary hover:bg-accent text-white text-lg px-8 py-6 group"
              onClick={() => navigate("/turnos")}
            >
              Anotarse a un turno
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          )}
        </div>
      </section>

      <Footer />

      {/* Dialog confirmación de participación */}
      <ConfirmarParticipacionDialog
        isOpen={isConfirmOpen}
        onOpenChange={setIsConfirmOpen}
        isConfirming={isConfirming}
        onConfirm={handleConfirmarParticipacion}
      />
    </div>
  );
}
