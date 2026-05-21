import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, HelpCircle, X } from "lucide-react";
import { Button } from "./ui/button";

export interface TourStep {
  ref: { current: HTMLElement | null };
  title: string;
  description: string;
  side?: "top" | "bottom" | "left" | "right";
}

interface SpotlightTourProps {
  steps: TourStep[];
  storageKey: string;
  readyToStart?: boolean;
  shouldShowOnMount?: boolean;
  startStep?: number;
  onClose?: () => void;
  onStepChange?: (stepIdx: number) => void;
}

const TOOLTIP_W = 312;
const TOOLTIP_GAP = 14;
const SPOTLIGHT_PAD = 7;

function calcTooltipPos(
  rect: DOMRect,
  side: "top" | "bottom" | "left" | "right",
) {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  let top = 0;
  let left = 0;

  if (side === "bottom") {
    top = rect.bottom + TOOLTIP_GAP;
    left = cx - TOOLTIP_W / 2;
  } else if (side === "top") {
    top = rect.top - TOOLTIP_GAP - 230;
    left = cx - TOOLTIP_W / 2;
  } else if (side === "right") {
    top = cy - 115;
    left = rect.right + TOOLTIP_GAP;
  } else {
    top = cy - 115;
    left = rect.left - TOOLTIP_W - TOOLTIP_GAP;
  }

  return {
    top: Math.max(8, Math.min(vh - 250, top)),
    left: Math.max(8, Math.min(vw - TOOLTIP_W - 8, left)),
  };
}

