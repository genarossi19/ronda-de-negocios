import type React from "react";

import { useState } from "react";
import { Button } from "../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Badge } from "../components/ui/badge";
import { HelpCircle, ChevronLeft, ChevronRight, X } from "lucide-react";

interface Step {
  title: string;
  description: string;
  icon?: React.ReactNode;
}

interface HelpTutorialProps {
  title: string;
  steps: Step[];
}

export function HelpTutorial({ title, steps }: HelpTutorialProps) {
  const [open, setOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setCurrentStep(0);
  };

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        size="icon"
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg bg-[#68A243] hover:bg-[#68A243]/90 text-white z-50"
        title="Ayuda"
      >
        <HelpCircle className="h-6 w-6" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl text-[#143E29]">
              {title}
            </DialogTitle>
            <DialogDescription>
              Tutorial paso a paso para ayudarte a usar esta sección
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Progress indicator */}
            <div className="flex items-center justify-center gap-2">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index === currentStep
                      ? "bg-[#68A243] w-8"
                      : index < currentStep
                        ? "bg-[#68A243]/50 w-2"
                        : "bg-gray-300 w-2"
                  }`}
                />
              ))}
            </div>

            {/* Current step */}
            <div className="min-h-[200px]">
              <div className="flex items-start gap-4 mb-4">
                <Badge className="bg-[#68A243] hover:bg-[#68A243] text-lg px-3 py-1">
                  Paso {currentStep + 1}
                </Badge>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-[#143E29] mb-2">
                    {steps[currentStep].title}
                  </h3>
                  {steps[currentStep].icon && (
                    <div className="mb-4 flex items-center justify-center bg-[#68A243]/10 rounded-lg p-6">
                      {steps[currentStep].icon}
                    </div>
                  )}
                  <p className="text-gray-700 leading-relaxed">
                    {steps[currentStep].description}
                  </p>
                </div>
              </div>
            </div>

            {/* Navigation buttons */}
            <div className="flex items-center justify-between pt-4 border-t">
              <Button
                variant="outline"
                onClick={handlePrev}
                disabled={currentStep === 0}
                className="flex items-center gap-2 bg-transparent"
              >
                <ChevronLeft className="h-4 w-4" />
                Anterior
              </Button>

              <span className="text-sm text-gray-600">
                {currentStep + 1} de {steps.length}
              </span>

              {currentStep < steps.length - 1 ? (
                <Button
                  onClick={handleNext}
                  className="bg-[#68A243] hover:bg-[#68A243]/90 flex items-center gap-2"
                >
                  Siguiente
                  <ChevronRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleClose}
                  className="bg-[#68A243] hover:bg-[#68A243]/90"
                >
                  Finalizar
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
