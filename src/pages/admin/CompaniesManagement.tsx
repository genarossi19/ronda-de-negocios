import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  ArrowLeft,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  Building2,
  Search,
  Eye,
  MapPin,
  Phone,
  FileText,
  Tag,
  MailCheck,
  MailX,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Skeleton } from "../../components/ui/skeleton";
import Navbar from "../../components/Navbar";
import Footer from "../../layout/Footer";
import { toast } from "sonner";
import {
  getCompanies,
  approveCompany,
  deleteCompany,
} from "../../api/EmpresaService";
import type { EmpresaResponse } from "../../types/Empresa";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import { getApiErrorMessage, isSessionExpiredError } from "../../lib/axios";

function CompanyRow({
  company,
  onApprove,
  onDelete,
  onView,
}: {
  company: EmpresaResponse;
  onApprove: (c: EmpresaResponse) => void;
  onDelete: (c: EmpresaResponse) => void;
  onView: (c: EmpresaResponse) => void;
}) {
  const emailConfirmado =
    company.email_confirmado ?? company.email_confirmardo ?? false;

  return (
    <div className="bg-white dark:bg-[#143E29] rounded-lg border border-gray-200 dark:border-[#68A243]/20 p-4 hover:border-[#68A243]/50 transition-all">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Company Info with Logo/Icon */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-4">
            {/* Logo o Icono */}
            {company.logo ? (
              <div className="h-20 w-20 rounded-lg overflow-hidden flex-shrink-0 shadow-md">
                <img
                  src={company.logo}
                  alt={company.razon_social}
                  className="w-full h-full object-cover object-center rounded-lg"
                />
              </div>
            ) : (
              <div className="h-20 w-20 rounded-lg bg-gray-100 dark:bg-[#68A243]/20 flex items-center justify-center flex-shrink-0 border-2 border-dashed border-gray-300 dark:border-[#68A243]/30">
                <Building2 className="h-10 w-10 text-gray-400 dark:text-[#68A243]/50" />
              </div>
            )}

            {/* Company Details */}
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white truncate">
                {company.razon_social}
              </h3>
              <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 truncate">
                <Building2 className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">CUIT: {company.cuit}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 truncate">
                <Phone className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">{company.telefono_contacto}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Status & Sector */}
        <div className="flex flex-wrap gap-2 sm:justify-end">
          {company.sector && (
            <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-950/30 dark:text-blue-400">
              {company.sector.nombre}
            </Badge>
          )}
          <Badge
            className={
              emailConfirmado
                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400"
                : "bg-amber-100 text-amber-800 dark:bg-amber-950/30 dark:text-amber-400"
            }
          >
            {emailConfirmado ? "Email validado" : "Email sin validar"}
          </Badge>
          <Badge
            className={
              company.eliminado
                ? "bg-red-100 text-red-800 dark:bg-red-950/30 dark:text-red-400"
                : company.aprobada
                  ? "bg-green-100 text-green-800 dark:bg-[#68A243]/20 dark:text-[#68A243]"
                  : "bg-amber-100 text-amber-800 dark:bg-amber-950/30 dark:text-amber-400"
            }
          >
            {company.eliminado
              ? "Eliminada"
              : company.aprobada
                ? "Aprobada"
                : "Pendiente"}
          </Badge>
        </div>

        {/* Actions */}
        <div className="flex gap-2 sm:justify-end">
          {company.aprobada ? (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onApprove(company)}
              className="gap-2 border-gray-300 text-gray-700 hover:bg-red-50 hover:text-red-600 hover:border-red-200  dark:border-[#68A243]/40 dark:text-[#68A243] dark:hover:bg-[#68A243]/10 transition-colors ease-in-out duration-300"
            >
              <XCircle className="h-4 w-4" />
              Desaprobar
            </Button>
          ) : (
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
            onClick={() => onView(company)}
            className="border-gray-300 text-gray-700 hover:bg-gray-100 hover:text-gray-700 dark:border-[#68A243]/40 dark:text-[#68A243] dark:hover:bg-[#68A243]/10"
          >
            <Eye className="h-4 w-4" />
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={() => onDelete(company)}
            className="text-red-600 hover:bg-red-50 hover:text-red-600 dark:text-red-400 dark:hover:bg-red-950/30"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function HeroSkeleton() {
  return (
    <section className="rounded-3xl bg-gradient-to-br from-[#143E29] via-[#1a5236] to-[#143E29] px-6 py-8 md:px-8 shadow-xl shadow-[#143E29]/10">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl w-full space-y-4">
          <Skeleton className="h-10 w-24 bg-white/10" />
          <div className="flex items-center gap-3">
            <Skeleton className="h-11 w-11 rounded-2xl bg-white/10" />
            <Skeleton className="h-10 w-64 bg-white/10" />
          </div>
          <Skeleton className="h-5 w-full max-w-xl bg-white/10" />
        </div>
      </div>
    </section>
  );
}

function StatCardSkeleton() {
  return (
    <Card className="!gap-2 !py-3 border-[#68A243]/20">
      <CardHeader className="!px-5 !pb-0">
        <Skeleton className="h-4 w-28 dark:bg-[#0f2f25]" />
      </CardHeader>
      <CardContent className="!px-5 !pt-0">
        <div className="flex items-center justify-between gap-3">
          <Skeleton className="h-8 w-12 dark:bg-[#0f2f25]" />
          <Skeleton className="h-8 w-8 rounded-full dark:bg-[#0f2f25]" />
        </div>
      </CardContent>
    </Card>
  );
}

function FiltersSkeleton() {
  return (
    <div className="mb-6 space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <Skeleton className="h-11 flex-1 dark:bg-[#0f2f25]" />
        <div className="flex gap-2 flex-wrap">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton
              key={index}
              className="h-10 w-28 rounded-lg dark:bg-[#0f2f25]"
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function CompanyRowSkeleton() {
  return (
    <div className="bg-white dark:bg-[#143E29] rounded-lg border border-gray-200 dark:border-[#68A243]/20 p-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-4">
            <Skeleton className="h-20 w-20 rounded-lg dark:bg-[#0f2f25]" />

            <div className="flex-1 min-w-0 space-y-2">
              <Skeleton className="h-7 w-52 dark:bg-[#0f2f25]" />
              <Skeleton className="h-4 w-32 dark:bg-[#0f2f25]" />
              <Skeleton className="h-4 w-28 dark:bg-[#0f2f25]" />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 sm:justify-end">
          <Skeleton className="h-6 w-24 rounded-full dark:bg-[#0f2f25]" />
          <Skeleton className="h-6 w-24 rounded-full dark:bg-[#0f2f25]" />
        </div>

        <div className="flex gap-2 sm:justify-end">
          <Skeleton className="h-9 w-28 dark:bg-[#0f2f25]" />
          <Skeleton className="h-9 w-9 dark:bg-[#0f2f25]" />
          <Skeleton className="h-9 w-9 dark:bg-[#0f2f25]" />
        </div>
      </div>
    </div>
  );
}

export default function CompaniesManagement() {
  const navigate = useNavigate();
  const { isAdmin } = useCurrentUser();
  const [companies, setCompanies] = useState<EmpresaResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCompany, setSelectedCompany] =
    useState<EmpresaResponse | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [companyToDelete, setCompanyToDelete] =
    useState<EmpresaResponse | null>(null);
  const [isApproveOpen, setIsApproveOpen] = useState(false);
  const [companyToApprove, setCompanyToApprove] =
    useState<EmpresaResponse | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "pending" | "approved" | "deleted"
  >("all");

  // Proteger: solo admin puede acceder
  useEffect(() => {
    if (!isAdmin) {
      navigate("/", { replace: true });
    }
  }, [isAdmin, navigate]);

  // Cargar empresas desde el backend
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setIsLoading(true);
        const data = await getCompanies();
        setCompanies(data);
      } catch (err) {
        console.error("Error loading companies:", err);
        if (!isSessionExpiredError(err)) {
          toast.error("Error al cargar las empresas");
        }
        setCompanies([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCompanies();
  }, []);

  const pendingCompanies = companies.filter((c) => !c.aprobada);
  const approvedCompanies = companies.filter((c) => c.aprobada);

  const filteredCompanies = companies
    .filter((company) => {
      const matchesSearch =
        company.razon_social.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (company.cuit &&
          company.cuit.toLowerCase().includes(searchTerm.toLowerCase()));

      if (filterStatus === "deleted")
        return !!company.eliminado && matchesSearch;
      if (filterStatus === "pending")
        return !company.eliminado && !company.aprobada && matchesSearch;
      if (filterStatus === "approved")
        return !company.eliminado && !!company.aprobada && matchesSearch;
      // "all": excluir eliminadas
      return !company.eliminado && matchesSearch;
    })
    .sort((a, b) => {
      if (filterStatus !== "all") return 0;
      return Number(a.aprobada) - Number(b.aprobada);
    });

  const handleApproveClick = (company: EmpresaResponse) => {
    setCompanyToApprove(company);
    setIsApproveOpen(true);
  };

  const handleConfirmApprove = async () => {
    if (companyToApprove) {
      const nuevoEstado = !companyToApprove.aprobada;

      try {
        await approveCompany(companyToApprove.id, nuevoEstado);

        // Actualizar UI automáticamente
        setCompanies(
          companies.map((c) =>
            c.id === companyToApprove.id ? { ...c, aprobada: nuevoEstado } : c,
          ),
        );

        toast.success(
          nuevoEstado
            ? `${companyToApprove.razon_social} ha sido aprobada correctamente`
            : `${companyToApprove.razon_social} ha sido desaprobada correctamente`,
        );
        setIsApproveOpen(false);
        setCompanyToApprove(null);
      } catch (err) {
        const errorMessage = getApiErrorMessage(
          err,
          "Ha ocurrido un error. Intenta de nuevo más tarde",
        );
        if (errorMessage) {
          toast.error(errorMessage);
        }

        console.error("Error approving company:", err);
      }
    }
  };

  const handleDeleteClick = (company: EmpresaResponse) => {
    setCompanyToDelete(company);
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (companyToDelete) {
      try {
        await deleteCompany(companyToDelete.id);

        // Actualizar UI automáticamente
        setCompanies(
          companies.map((c) =>
            c.id === companyToDelete.id ? { ...c, eliminado: true } : c,
          ),
        );

        toast.success(
          `${companyToDelete.razon_social} ha sido eliminada correctamente`,
        );
        setIsDeleteOpen(false);
        setCompanyToDelete(null);
      } catch (err) {
        const errorMessage = getApiErrorMessage(
          err,
          "Ha ocurrido un error. Intenta de nuevo más tarde",
        );
        if (errorMessage) {
          toast.error(errorMessage);
        }

        console.error("Error deleting company:", err);
      }
    }
  };

  const handleViewDetail = (company: EmpresaResponse) => {
    setSelectedCompany(company);
    setIsDetailOpen(true);
  };

  // No renderizar si no es admin
  if (!isAdmin) return null;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0a1a15] flex flex-col">
        <Navbar />
        <main className="flex-1 pt-24 pb-12 px-4">
          <div className="max-w-7xl mx-auto space-y-8">
            <HeroSkeleton />

            <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <StatCardSkeleton key={index} />
              ))}
            </section>

            <FiltersSkeleton />

            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, index) => (
                <CompanyRowSkeleton key={index} />
              ))}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a1a15] transition-colors duration-300 flex flex-col">
      <Navbar />

      <main className="flex-1 pt-24 pb-12 px-4">
        <div className="max-w-7xl mx-auto space-y-8">
          <section className="rounded-3xl bg-gradient-to-br from-[#143E29] via-[#1a5236] to-[#143E29] px-6 py-8 md:px-8 text-white shadow-xl shadow-[#143E29]/10">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl space-y-4">
                <Button
                  variant="ghost"
                  onClick={() => navigate(-1)}
                  className="w-fit px-0 text-white/90 hover:bg-white/10 hover:text-white"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Volver
                </Button>
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-[#9FD27B] ring-1 ring-white/15 backdrop-blur-sm">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <h1 className="text-3xl sm:text-4xl font-semibold">
                    Gestionar empresas
                  </h1>
                </div>
                <p className="text-white/80 text-base max-w-2xl">
                  Revisá, aprobá y administrá rápidamente las empresas
                  registradas.
                </p>
              </div>
            </div>
          </section>

          <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="!gap-2 !py-3 border-[#68A243]/20">
              <CardHeader className="!px-5 !pb-0">
                <CardTitle className="text-sm text-muted-foreground dark:text-gray-300">
                  Total de empresas
                </CardTitle>
              </CardHeader>
              <CardContent className="!px-5 !pt-0">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-3xl font-bold leading-none text-[#143E29] dark:text-white">
                    {companies.length}
                  </div>
                  <div className="rounded-full bg-[#143E29]/8 p-2 dark:bg-[#143E29]/35">
                    <Building2 className="h-3.5 w-3.5 text-[#143E29] dark:text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="!gap-2 !py-3 border-[#68A243]/20">
              <CardHeader className="!px-5 !pb-0">
                <CardTitle className="text-sm text-muted-foreground dark:text-gray-300">
                  Pendientes
                </CardTitle>
              </CardHeader>
              <CardContent className="!px-5 !pt-0">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-3xl font-bold leading-none text-amber-600 dark:text-amber-400">
                    {pendingCompanies.length}
                  </div>
                  <div className="rounded-full bg-amber-100 p-2 dark:bg-amber-950/30">
                    <Clock className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="!gap-2 !py-3 border-[#68A243]/20">
              <CardHeader className="!px-5 !pb-0">
                <CardTitle className="text-sm text-muted-foreground dark:text-gray-300">
                  Aprobadas
                </CardTitle>
              </CardHeader>
              <CardContent className="!px-5 !pt-0">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-3xl font-bold leading-none text-[#68A243]">
                    {approvedCompanies.length}
                  </div>
                  <div className="rounded-full bg-[#68A243]/10 p-2 dark:bg-[#68A243]/20">
                    <CheckCircle className="h-3.5 w-3.5 text-[#68A243]" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Filters & Search */}
          <div className="mb-6 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  placeholder="Buscar por nombre o CUIT..."
                  value={searchTerm}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setSearchTerm(e.target.value)
                  }
                  className="pl-10 h-11 border-gray-200 dark:border-[#68A243]/20 dark:bg-[#143E29] dark:text-white dark:placeholder-gray-500"
                />
              </div>

              {/* Filter Buttons */}
              <div className="flex gap-2 flex-wrap">
                {(["all", "pending", "approved", "deleted"] as const).map(
                  (status) => (
                    <button
                      key={status}
                      onClick={() => setFilterStatus(status)}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors text-sm ${
                        filterStatus === status
                          ? status === "deleted"
                            ? "bg-red-600 text-white"
                            : "bg-[#68A243] text-white"
                          : "bg-white dark:bg-[#143E29] text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-[#68A243]/20 hover:border-[#68A243]/50"
                      }`}
                    >
                      {status === "all" && "Todos"}
                      {status === "pending" && "Pendientes"}
                      {status === "approved" && "Aprobadas"}
                      {status === "deleted" && "Eliminadas"}
                    </button>
                  ),
                )}
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
                  onApprove={handleApproveClick}
                  onDelete={handleDeleteClick}
                  onView={handleViewDetail}
                />
              ))
            )}
          </div>
        </div>
      </main>

      {/* Detail Modal */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-4xl! border-gray-200 dark:border-[#68A243]/20 bg-white dark:bg-[#143E29] p-0! max-h-[95vh]!">
          {selectedCompany && (
            <>
              {/* Header con Logo y Status */}
              <div className="bg-gradient-to-r from-[#68A243]/10 to-[#143E29]/10 dark:from-[#68A243]/20 dark:to-[#143E29]/30 p-8 border-b border-gray-200 dark:border-[#68A243]/20 flex items-start justify-between gap-8">
                <div className="flex items-start gap-6 flex-1">
                  {/* Logo */}
                  {selectedCompany.logo ? (
                    <div className="h-32 w-32 rounded-lg overflow-hidden flex-shrink-0 shadow-md">
                      <img
                        src={selectedCompany.logo}
                        alt={selectedCompany.razon_social}
                        className="w-full h-full object-cover object-center rounded-lg"
                      />
                    </div>
                  ) : (
                    <div className="h-32 w-32 rounded-lg bg-gray-100 dark:bg-[#68A243]/20 flex items-center justify-center flex-shrink-0 border-2 border-dashed border-gray-300 dark:border-[#68A243]/30">
                      <Building2 className="h-16 w-16 text-gray-400 dark:text-[#68A243]/50" />
                    </div>
                  )}

                  {/* Título e Información Principal */}
                  <div className="flex-1 min-w-0">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
                      {selectedCompany.razon_social}
                    </h2>
                    <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3">
                      CUIT:{" "}
                      <span className="text-gray-900 dark:text-white font-mono">
                        {selectedCompany.cuit}
                      </span>
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {selectedCompany.sector && (
                        <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-400 text-sm">
                          <Tag className="h-3 w-3 mr-1" />
                          {selectedCompany.sector.nombre}
                        </Badge>
                      )}
                      <Badge
                        className={`text-sm ${
                          (selectedCompany.email_confirmado ??
                          selectedCompany.email_confirmardo ??
                          false)
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400"
                            : "bg-amber-100 text-amber-800 dark:bg-amber-950/30 dark:text-amber-400"
                        }`}
                      >
                        {(selectedCompany.email_confirmado ??
                        selectedCompany.email_confirmardo ??
                        false) ? (
                          <MailCheck className="h-3 w-3 mr-1" />
                        ) : (
                          <MailX className="h-3 w-3 mr-1" />
                        )}
                        {(selectedCompany.email_confirmado ??
                        selectedCompany.email_confirmardo ??
                        false)
                          ? "Email validado"
                          : "Email sin validar"}
                      </Badge>
                      <Badge
                        className={`text-sm ${
                          selectedCompany.aprobada
                            ? "bg-green-100 text-green-800 dark:bg-[#68A243]/30 dark:text-[#68A243]"
                            : "bg-amber-100 text-amber-800 dark:bg-amber-950/30 dark:text-amber-400"
                        }`}
                      >
                        <CheckCircle className="h-3 w-3 mr-1" />
                        {selectedCompany.aprobada ? "Aprobada" : "Pendiente"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contenido en Grid */}
              <div className="p-8 overflow-y-auto max-h-[calc(95vh-200px)]">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Columna Izquierda - Contacto y Ubicación */}
                  <div className="space-y-6">
                    {/* Información de Contacto */}
                    <div>
                      <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                        <Phone className="h-4 w-4 text-[#68A243]" />
                        Contacto
                      </h3>
                      <div className="bg-gray-50 dark:bg-[#0f2f25]/50 p-4 rounded-lg space-y-2">
                        <div>
                          <p className="text-xs font-semibold uppercase text-gray-600 dark:text-gray-400 mb-1">
                            Email
                          </p>
                          <div className="flex items-center gap-2 flex-wrap">
                            {selectedCompany.email ? (
                              <a
                                href={`mailto:${selectedCompany.email}`}
                                className="text-sm text-[#68A243] hover:text-[#5a9038] font-medium break-all"
                              >
                                {selectedCompany.email}
                              </a>
                            ) : (
                              <p className="text-sm text-gray-900 dark:text-white font-medium">
                                Sin email
                              </p>
                            )}
                            <Badge
                              className={
                                (selectedCompany.email_confirmado ??
                                selectedCompany.email_confirmardo ??
                                false)
                                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400"
                                  : "bg-amber-100 text-amber-800 dark:bg-amber-950/30 dark:text-amber-400"
                              }
                            >
                              {(selectedCompany.email_confirmado ??
                              selectedCompany.email_confirmardo ??
                              false)
                                ? "Validado"
                                : "Sin validar"}
                            </Badge>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs font-semibold uppercase text-gray-600 dark:text-gray-400 mb-1">
                            Teléfono
                          </p>
                          <p className="text-sm text-gray-900 dark:text-white font-medium">
                            {selectedCompany.telefono_contacto}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Ubicación */}
                    <div>
                      <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-[#68A243]" />
                        Ubicación
                      </h3>
                      <div className="bg-gray-50 dark:bg-[#0f2f25]/50 p-4 rounded-lg space-y-2">
                        <div>
                          <p className="text-xs font-semibold uppercase text-gray-600 dark:text-gray-400 mb-1">
                            Dirección
                          </p>
                          <p className="text-sm text-gray-900 dark:text-white">
                            {selectedCompany.direccion}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold uppercase text-gray-600 dark:text-gray-400 mb-1">
                            Localidad
                          </p>
                          <p className="text-sm text-gray-900 dark:text-white">
                            {selectedCompany.localidad.nombre},{" "}
                            {selectedCompany.localidad.provincia.nombre}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Información Adicional - Compacta */}
                    <div>
                      <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3">
                        Información
                      </h3>
                      <div className="bg-gray-50 dark:bg-[#0f2f25]/50 p-4 rounded-lg space-y-2 text-xs">
                        <div>
                          <p className="font-semibold uppercase text-gray-600 dark:text-gray-400 mb-1">
                            Fecha
                          </p>
                          <p className="text-gray-900 dark:text-white">
                            {selectedCompany.fecha_registro
                              ? new Date(
                                  selectedCompany.fecha_registro,
                                ).toLocaleDateString("es-AR")
                              : "N/A"}
                          </p>
                        </div>
                        <div>
                          <p className="font-semibold uppercase text-gray-600 dark:text-gray-400 mb-1">
                            Estado
                          </p>
                          <p className="text-gray-900 dark:text-white">
                            {selectedCompany.eliminado ? "Eliminada" : "Activa"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Columna Derecha - Descripción */}
                  {selectedCompany.descripcion && (
                    <div>
                      <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                        <FileText className="h-4 w-4 text-[#68A243]" />
                        Descripción
                      </h3>
                      <div className="bg-gray-50 dark:bg-[#0f2f25]/50 p-4 rounded-lg border-l-4 border-[#68A243]">
                        <p className="text-sm text-gray-900 dark:text-white leading-relaxed">
                          {selectedCompany.descripcion}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
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

      {/* Approve Confirmation Modal */}
      <Dialog open={isApproveOpen} onOpenChange={setIsApproveOpen}>
        <DialogContent className="border-gray-200 dark:border-[#68A243]/20 bg-white dark:bg-[#143E29] max-w-md">
          <DialogHeader>
            <DialogTitle className="text-gray-900 dark:text-white">
              {companyToApprove?.aprobada
                ? "Confirmar desaprobación"
                : "Confirmar aprobación"}
            </DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              {companyToApprove?.aprobada ? (
                <>
                  ¿Estás seguro de que deseas desaprobar a{" "}
                  <span className="font-bold text-gray-900 dark:text-white">
                    {companyToApprove?.razon_social}
                  </span>
                  ? Su información dejará de ser pública.
                </>
              ) : (
                <>
                  ¿Estás seguro de que deseas aprobar a{" "}
                  <span className="font-bold text-gray-900 dark:text-white">
                    {companyToApprove?.razon_social}
                  </span>
                  ? Su información aparecerá pública en la lista de empresas.
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-3">
            <Button
              variant="outline"
              onClick={() => setIsApproveOpen(false)}
              className="border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-[#68A243]/40 dark:text-[#68A243] dark:hover:bg-[#68A243]/10"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConfirmApprove}
              className={`text-white ${
                companyToApprove?.aprobada
                  ? "bg-amber-500 hover:bg-amber-600"
                  : "bg-[#68A243] hover:bg-[#5a9038]"
              }`}
            >
              {companyToApprove?.aprobada ? "Desaprobar" : "Aprobar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