export function SpotlightTour({
  steps,
  storageKey,
  readyToStart = true,
  shouldShowOnMount = false,
  startStep = 0,
  onClose,
  onStepChange,
}: SpotlightTourProps) {
  const [active, setActive] = useState(false);
  const [stepIdx, setStepIdx] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const retryRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const startTour = () => {
    if (!readyToStart) return;
    setStepIdx(startStep);
    setRect(null);
    setActive(true);
    onStepChange?.(startStep);
  };

  const close = () => {
    localStorage.setItem(storageKey, "1");
    setActive(false);
    setStepIdx(0);
    setRect(null);
    onClose?.();
  };

  const restartTour = () => {
    localStorage.removeItem(storageKey);
    startTour();
  };

  // Activacion inicial: respetar shouldShowOnMount o localStorage
  useEffect(() => {
    if (!readyToStart) return;

    const alreadyCompleted = localStorage.getItem(storageKey) === "1";

    // Si shouldShowOnMount es true, mostrar sin importar localStorage
    // Si es false, respetar localStorage
    if (!shouldShowOnMount && alreadyCompleted) return;

    const t = setTimeout(() => {
      setStepIdx(startStep);
      setRect(null);
      setActive(true);
    }, 600);
    return () => clearTimeout(t);
  }, [readyToStart, storageKey, shouldShowOnMount, startStep]);

  // Medición con reintentos: espera que el ref del step actual esté disponible
  useEffect(() => {
    if (!active) return;
    if (retryRef.current) clearTimeout(retryRef.current);
    setRect(null);

    let attempts = 0;

    const tryMeasure = () => {
      const el = steps[stepIdx]?.ref.current;

      if (!el) {
        if (attempts < 10) {
          attempts++;
          retryRef.current = setTimeout(tryMeasure, 200);
        } else {
          // Después de 10 reintentos (~2s), avanzar al siguiente válido o cerrar
          let fallback = stepIdx + 1;
          while (fallback < steps.length && !steps[fallback]?.ref.current)
            fallback++;
          if (fallback < steps.length) {
            setStepIdx(fallback);
          } else {
            close();
          }
        }
        return;
      }

      el.scrollIntoView({ behavior: "smooth", block: "center" });

      retryRef.current = setTimeout(() => {
        const measured = steps[stepIdx]?.ref.current?.getBoundingClientRect();
        if (measured) setRect(measured);
      }, 350);
    };

    tryMeasure();

    return () => {
      if (retryRef.current) clearTimeout(retryRef.current);
    };
    // steps es nuevo array cada render pero los ref-objects son estables
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, stepIdx]);

  // Re-medir en resize
  useEffect(() => {
    if (!active) return;
    const handle = () => {
      const el = steps[stepIdx]?.ref.current;
      if (el) setRect(el.getBoundingClientRect());
    };
    window.addEventListener("resize", handle);
    return () => window.removeEventListener("resize", handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, stepIdx]);

  const validSteps = steps.filter((s) => s.ref.current !== null);
  const progressIdx = validSteps.findIndex((s) => s === steps[stepIdx]);

  const goNext = () => {
    const next = stepIdx + 1;
    if (next < steps.length) {
      setRect(null);
      setStepIdx(next);
      onStepChange?.(next);
    } else {
      close();
    }
  };

  const goPrev = () => {
    let prev = stepIdx - 1;
    while (prev >= 0 && !steps[prev]?.ref.current) prev--;
    if (prev >= 0) {
      setRect(null);
      setStepIdx(prev);
      onStepChange?.(prev);
    }
  };

  const current = steps[stepIdx];
  const shouldRenderTour = Boolean(active && current && rect);

  const side = current?.side ?? "bottom";
  const { top, left } = rect ? calcTooltipPos(rect, side) : { top: 0, left: 0 };

  const isLastStep = shouldRenderTour ? stepIdx >= steps.length - 1 : false;

  return (
    <>
      {!active && (
        <Button
          onClick={restartTour}
          size="icon"
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg bg-[#68A243] hover:bg-[#68A243]/90 text-white z-50"
          title="Ver tutorial"
          aria-label="Volver a ejecutar tutorial"
        >
          <HelpCircle className="h-6 w-6" />
        </Button>
      )}

      {shouldRenderTour
        ? createPortal(
            <>
              {/* Capa de cierre */}
              <div
                className="fixed inset-0 z-[9998] cursor-default"
                aria-hidden="true"
                onClick={close}
              />

              {/* Spotlight */}
              <div
                aria-hidden="true"
                className="fixed z-[9999] rounded-xl pointer-events-none"
                style={{
                  top: rect!.top - SPOTLIGHT_PAD,
                  left: rect!.left - SPOTLIGHT_PAD,
                  width: rect!.width + SPOTLIGHT_PAD * 2,
                  height: rect!.height + SPOTLIGHT_PAD * 2,
                  boxShadow: "0 0 0 3px #68A243, 0 0 0 9999px rgba(0,0,0,0.62)",
                  transition:
                    "top 0.28s ease, left 0.28s ease, width 0.28s ease, height 0.28s ease",
                }}
              />

              {/* Tarjeta del tour */}
              <div
                className="fixed z-[10000] rounded-2xl border border-[#68A243]/25 bg-white dark:bg-[#0e1c16] shadow-2xl shadow-black/40"
                style={{
                  top,
                  left,
                  width: TOOLTIP_W,
                  transition: "top 0.28s ease, left 0.28s ease",
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-5 space-y-3.5">
                  {/* Encabezado */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1.5">
                      <span className="inline-flex h-5 items-center rounded-full px-2 text-[11px] font-bold tracking-wide bg-[#143E29] text-white dark:bg-[#68A243]">
                        {(progressIdx === -1 ? 0 : progressIdx) + 1} /{" "}
                        {Math.max(validSteps.length, 1)}
                      </span>
                      <h3 className="text-sm font-semibold text-[#143E29] dark:text-white leading-snug">
                        {current.title}
                      </h3>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 shrink-0 -mt-0.5 -mr-1 text-gray-400 hover:text-gray-700 dark:text-gray-500 dark:hover:text-gray-200"
                      onClick={close}
                      aria-label="Cerrar tour"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Descripción */}
                  <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                    {current.description}
                  </p>

                  {/* Puntos de progreso */}
                  <div className="flex items-center gap-1.5">
                    {validSteps.map((_, i) => (
                      <div
                        key={i}
                        className={[
                          "rounded-full transition-all duration-300",
                          i === progressIdx
                            ? "w-5 h-1.5 bg-[#68A243]"
                            : i < progressIdx
                              ? "w-1.5 h-1.5 bg-[#68A243]/45"
                              : "w-1.5 h-1.5 bg-gray-300 dark:bg-gray-600",
                        ].join(" ")}
                      />
                    ))}
                  </div>

                  {/* Navegación */}
                  <div className="flex items-center justify-between pt-0.5">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={goPrev}
                      disabled={stepIdx === 0}
                      className="h-8 px-3 text-xs gap-1 text-gray-500 dark:text-gray-400 disabled:opacity-0 disabled:pointer-events-none"
                    >
                      <ChevronLeft className="h-3.5 w-3.5" />
                      Anterior
                    </Button>
                    <Button
                      size="sm"
                      onClick={goNext}
                      className="h-8 px-4 text-xs gap-1 bg-[#68A243] hover:bg-[#5a9038] text-white"
                    >
                      {isLastStep ? (
                        "Finalizar"
                      ) : (
                        <>
                          Siguiente
                          <ChevronRight className="h-3.5 w-3.5" />
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </>,
            document.body,
          )
        : null}
    </>
  );
}
