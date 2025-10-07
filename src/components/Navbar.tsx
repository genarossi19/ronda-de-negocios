import { Button } from "../components/ui/button";
import { Building2 } from "lucide-react";
import React from "react";
import { Link, useNavigate } from "react-router";
type NavbarVariant = "default" | "solid";

interface NavbarProps {
  variant?: NavbarVariant | boolean; // allow boolean for backwards compatibility
}

export default function Navbar({ variant = "default" }: NavbarProps) {
  const isSolid = variant === true || variant === "solid";

  const navigate = useNavigate();

  return (
    <nav
      className={
        "fixed top-0 left-0 right-0 z-50 border-b transition-colors duration-300" +
        (isSolid ? " navbar-solid" : " bg-background/80 backdrop-blur-lg")
      }
      data-navbar-variant={isSolid ? "solid" : "default"}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link
            to="/"
            className="flex items-center gap-2 font-semibold text-lg"
          >
            <Building2
              className={
                isSolid ? "h-6 w-6 text-white" : "h-6 w-6 text-primary"
              }
            />
            <span className={isSolid ? "text-white" : "text-foreground"}>
              Ronda de Negocios
            </span>
          </Link>

          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={(e) => {
                e.preventDefault();
                navigate("/companies");
              }}
              className={
                "text-sm font-medium transition-colors hidden sm:block" +
                (isSolid ? " text-white hover:opacity-90" : " hover:text-white")
              }
            >
              Empresas
            </Button>
            <Button
              onClick={(e) => {
                e.preventDefault();
                navigate("/register");
              }}
              className={isSolid ? "text-white" : ""}
            >
              Inscribirse
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
