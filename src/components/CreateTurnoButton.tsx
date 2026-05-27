import React, { useState } from "react";
import { ChevronDown, Layers, Plus } from "lucide-react";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import TurnoFormModal from "./TurnoFormModal";
import BulkTurnoFormModal from "./BulkTurnoFormModal";
import type { EventoResponse } from "../types/Evento";
import type { TurnoResponse } from "../types/Turno";

interface CreateTurnoButtonProps {
  evento: EventoResponse | null;
  onTurnoCreated: () => void;
  lastTurno?: TurnoResponse | null;
  variant?: "default" | "empty-state";
  buttonRef?: React.RefObject<HTMLButtonElement | null>;
}

export default function CreateTurnoButton({
  evento,
  onTurnoCreated,
  lastTurno,
  variant = "default",
  buttonRef,
}: CreateTurnoButtonProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isBulkFormOpen, setIsBulkFormOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleFormSubmitSuccess = async () => {
    setIsFormOpen(false);
    onTurnoCreated();
  };

  const isEmptyState = variant === "empty-state";

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            ref={buttonRef}
            className={
              isEmptyState
                ? "bg-[#68A243] hover:bg-[#5a9038] text-white"
                : "h-11 px-5 bg-[#68A243] hover:bg-[#5a9038] text-white shadow-lg shadow-[#68A243]/20"
            }
          >
            <Plus className="h-4 w-4" />
            {isEmptyState ? "Crear primer turno" : "Nuevo turno"}
            <ChevronDown className="h-3.5 w-3.5 opacity-70" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuItem
            onClick={() => setIsFormOpen(true)}
            className="cursor-pointer gap-2.5 py-2.5"
          >
            <Plus className="h-4 w-4 text-[#68A243] shrink-0" />
            <div>
              <p className="font-medium text-sm">Un turno</p>
              <p className="text-xs text-muted-foreground dark:text-gray-300">
                Crear turno individual
              </p>
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setIsBulkFormOpen(true)}
            className="cursor-pointer gap-2.5 py-2.5"
          >
            <Layers className="h-4 w-4 text-[#68A243] shrink-0" />
            <div>
              <p className="font-medium text-sm">Varios turnos</p>
              <p className="text-xs text-muted-foreground dark:text-gray-300">
                Crear turnos automáticamente
              </p>
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <TurnoFormModal
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        evento={evento}
        turnoEnEdicion={null}
        lastTurno={lastTurno}
        onSubmitSuccess={handleFormSubmitSuccess}
        isSaving={isSaving}
        onSavingChange={setIsSaving}
      />

      <BulkTurnoFormModal
        isOpen={isBulkFormOpen}
        onOpenChange={setIsBulkFormOpen}
        evento={evento}
        lastTurno={lastTurno}
        onSubmitSuccess={onTurnoCreated}
      />
    </>
  );
}
