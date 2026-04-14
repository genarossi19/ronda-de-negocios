"use client";

import {
  LayoutDashboard,
  Calendar,
  Clock3,
  Users,
  CheckCircle,
  TrendingUp,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import Navbar from "../../components/Navbar";
import { motion as m } from "motion/react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { getEventos } from "../../api/EventoService";
import { toast } from "sonner";
import { isSessionExpiredError } from "../../lib/axios";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeEventId, setActiveEventId] = useState<number | null>(null);

  useEffect(() => {
    const fetchActiveEvent = async () => {
      try {
        const eventos = await getEventos();
        const eventoActivo = eventos.find(
          (evento) => evento.estado === "activo",
        );
        setActiveEventId(eventoActivo?.id ?? null);
      } catch (error) {
        console.error("Error loading active event:", error);
        if (!isSessionExpiredError(error)) {
          setActiveEventId(null);
        }
      }
    };

    fetchActiveEvent();
  }, []);

  const stats = [
    {
      title: "Rondas de Negocios",
      value: "4",
      description: "3 activas, 1 finalizada",
      icon: Calendar,
      color: "text-[#68A243]",
      bg: "bg-[#68A243]/10",
    },
    {
      title: "Empresas Registradas",
      value: "24",
      description: "18 aprobadas, 6 pendientes",
      icon: Users,
      color: "text-[#F5891F]",
      bg: "bg-[#F5891F]/10",
    },
    {
      title: "Reuniones Totales",
      value: "156",
      description: "142 completadas",
      icon: CheckCircle,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      title: "Tasa de Asistencia",
      value: "91%",
      description: "Excelente participación",
      icon: TrendingUp,
      color: "text-[#143E29]",
      bg: "bg-[#143E29]/10",
    },
  ];

  const quickActions = [
    {
      title: "Gestionar Rondas",
      description: "Crear, editar y cerrar rondas de negocios",
      icon: Calendar,
      href: "/gestionar-rondas",
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
      href: "#admin-meetings",
    },
    {
      title: "Gestionar Turnos",
      description: activeEventId
        ? "Crear y actualizar turnos de la ronda activa"
        : "Necesitás una ronda activa para administrar turnos",
      icon: Clock3,
      href: activeEventId
        ? `/panel-administrador/turnos/${activeEventId}`
        : "/gestionar-rondas",
      requiresActiveEvent: true,
    },
  ];

  const handleQuickActionClick = (action: (typeof quickActions)[number]) => {
    if (action.requiresActiveEvent && !activeEventId) {
      toast.info("Primero activá una ronda para poder gestionar sus turnos");
    }

    navigate(action.href);
  };

  const containerVariants = {
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
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a1a15] transition-colors duration-300">
      <Navbar />

      <div className="pt-24 pb-12 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <m.div
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            className="mb-8 flex items-start justify-between"
          >
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-[#68A243] dark:bg-[#68A243] p-2 rounded-lg shadow-lg shadow-[#68A243]/20">
                  <LayoutDashboard className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-[#143E29] dark:text-white transition-colors duration-300">
                  Panel de Administración
                </h1>
              </div>
              <p className="text-muted-foreground dark:text-gray-300 text-lg">
                Gestión completa de la Ronda de Negocios
              </p>
            </div>
          </m.div>

          {/* Stats Grid */}
          <m.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          >
            {stats.map((stat, index) => (
              <m.div
                key={index}
                variants={itemVariants}
                initial="hidden"
                animate="visible"
              >
                <Card className="border-[#68A243]/20 dark:border-[#68A243]/30 dark:bg-[#143E29] transition-all duration-300">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground dark:text-gray-300">
                      {stat.title}
                    </CardTitle>
                    <div
                      className={`${stat.bg} dark:bg-[#68A243]/20 p-2 rounded-lg transition-colors duration-300`}
                    >
                      <stat.icon className={`h-5 w-5 ${stat.color}`} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-[#143E29] dark:text-white mb-1 transition-colors duration-300">
                      {stat.value}
                    </div>
                    <p className="text-sm text-muted-foreground dark:text-gray-300 transition-colors duration-300">
                      {stat.description}
                    </p>
                  </CardContent>
                </Card>
              </m.div>
            ))}
          </m.div>

          {/* Quick Actions */}
          <m.div variants={itemVariants} initial="hidden" animate="visible">
            <h2 className="text-2xl font-bold text-[#143E29] dark:text-white mb-4 transition-colors duration-300">
              Acciones Rápidas
            </h2>
            <m.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6"
            >
              {quickActions.map((action, index) => (
                <m.div
                  key={index}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <Card
                    className="border-[#68A243]/20 hover:border-[#68A243] transition-all hover:shadow-lg cursor-pointer group dark:border-[#68A243]/30 dark:bg-[#143E29] dark:hover:border-[#68A243]/50 dark:hover:shadow-xl dark:hover:shadow-[#68A243]/10"
                    onClick={() => handleQuickActionClick(action)}
                  >
                    <CardHeader>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="bg-[#68A243]/10 dark:bg-[#68A243]/20 p-2 rounded-lg group-hover:bg-[#68A243] dark:group-hover:bg-[#68A243]/40 transition-colors">
                          <action.icon className="h-6 w-6 text-[#68A243] group-hover:text-white dark:group-hover:text-white transition-colors" />
                        </div>
                        <CardTitle className="text-lg text-[#143E29] dark:text-white transition-colors duration-300">
                          {action.title}
                        </CardTitle>
                      </div>
                      <CardDescription className="dark:text-gray-300 transition-colors duration-300">
                        {action.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button
                        variant="outline"
                        className="w-full border-[#68A243] text-[#68A243] hover:bg-[#68A243] hover:text-white bg-transparent dark:border-[#68A243]/60 dark:text-[#68A243] dark:hover:bg-[#68A243] dark:hover:text-white dark:hover:border-[#68A243] dark:bg-transparent transition-all duration-300"
                      >
                        Acceder
                      </Button>
                    </CardContent>
                  </Card>
                </m.div>
              ))}
            </m.div>
          </m.div>
        </div>
      </div>
    </div>
  );
}
