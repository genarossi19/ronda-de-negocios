"use client";

import { Button } from "../components/ui/button";
import { Building2 } from "lucide-react";

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <a
            href="#landing"
            className="flex items-center gap-2 font-semibold text-lg"
          >
            <Building2 className="h-6 w-6 text-primary" />
            <span>Ronda de Negocios</span>
          </a>

          <div className="flex items-center gap-4">
            <a
              href="#companies"
              className="text-sm font-medium hover:text-primary transition-colors hidden sm:block"
            >
              Empresas
            </a>
            <Button onClick={() => (window.location.href = "#register")}>
              Inscribirse
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
