import { useState, useEffect } from "react";
import {
  Trash2,
  CheckCircle,
  Clock,
  Building2,
  Search,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/Navbar";
import Footer from "@/layout/Footer";
import { toast } from "sonner";

// Mock data types
interface Company {
  id: number;
  razon_social: string;
  email: string;
  telefono_contacto: string;
  direccion: string;
  sector?: string;
  approved: boolean;
}

// Mock companies data
const MOCK_COMPANIES: Company[] = [
  {
    id: 1,
    razon_social: "TechSolutions SA",
    email: "contact@techsolutions.com",
    telefono_contacto: "+54 11 1234-5678",
    direccion: "Calle Principal 123, Buenos Aires",
    sector: "Tecnología",
    approved: false,
  },
  {
    id: 2,
    razon_social: "IndustriaGlobal ltda",
    email: "info@industriaglobal.com",
    telefono_contacto: "+54 11 2345-6789",
    direccion: "Av. Córdoba 456, Buenos Aires",
    sector: "Manufactura",
    approved: false,
  },
  {
    id: 3,
    razon_social: "ComercioExprés Inc",
    email: "ventas@comercioexpres.com",
    telefono_contacto: "+54 11 3456-7890",
    direccion: "Ruta Nacional 9 km 50, CABA",
    sector: "Comercio",
    approved: true,
  },
  {
    id: 4,
    razon_social: "Consulting Pro",
    email: "admin@consultingpro.ar",
    telefono_contacto: "+54 11 4567-8901",
    direccion: "Piso 10, Torre Financiera, Buenos Aires",
    sector: "Consultoría",
    approved: true,
  },
  {
    id: 5,
    razon_social: "Logística Andes",
    email: "logistics@andes.com",
    telefono_contacto: "+54 11 5678-9012",
    direccion: "Parque Industrial, La Plata",
    sector: "Logística",
    approved: false,
  },
  {
    id: 6,
    razon_social: "Agro Innovación",
    email: "info@agroinnovacion.com",
    telefono_contacto: "+54 11 6789-0123",
    direccion: "Ruta 5 km 150, Provincia de Buenos Aires",
    sector: "Agricultura",
    approved: true,
  },
];

function CompanyRow({
  company,
  onApprove,
  onDelete,
  onView,
}: {
  company: Company;
  onApprove: (c: Company) => void;
  onDelete: (c: Company) => void;
  onView: (c: Company) => void;
}) {
  return (
    <div className="bg-white dark:bg-[#143E29] rounded-lg border border-gray-200 dark:border-[#68A243]/20 p-4 hover:border-[#68A243]/50 transition-all">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Company Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-lg bg-gray-100 dark:bg-[#68A243]/10 flex items-center justify-center flex-shrink-0">
              <Building2 className="h-5 w-5 text-gray-600 dark:text-[#68A243]" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                {company.razon_social}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                {company.email}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {company.telefono_contacto}
              </p>
            </div>
          </div>
        </div>

        {/* Status & Sector */}
        <div className="flex flex-wrap gap-2 sm:justify-end">
          {company.sector && (
            <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-950/30 dark:text-blue-400">
              {company.sector}
            </Badge>
          )}
          <Badge
            className={
              company.approved
                ? "bg-green-100 text-green-800 dark:bg-[#68A243]/20 dark:text-[#68A243]"
                : "bg-amber-100 text-amber-800 dark:bg-amber-950/30 dark:text-amber-400"
            }
          >
            {company.approved ? "Aprobada" : "Pendiente"}
          </Badge>
        </div>

        {/* Actions */}
        <div className="flex gap-2 sm:justify-end">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onView(company)}
            className="border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-[#68A243]/40 dark:text-[#68A243] dark:hover:bg-[#68A243]/10"
          >
            <Eye className="h-4 w-4" />
          </Button>

          {!company.approved && (
            <Button
              size="sm"
              onClick={() => onApprove(company)}
              className="gap-2 bg-[#68A243] hover:bg-[#5a9038] text-white"
            >
              <CheckCircle className="h-4 w-4" />
              Aprobar
            </Button>
          )}

          <Button
            size="sm"
            variant="ghost"
            onClick={() => onDelete(company)}
            className="text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function CompaniesManagement() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [companyToDelete, setCompanyToDelete] = useState<Company | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "pending" | "approved"
  >("all");

  // Simulate data loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setCompanies(MOCK_COMPANIES);
      setIsLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  const pendingCompanies = companies.filter((c) => !c.approved);
  const approvedCompanies = companies.filter((c) => c.approved);

  const filteredCompanies = companies.filter((company) => {
    const matchesSearch =
      company.razon_social.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.email.toLowerCase().includes(searchTerm.toLowerCase());

    if (filterStatus === "pending") return !company.approved && matchesSearch;
    if (filterStatus === "approved") return company.approved && matchesSearch;
    return matchesSearch;
  });

  const handleApprove = (company: Company) => {
    setCompanies(
      companies.map((c) =>
        c.id === company.id ? { ...c, approved: true } : c,
      ),
    );
    toast.success(`${company.razon_social} ha sido aprobada`);
  };

  const handleDeleteClick = (company: Company) => {
    setCompanyToDelete(company);
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = () => {
    if (companyToDelete) {
      setCompanies(companies.filter((c) => c.id !== companyToDelete.id));
      toast.success(`${companyToDelete.razon_social} ha sido eliminada`);
      setIsDeleteOpen(false);
      setCompanyToDelete(null);
    }
  };

  const handleViewDetail = (company: Company) => {
    setSelectedCompany(company);
    setIsDetailOpen(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0a1a15] flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-[#68A243]" />
            <p className="mt-4 text-gray-600 dark:text-gray-400">
              Cargando empresas...
            </p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a1a15] transition-colors duration-300 flex flex-col">
      <Navbar />

      {/* Main Content */}
      <div className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Dashboard Administrativo
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Gestiona las solicitudes de empresas
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white dark:bg-[#143E29] rounded-lg p-6 border border-gray-200 dark:border-[#68A243]/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Total de Empresas
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                    {companies.length}
                  </p>
                </div>
                <Building2 className="h-12 w-12 text-gray-300 dark:text-[#68A243]/30" />
              </div>
            </div>

            <div className="bg-white dark:bg-[#143E29] rounded-lg p-6 border border-gray-200 dark:border-[#68A243]/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Pendientes de Revisión
                  </p>
                  <p className="text-3xl font-bold text-amber-600 dark:text-amber-400 mt-2">
                    {pendingCompanies.length}
                  </p>
                </div>
                <Clock className="h-12 w-12 text-amber-300 dark:text-amber-500/30" />
              </div>
            </div>

            <div className="bg-white dark:bg-[#143E29] rounded-lg p-6 border border-gray-200 dark:border-[#68A243]/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Aprobadas
                  </p>
                  <p className="text-3xl font-bold text-[#68A243] mt-2">
                    {approvedCompanies.length}
                  </p>
                </div>
                <CheckCircle className="h-12 w-12 text-[#68A243]/30" />
              </div>
            </div>
          </div>

          {/* Filters & Search */}
          <div className="mb-6 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  placeholder="Buscar por nombre o email..."
                  value={searchTerm}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setSearchTerm(e.target.value)
                  }
                  className="pl-10 h-11 border-gray-200 dark:border-[#68A243]/20 dark:bg-[#143E29] dark:text-white dark:placeholder-gray-500"
                />
              </div>

              {/* Filter Buttons */}
              <div className="flex gap-2">
                {(["all", "pending", "approved"] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors text-sm ${
                      filterStatus === status
                        ? "bg-[#68A243] text-white"
                        : "bg-white dark:bg-[#143E29] text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-[#68A243]/20 hover:border-[#68A243]/50"
                    }`}
                  >
                    {status === "all" && "Todos"}
                    {status === "pending" && "Pendientes"}
                    {status === "approved" && "Aprobadas"}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Companies List */}
          <div className="space-y-3">
            {filteredCompanies.length === 0 ? (
              <div className="text-center py-12 bg-white dark:bg-[#143E29] rounded-lg border border-dashed border-gray-300 dark:border-[#68A243]/20">
                <Building2 className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600 mb-4" />
                <p className="text-gray-600 dark:text-gray-400 font-medium">
                  {searchTerm || filterStatus !== "all"
                    ? "No se encontraron empresas"
                    : "No hay empresas registradas"}
                </p>
              </div>
            ) : (
              filteredCompanies.map((company) => (
                <CompanyRow
                  key={company.id}
                  company={company}
                  onApprove={handleApprove}
                  onDelete={handleDeleteClick}
                  onView={handleViewDetail}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl border-gray-200 dark:border-[#68A243]/20 bg-white dark:bg-[#143E29]">
          <DialogHeader>
            <DialogTitle className="text-2xl text-gray-900 dark:text-white">
              Información de Empresa
            </DialogTitle>
          </DialogHeader>

          {selectedCompany && (
            <div className="space-y-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {selectedCompany.razon_social}
                  </h3>
                  {selectedCompany.sector && (
                    <Badge className="mt-2 bg-[#68A243]/10 text-[#143E29] dark:bg-[#68A243]/20 dark:text-[#68A243]">
                      {selectedCompany.sector}
                    </Badge>
                  )}
                </div>
                <Badge
                  className={`${
                    selectedCompany.approved
                      ? "bg-green-100 text-green-800 dark:bg-[#68A243]/20 dark:text-[#68A243]"
                      : "bg-amber-100 text-amber-800 dark:bg-amber-950/30 dark:text-amber-400"
                  }`}
                >
                  {selectedCompany.approved ? "Aprobada" : "Pendiente"}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-xs font-semibold uppercase text-gray-600 dark:text-gray-400">
                    Email
                  </p>
                  <p className="mt-2 text-gray-900 dark:text-white break-all">
                    {selectedCompany.email}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-gray-600 dark:text-gray-400">
                    Teléfono
                  </p>
                  <p className="mt-2 text-gray-900 dark:text-white">
                    {selectedCompany.telefono_contacto}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase text-gray-600 dark:text-gray-400">
                  Dirección
                </p>
                <p className="mt-2 text-gray-900 dark:text-white">
                  {selectedCompany.direccion}
                </p>
              </div>

              {selectedCompany.sector && (
                <div>
                  <p className="text-xs font-semibold uppercase text-gray-600 dark:text-gray-400">
                    Sector
                  </p>
                  <p className="mt-2 text-gray-900 dark:text-white">
                    {selectedCompany.sector}
                  </p>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="gap-3 mt-8 pt-6 border-t border-gray-200 dark:border-[#68A243]/20">
            <Button
              variant="outline"
              onClick={() => setIsDetailOpen(false)}
              className="border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-[#68A243]/40 dark:text-[#68A243] dark:hover:bg-[#68A243]/10"
            >
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Modal */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="border-gray-200 dark:border-[#68A243]/20 bg-white dark:bg-[#143E29] max-w-md">
          <DialogHeader>
            <DialogTitle className="text-gray-900 dark:text-white">
              Confirmar eliminación
            </DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              ¿Estás seguro de que deseas eliminar{" "}
              <span className="font-bold text-gray-900 dark:text-white">
                {companyToDelete?.razon_social}
              </span>
              ? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-3">
            <Button
              variant="outline"
              onClick={() => setIsDeleteOpen(false)}
              className="border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-[#68A243]/40 dark:text-[#68A243] dark:hover:bg-[#68A243]/10"
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
