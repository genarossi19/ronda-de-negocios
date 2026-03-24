import { Card } from "../components/ui/card";
import type { EmpresaResponse } from "../types/Empresa";
import { Building2 } from "lucide-react";

interface CompanyCardProps {
  company: EmpresaResponse;
  onClick?: (company: EmpresaResponse) => void;
}

export default function CompanyCard({ company, onClick }: CompanyCardProps) {
  const handleClick = () => {
    if (onClick) {
      onClick(company);
    }
  };

  return (
    <Card
      className="cursor-pointer border border-gray-200 dark:border-[#68A243]/20 rounded-xl shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-[#68A243] dark:bg-[#143E29] dark:hover:border-[#68A243]/60 transition-all duration-300 group p-4"
      onClick={handleClick}
    >
      <div className="flex flex-col items-center text-center">
        {/* Imagen */}
        <div className="w-28 h-28 rounded-xl bg-gray-200 dark:bg-[#0f2f25] flex items-center justify-center overflow-hidden mb-3 group-hover:bg-[#68A243]/10 dark:group-hover:bg-[#68A243]/20 transition-colors duration-300 relative">
          {company.logo ? (
            <img
              src={company.logo}
              alt={company.razon_social}
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <img
              src="/placeholder.svg"
              alt="placeholder"
              className="w-16 h-16 object-contain"
            />
          )}
        </div>

        <h3 className="font-semibold text-lg line-clamp-1 text-[#143E29] dark:text-white group-hover:text-[#143E29] dark:group-hover:text-[#68A243] transition-colors">
          {company.razon_social}
        </h3>

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#68A243]/10 dark:bg-[#68A243]/20 text-[#143E29] dark:text-[#68A243] text-sm font-medium group-hover:bg-[#68A243] group-hover:text-white dark:group-hover:bg-[#68A243] dark:group-hover:text-white transition-colors duration-300 mt-1">
          <Building2 className="h-3 w-3" />
          {company.sector.nombre}
        </div>
      </div>
    </Card>
  );
}
