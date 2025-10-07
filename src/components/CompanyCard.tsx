import { Card, CardContent } from "../components/ui/card";
import type { Company } from "../context/CompanyContext";
import { Building2 } from "lucide-react";
import { useNavigate } from "react-router";

interface CompanyCardProps {
  company: Company;
}

export default function CompanyCard({ company }: CompanyCardProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/company/${company.id}`);
  };

  return (
    <Card
      className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
      onClick={handleClick}
    >
      <CardContent className="p-6">
        <div className="flex flex-col items-center text-center">
          <div className="w-24 h-24 rounded-xl bg-muted flex items-center justify-center mb-4 overflow-hidden">
            <img
              src={company.logo || "/placeholder.svg"}
              alt={company.name}
              className="w-full h-full object-contain p-2"
            />
          </div>

          <h3 className="font-semibold text-lg mb-2 line-clamp-1">
            {company.name}
          </h3>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
            <Building2 className="h-3 w-3" />
            {company.sector}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
