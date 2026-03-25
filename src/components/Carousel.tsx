import { useEffect, useRef, useState } from "react";
import { getCompanies } from "../api/EmpresaService";
import type { EmpresaResponse } from "../types/Empresa";
import { Skeleton } from "./ui/skeleton";
import { AlertCircle, RotateCcw } from "lucide-react";
import { Button } from "./ui/button";

interface CarouselProps {
  onCompaniesLoaded?: (count: number) => void;
}

interface ImageAspectRatio {
  [key: string]: "wide" | "tall" | "normal";
}

export default function Carousel({ onCompaniesLoaded }: CarouselProps) {
  const [companies, setCompanies] = useState<EmpresaResponse[]>([]);
  const [loading, isLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [duplicatedCompanies, setDuplicatedCompanies] = useState<
    EmpresaResponse[]
  >([]);
  const [imageAspectRatios, setImageAspectRatios] = useState<ImageAspectRatio>(
    {},
  );
  const scrollRef = useRef<HTMLDivElement>(null);

  // Traer empresas desde la API
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        isLoading(true);
        setError(null);
        const data = await getCompanies();
        isLoading(false);
        setCompanies(data);
        onCompaniesLoaded?.(data.length);
      } catch (error) {
        isLoading(false);
        console.error(error);
        setError(
          "No pudimos cargar las empresas en este momento. Por favor, intenta más tarde.",
        );
      }
    };
    fetchCompanies();
  }, [onCompaniesLoaded]);

  // Duplicar dinámicamente hasta llenar al menos 2 veces el contenedor
  useEffect(() => {
    if (!companies.length || !scrollRef.current) return;

    const containerWidth = scrollRef.current.offsetWidth;
    let temp: EmpresaResponse[] = [];
    let totalWidth = 0;

    const itemWidth = 32 + 8; // w-32 + gap-8 (aprox)
    while (totalWidth < containerWidth * 2) {
      temp = [...temp, ...companies];
      totalWidth += companies.length * itemWidth;
    }

    setDuplicatedCompanies(temp);
  }, [companies]);

  // Scroll automático
  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer || !duplicatedCompanies.length) return;

    const scrollStep = 1;
    let scrollAmount = 0;

    const scroll = () => {
      scrollAmount += scrollStep;
      scrollContainer.scrollLeft = scrollAmount;

      // Reiniciar al llegar a la mitad
      if (scrollAmount >= scrollContainer.scrollWidth / 2) {
        scrollAmount = 0;
        scrollContainer.scrollLeft = 0;
      }
    };

    const interval = setInterval(scroll, 20);
    return () => clearInterval(interval);
  }, [duplicatedCompanies]);

  // Detectar aspect ratio de la imagen para aplicar styling dinámico
  const handleImageLoad = (
    id: string,
    event: React.SyntheticEvent<HTMLImageElement>,
  ) => {
    const img = event.currentTarget;
    const aspectRatio = img.naturalWidth / img.naturalHeight;

    // Clasificar según aspect ratio
    let classification: "wide" | "tall" | "normal" = "normal";
    if (aspectRatio > 1.3) {
      classification = "wide";
    } else if (aspectRatio < 0.77) {
      classification = "tall";
    }

    setImageAspectRatios((prev) => ({
      ...prev,
      [id]: classification,
    }));
  };

  // Reintentar cargar empresas
  const handleRetry = () => {
    const fetchCompanies = async () => {
      try {
        isLoading(true);
        setError(null);
        const data = await getCompanies();
        isLoading(false);
        setCompanies(data);
        onCompaniesLoaded?.(data.length);
      } catch (error) {
        isLoading(false);
        console.error(error);
        setError(
          "No pudimos cargar las empresas en este momento. Por favor, intenta más tarde.",
        );
      }
    };
    fetchCompanies();
  };

  return (
    <div className="relative overflow-hidden">
      {/* Error State */}
      {error && (
        <div className="mb-6 flex items-start gap-4 rounded-lg border border-red-200 dark:border-red-900/30 bg-red-50 dark:bg-red-950/20 p-4 transition-colors duration-300">
          <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-900 dark:text-red-300">
              {error}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRetry}
            className="flex-shrink-0 border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/40 hover:text-red-700 dark:hover:text-red-300 transition-colors duration-300"
          >
            <RotateCcw className="h-4 w-4 mr-1" />
            Reintentar
          </Button>
        </div>
      )}

      <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-white dark:from-[#0a1a15] to-transparent z-10" />
      <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-white dark:from-[#0a1a15] to-transparent z-10" />

      <div
        ref={scrollRef}
        className="flex gap-8 overflow-x-hidden py-8"
        style={{ scrollBehavior: "auto" }}
      >
        {loading
          ? Array.from({ length: 10 }).map((_, index) => (
              <Skeleton
                key={index}
                className="flex-shrink-0 w-32 h-32 bg-gray-200 dark:bg-[#143E29] rounded-xl border border-gray-300 dark:border-[#68A243]/20 flex items-center justify-center p-4 hover:shadow-md dark:hover:shadow-lg transition-shadow duration-300"
              />
            ))
          : duplicatedCompanies.map((company, index) => {
              const aspectClass = imageAspectRatios[company.id] || "normal";

              return (
                <div
                  key={`${company.id}-${index}`}
                  className="flex-shrink-0 w-32 h-32 bg-white dark:bg-[#143E29] rounded-xl border border-gray-300 dark:border-[#68A243]/20 flex items-center justify-center hover:shadow-lg dark:hover:shadow-xl transition-shadow duration-200 overflow-hidden"
                >
                  <img
                    src={company.logo || "/placeholder.svg"}
                    alt={company.razon_social}
                    loading="lazy"
                    onLoad={(e) => handleImageLoad(company.id, e)}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "/placeholder.svg";
                    }}
                    className={`w-full h-full object-cover object-center ${
                      aspectClass === "wide"
                        ? "h-full w-auto"
                        : aspectClass === "tall"
                          ? "w-full h-auto"
                          : ""
                    }`}
                  />
                </div>
              );
            })}
      </div>
    </div>
  );
}
