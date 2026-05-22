import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { CheckCircle2, Loader2 } from "lucide-react";
import ParticipacionInfoModal from "./ParticipacionInfoModal";

interface ConfirmarParticipacionDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  isConfirming: boolean;
  onConfirm: () => void;
}

export default function ConfirmarParticipacionDialog({
  isOpen,
  onOpenChange,
  isConfirming,
  onConfirm,
}: ConfirmarParticipacionDialogProps) {
  const [isInfoOpen, setIsInfoOpen] = useState(false);

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="dark:bg-[#143E29] dark:border-[#68A243]/20">
          <DialogHeader>
            <DialogTitle className="text-[#143E29] dark:text-white text-xl">
              ¿Confirmás tu participación?
            </DialogTitle>
            <DialogDescription className="dark:text-gray-300 text-base">
              Al confirmar, tu empresa quedará registrada como participante del
              evento y podrás reservar turnos para reunirte con otras empresas.
            </DialogDescription>
          </DialogHeader>

          <div className="py-1">
            <button
              onClick={() => setIsInfoOpen(true)}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-[#68A243] hover:text-[#5a9038] dark:text-[#9FD27B] dark:hover:text-[#68A243] transition-colors duration-200"
            >
              <span>¿Qué implica exactamente participar?</span>
              <svg
                className="h-3.5 w-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={isConfirming}
              className="dark:text-gray-300 dark:hover:bg-[#0f2f25]"
            >
              Cancelar
            </Button>
            <Button
              onClick={onConfirm}
              disabled={isConfirming}
              className="bg-[#68A243] hover:bg-[#5a9038] text-white font-semibold"
            >
              {isConfirming ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Confirmando...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-1" />
                  ¡Quiero participar!
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ParticipacionInfoModal
        isOpen={isInfoOpen}
        onClose={() => setIsInfoOpen(false)}
      />
    </>
  );
}
