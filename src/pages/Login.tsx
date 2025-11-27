import type React from "react";

import { useState } from "react";
import { ArrowLeft, Mail, Lock, LogIn, Building2 } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router";

export default function Login() {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Simulate login
    if (formData.email && formData.password) {
      login({
        id: "1",
        email: formData.email,
        companyName: "TechSolutions SA",
        representatives: [
          {
            id: "rep1",
            name: "María González",
            email: "maria@techsolutions.com",
            phone: "+54 11 1234-5678",
            position: "Gerente Comercial",
          },
          {
            id: "rep2",
            name: "Juan Pérez",
            email: "juan@techsolutions.com",
            phone: "+54 11 8765-4321",
            position: "Director de Ventas",
          },
        ],
      });
      // </CHANGE>
      navigate("/companies");
    } else {
      setError("Por favor completá todos los campos");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[#68A243]/5">
      <Navbar />

      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 pt-20">
        <div className="w-full max-w-md">
          <Link to="/">
            <Button
              variant="ghost"
              className="mb-6 hover:bg-gray-100 hover:text-[#68A243] text-foreground"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al inicio
            </Button>
          </Link>

          <Card className="border-[#68A243]/20 shadow-lg">
            <CardHeader className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="bg-[#68A243]/10 p-3 rounded-xl">
                  <Building2 className="h-8 w-8 text-[#68A243]" />
                </div>
              </div>
              <div>
                <CardTitle className="text-2xl font-bold text-[#143E29]">
                  Iniciar sesión
                </CardTitle>
                <CardDescription className="text-base mt-2">
                  Accedé a tu cuenta de empresa para gestionar tu participación
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      placeholder="tu@empresa.com"
                      className="pl-10 h-11 border-[#68A243]/20 focus:border-[#68A243]"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">
                    Contraseña
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      placeholder="••••••••"
                      className="pl-10 h-11 border-[#68A243]/20 focus:border-[#68A243]"
                      required
                    />
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full h-11 bg-[#68A243] hover:bg-[#143E29] text-white font-semibold"
                >
                  <LogIn className="mr-2 h-5 w-5" />
                  Iniciar sesión
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground">
                  ¿No tenés una cuenta?{" "}
                  <button
                    onClick={() => (window.location.href = "#register")}
                    className="text-[#68A243] font-semibold hover:text-[#143E29] transition-colors"
                  >
                    Inscribite aquí
                  </button>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
