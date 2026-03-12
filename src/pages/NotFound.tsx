import { useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { ArrowLeft, Lightbulb } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../layout/Footer";
import { useState, useEffect } from "react";

const frasesDivertidas = [
  "Parece que la página que buscas se fue a una reunión de negocios y no regresó. No te preocupes, volveremos a encontrarte en el camino correcto.",
  "Esta página decidió cambiar de sector y se perdió en el camino. Vuelve atrás y encuentra la ruta correcta.",
  "La página que buscas está en una mesa de negociaciones. Mientras espera, podés volver al inicio.",
  "Error 404: La página se fue a una ronda de negocios y olvidó dejar las indicaciones. ¡Volvamos al inicio!",
  "Parece que esta página también quería ser empresaria y se fue a buscar oportunidades. Regresa con nosotros al camino seguro.",
  "La URL está en una junta directiva improvisada. Haz clic para volver.",
];

export default function NotFound() {
  const navigate = useNavigate();
  const [frase, setFrase] = useState("");

  useEffect(() => {
    const fraseAleatoria =
      frasesDivertidas[Math.floor(Math.random() * frasesDivertidas.length)];
    setFrase(fraseAleatoria);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-background">
      <Navbar />

      <main className="flex-1 w-full flex items-center justify-center px-4 py-20">
        <div className="text-center max-w-2xl w-full">
          {/* Animated 404 */}
          <div className="mb-8">
            <div className="inline-block">
              <h1 className="text-9xl md:text-[150px] font-extrabold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent animate-pulse">
                404
              </h1>
            </div>
          </div>

          {/* Main message */}
          <h2 className="text-4xl md:text-5xl font-bold text-primary mb-4">
            ¡Oops! Página no encontrada
          </h2>

          {/* Description */}
          <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
            {frase}
          </p>

          {/* Illustration with icons */}
          <div className="flex justify-center gap-8 mb-12">
            <div className="flex flex-col items-center">
              <div
                className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mb-2 animate-bounce"
                style={{ animationDelay: "0s" }}
              >
                <Lightbulb className="w-8 h-8 text-secondary" />
              </div>
              <p className="text-sm text-muted-foreground">Idea errante</p>
            </div>
            <div className="flex flex-col items-center">
              <div
                className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mb-2 animate-bounce"
                style={{ animationDelay: "0.2s" }}
              >
                <svg
                  className="w-8 h-8 text-accent"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4"
                  />
                </svg>
              </div>
              <p className="text-sm text-muted-foreground">Hay solución</p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => navigate(-1)}
              variant="default"
              size="lg"
              className="bg-primary hover:bg-primary/90 text-white gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              Volver atrás
            </Button>

            <Button
              onClick={() => navigate("/")}
              variant="outline"
              size="lg"
              className="border-secondary text-secondary hover:bg-secondary/10"
            >
              Ir al inicio
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
