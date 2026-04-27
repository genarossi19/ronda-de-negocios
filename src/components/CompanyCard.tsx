import { useMemo, useState } from "react";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import type { EmpresaResponse } from "../types/Empresa";
import { Building2, XCircle, Clock, MailX } from "lucide-react";

interface CompanyCardProps {
  company: EmpresaResponse;
  onClick?: (company: EmpresaResponse) => void;
  isAdmin?: boolean;
  isCurrentUserCompany?: boolean;
}

export default function CompanyCard({
  company,
  onClick,
  isAdmin,
  isCurrentUserCompany = false,
}: CompanyCardProps) {
  const [imageError, setImageError] = useState(false);

  const handleClick = () => {
    if (onClick) {
      onClick(company);
    }
  };

  const companyInitials = useMemo(() => {
    return company.razon_social
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0]?.toUpperCase() ?? "")
      .join("");
  }, [company.razon_social]);

  const isDeleted = company.eliminado === true;
  const isNotApproved = company.aprobada === false;
  const emailConfirmado =
    company.email_confirmado ?? company.email_confirmardo ?? false;
  const hasUnvalidatedEmail = company.email !== undefined && !emailConfirmado;
  const showStatusBadges =
    isAdmin && (isDeleted || isNotApproved || hasUnvalidatedEmail);

  return (
    <Card
      className={`cursor-pointer rounded-xl shadow-sm hover:shadow-xl hover:-translate-y-1 dark:bg-[#143E29] transition-all duration-300 group p-4 ${
        isCurrentUserCompany
          ? "border-2 border-orange-400/60 dark:border-orange-500/50 hover:border-orange-500 dark:hover:border-orange-400 hover:shadow-orange-200/50 dark:hover:shadow-orange-500/20"
          : "border border-gray-200 dark:border-[#68A243]/20 hover:border-[#68A243] dark:hover:border-[#68A243]/60"
      } ${isDeleted ? "opacity-60 dark:opacity-50" : ""}`}
      onClick={handleClick}
    >
      <div className="flex flex-col items-center text-center relative">
        {/* Status Badges - Solo visible para Admin */}
        {showStatusBadges && (
          <div className="absolute top-0 right-0 flex flex-col gap-1.5">
            {isDeleted && (
              <Badge
                variant="destructive"
                className="bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-950/30 dark:text-red-400 text-xs gap-1 flex items-center"
              >
                <XCircle className="h-3 w-3" />
                Eliminada
              </Badge>
            )}
            {isNotApproved && (
              <Badge
                variant="secondary"
                className="bg-amber-100 text-amber-800 hover:bg-amber-100 dark:bg-amber-950/30 dark:text-amber-400 text-xs gap-1 flex items-center"
              >
                <Clock className="h-3 w-3" />
                Pendiente
              </Badge>
            )}
            {hasUnvalidatedEmail && (
              <Badge
                variant="secondary"
                className="bg-amber-100 text-amber-800 hover:bg-amber-100 dark:bg-amber-950/30 dark:text-amber-400 text-xs gap-1 flex items-center"
              >
                <MailX className="h-3 w-3" />
                Email sin validar
              </Badge>
            )}
          </div>
        )}

        {/* Imagen */}
        <div className="w-28 h-28 rounded-xl flex items-center justify-center overflow-hidden mb-3 transition-colors duration-300 relative">
          {company.logo && !imageError ? (
            <img
              src={company.logo}
              alt={company.razon_social}
              onError={() => setImageError(true)}
              className="absolute inset-0 w-full h-full object-cover object-center rounded-xl"
            />
          ) : (
            <div
              aria-label={company.razon_social}
              className="absolute inset-0 flex items-center justify-center bg-[#68A243]/20 dark:bg-[#68A243]/35 text-[#143E29] dark:text-[#d7efc8]"
            >
              <span className="text-3xl font-bold tracking-wide">
                {companyInitials || "?"}
              </span>
            </div>
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
