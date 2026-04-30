import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "./ui/button";
import TurnoFormModal from "./TurnoFormModal";
import type { EventoResponse } from "../types/Evento";

interface CreateTurnoButtonProps {
  evento: EventoResponse | null;
  onTurnoCreated: () => void;
  variant?: "default" | "empty-state";
}

export default function CreateTurnoButton({
  evento,
  onTurnoCreated,
  variant = "default",
}: CreateTurnoButtonProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleOpenCreate = () => {
    setIsFormOpen(true);
  };

  const handleFormSubmitSuccess = async () => {
    setIsFormOpen(false);
    onTurnoCreated();
  };

  const isEmptyState = variant === "empty-state";

  return (
    <>
      <Button
        onClick={handleOpenCreate}
        className={
          isEmptyState
            ? "bg-[#68A243] hover:bg-[#5a9038] text-white"
            : "h-11 px-5 bg-[#68A243] hover:bg-[#5a9038] text-white shadow-lg shadow-[#68A243]/20"
        }
      >
        <Plus className="h-4 w-4" />
        {isEmptyState ? "Crear primer turno" : "Nuevo turno"}
      </Button>

      <TurnoFormModal
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        evento={evento}
        turnoEnEdicion={null}
        onSubmitSuccess={handleFormSubmitSuccess}
        isSaving={isSaving}
        onSavingChange={setIsSaving}
      />
    </>
  );
}
