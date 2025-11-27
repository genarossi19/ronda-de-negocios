import { useEffect, useRef, useState } from "react";
import { getCompanies } from "../api/EmpresaService";
import type { CompanyResponse } from "../types/Empresa";
import { Skeleton } from "./ui/skeleton";
export default function Carousel() {
  const [companies, setCompanies] = useState<CompanyResponse[]>([]);
  const [loading, isLoading] = useState(false);
  const [duplicatedCompanies, setDuplicatedCompanies] = useState<
    CompanyResponse[]
  >([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Traer empresas desde la API
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        isLoading(true);
        const data = await getCompanies();
        isLoading(false);
        setCompanies(data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchCompanies();
  }, []);

  // Duplicar dinámicamente hasta llenar al menos 2 veces el contenedor
  useEffect(() => {
    if (!companies.length || !scrollRef.current) return;

    const containerWidth = scrollRef.current.offsetWidth;
    let temp: CompanyResponse[] = [];
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

  return (
    <div className="relative overflow-hidden">
      <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-background to-transparent z-10" />
      <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-background to-transparent z-10" />

      <div
        ref={scrollRef}
        className="flex gap-8 overflow-x-hidden py-8"
        style={{ scrollBehavior: "auto" }}
      >
        {loading
          ? Array.from({ length: 10 }).map((_, index) => (
              <Skeleton
                key={index}
                className="flex-shrink-0 w-32 h-32 bg-gray-200 rounded-xl border flex items-center justify-center p-4 hover:shadow-md transition-shadow"
              />
            ))
          : duplicatedCompanies.map((company, index) => (
              <div
                key={`${company.id}-${index}`}
                className="flex-shrink-0 w-32 h-32 bg-gray-200 rounded-xl border flex items-center justify-center p-4 hover:shadow-md transition-shadow"
              >
                <img
                  src={company.logo || "/placeholder.svg"}
                  alt={company.razon_social}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
      </div>
    </div>
  );
}
