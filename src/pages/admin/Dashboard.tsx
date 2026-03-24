"use client";

import {
  LayoutDashboard,
  Calendar,
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
import { useAuth } from "../../context/AuthContext";
import { useEffect } from "react";
import { useNavigate } from "react-router";

export default function AdminDashboard() {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  // useEffect(() => {
  //   if (!isAdmin) {
  //     window.location.href = "#landing";
  //   }
  // }, [isAdmin]);

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
      href: "#admin-rounds",
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
  ];

  // if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[#68A243]/5">
      <Navbar />

      <div className="pt-24 pb-12 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-[#68A243] p-2 rounded-lg">
                <LayoutDashboard className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-[#143E29]">
                Panel de Administración
              </h1>
            </div>
            <p className="text-muted-foreground text-lg">
              Gestión completa de la Ronda de Negocios
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <Card key={index} className="border-[#68A243]/20">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <div className={`${stat.bg} p-2 rounded-lg`}>
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-[#143E29] mb-1">
                    {stat.value}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {stat.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Quick Actions */}
          <div>
            <h2 className="text-2xl font-bold text-[#143E29] mb-4">
              Acciones Rápidas
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {quickActions.map((action, index) => (
                <Card
                  key={index}
                  className="border-[#68A243]/20 hover:border-[#68A243] transition-all hover:shadow-lg cursor-pointer group"
                  onClick={() => navigate(action.href)}
                >
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="bg-[#68A243]/10 p-2 rounded-lg group-hover:bg-[#68A243] transition-colors">
                        <action.icon className="h-6 w-6 text-[#68A243] group-hover:text-white transition-colors" />
                      </div>
                      <CardTitle className="text-lg">{action.title}</CardTitle>
                    </div>
                    <CardDescription>{action.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button
                      variant="outline"
                      className="w-full border-[#68A243] text-[#68A243] hover:bg-[#68A243] hover:text-white bg-transparent"
                    >
                      Acceder
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
