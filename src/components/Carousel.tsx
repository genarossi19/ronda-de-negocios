import { useCompanies } from "../context/CompanyContext";
import { useEffect, useRef } from "react";

export default function Carousel() {
  const { companies } = useCompanies();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    let scrollAmount = 0;
    const scrollStep = 1;
    const scrollInterval = 30;

    const scroll = () => {
      if (scrollContainer) {
        scrollAmount += scrollStep;
        scrollContainer.scrollLeft = scrollAmount;

        if (scrollAmount >= scrollContainer.scrollWidth / 2) {
          scrollAmount = 0;
        }
      }
    };

    const interval = setInterval(scroll, scrollInterval);
    return () => clearInterval(interval);
  }, [companies]);

  const duplicatedCompanies = [...companies, ...companies, ...companies];

  return (
    <div className="relative overflow-hidden">
      <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-background to-transparent z-10" />
      <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-background to-transparent z-10" />

      <div
        ref={scrollRef}
        className="flex gap-8 overflow-x-hidden py-8"
        style={{ scrollBehavior: "auto" }}
      >
        {duplicatedCompanies.map((company, index) => (
          <div
            key={`${company.id}-${index}`}
            className="flex-shrink-0 w-32 h-32 bg-card rounded-xl border flex items-center justify-center p-4 hover:shadow-md transition-shadow"
          >
            <img
              src={company.logo || "/placeholder.svg"}
              alt={company.name}
              className="w-full h-full object-contain"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
