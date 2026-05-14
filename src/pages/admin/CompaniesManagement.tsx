import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router";
import { AnimatePresence, motion } from "motion/react";
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
  Mail,
  Loader2,
  Download,
  Users,
  // RotateCcw,
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
  // recoverCompany,
} from "../../api/EmpresaService";
import type { EmpresaResponse } from "../../types/Empresa";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import { useMotionContext } from "../../context/MotionPreferencesContext";
import { getApiErrorMessage, isSessionExpiredError } from "../../lib/axios";

function CompanyRow({
  company,
  onApprove,
  onDelete,
  // onRecover,
  onView,
  isSelected,
  onSelect,
  isSelectionMode,
  animatingAction,
}: {
  company: EmpresaResponse;
  onApprove: (c: EmpresaResponse) => void;
  onDelete: (c: EmpresaResponse) => void;
  // onRecover: (c: EmpresaResponse) => void;
  onView: (c: EmpresaResponse) => void;
  isSelected?: boolean;
  onSelect?: (c: EmpresaResponse) => void;
  isSelectionMode?: boolean;
  animatingAction?: "approved" | "unapproved" | "deleted" | null;
}) {
  const emailConfirmado = company.email_confirmardo ?? false;
  const { shouldReduceMotion } = useMotionContext();

  // Helpers para transiciones que respeten shouldReduceMotion
  const getInstantTransition = () =>
    shouldReduceMotion ? { duration: 0 } : { duration: 0.12 };
  const getQuickTransition = () =>
    shouldReduceMotion ? { duration: 0 } : { duration: 0.2 };
  const getSpringTransition = () =>
    shouldReduceMotion
      ? { duration: 0 }
      : { duration: 0.3, type: "spring" as const, stiffness: 200 };

  const handleCardClick = () => {
    onSelect?.(company);
  };

  const handleEmailClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (company.email) {
      navigator.clipboard.writeText(company.email);
      toast.success("Email copiado al portapapeles");
    }
  };

  return (
    <motion.div
      onClick={handleCardClick}
      initial={false}
      animate={{
        scale: animatingAction === "deleted" ? 0.95 : isSelected ? 0.98 : 1,
        borderColor:
          animatingAction === "approved"
            ? "#68A243"
            : isSelected
              ? "#68A243"
              : "#e5e7eb",
        backgroundColor:
          animatingAction === "approved"
            ? "rgba(104, 162, 67, 0.15)"
            : animatingAction === "deleted"
              ? "rgba(239, 68, 68, 0.08)"
              : isSelected
                ? "rgba(104, 162, 67, 0.05)"
                : "transparent",
        opacity: animatingAction === "deleted" ? 0.6 : 1,
      }}
      transition={{
        duration: shouldReduceMotion ? 0 : animatingAction ? 0.4 : 0.2,
        type: "spring",
        stiffness: animatingAction ? 150 : 100,
      }}
      className={`relative bg-white dark:bg-[#143E29] rounded-lg border-2 p-4 transition-all cursor-pointer ${
        isSelected
          ? "border-[#68A243] bg-[#68A243]/5 dark:bg-[#68A243]/10"
          : "border-gray-200 dark:border-[#68A243]/20 hover:border-[#68A243]/50"
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Checkbox */}
        <AnimatePresence>
          {isSelectionMode && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={getInstantTransition()}
              className="flex-shrink-0 w-5 h-5 cursor-pointer"
              onClick={(e) => e.stopPropagation()}
            >
              {isSelected ? (
                <motion.div
                  initial={{ scale: 0.8, rotate: -90 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={getSpringTransition()}
                  className="w-5 h-5 bg-[#68A243] rounded-md flex items-center justify-center"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={
                      shouldReduceMotion
                        ? { duration: 0 }
                        : { duration: 0.2, delay: 0.1 }
                    }
                  >
                    <CheckCircle className="h-5 w-5 text-white" />
                  </motion.div>
                </motion.div>
              ) : (
                <div className="w-5 h-5 border-2 border-gray-300 dark:border-gray-500 rounded-md" />
              )}
            </motion.div>
          )}
        </AnimatePresence>

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
              {company.email && (
                <div
                  onClick={handleEmailClick}
                  className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 truncate cursor-pointer hover:text-[#68A243] dark:hover:text-[#9FD27B] transition-colors"
                  title="Haz clic para copiar el email"
                >
                  <Mail className="h-3 w-3 flex-shrink-0" />
                  <span className="truncate">{company.email}</span>
                </div>
              )}
              {company.sector && (
                <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-300 truncate mt-1">
                  <Tag className="h-3 w-3 flex-shrink-0" />
                  <span className="truncate">{company.sector.nombre}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Status & Sector */}
        <div className="flex flex-wrap gap-2 sm:justify-end">
          <Badge
            className={
              emailConfirmado
                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400"
                : "bg-amber-100 text-amber-800 dark:bg-amber-950/30 dark:text-amber-400"
            }
          >
            {emailConfirmado ? (
              <MailCheck className="mr-1 h-3 w-3" />
            ) : (
              <MailX className="mr-1 h-3 w-3" />
            )}
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
            {company.eliminado ? (
              <XCircle className="mr-1 h-3 w-3" />
            ) : company.aprobada ? (
              <CheckCircle className="mr-1 h-3 w-3" />
            ) : (
              <Clock className="mr-1 h-3 w-3" />
            )}
            {company.eliminado
              ? "Eliminada"
              : company.aprobada
                ? "Aprobada"
                : "Pendiente"}
          </Badge>
        </div>

        {/* Actions */}
        {!isSelectionMode && !company.eliminado && (
          <div
            className="flex gap-2 sm:justify-end"
            onClick={(e) => e.stopPropagation()}
          >
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
              onClick={(e) => {
                e.stopPropagation();
                onView(company);
              }}
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
        )}

        {/* Actions for deleted companies */}
        {!isSelectionMode && company.eliminado && (
          <div
            className="flex gap-2 sm:justify-end"
            onClick={(e) => e.stopPropagation()}
          >
            {/* <Button
              size="sm"
              onClick={() => onRecover(company)}
              className="gap-2 bg-orange-500 hover:bg-orange-600 text-white dark:bg-orange-600 dark:hover:bg-orange-700"
            >
              <RotateCcw className="h-4 w-4" />
              Recuperar
            </Button> */}

            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                onView(company);
              }}
              className="border-gray-300 text-gray-700 hover:bg-gray-100 hover:text-gray-700 dark:border-[#68A243]/40 dark:text-[#68A243] dark:hover:bg-[#68A243]/10"
            >
              <Eye className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Eye button when in selection mode */}
        {isSelectionMode && !company.eliminado && (
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              onView(company);
            }}
            className="border-gray-300 text-gray-700 hover:bg-gray-100 hover:text-gray-700 dark:border-[#68A243]/40 dark:text-[#68A243] dark:hover:bg-[#68A243]/10"
          >
            <Eye className="h-4 w-4" />
          </Button>
        )}

        {/* Animation Overlay */}
        <AnimatePresence>
          {animatingAction === "approved" && !shouldReduceMotion && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={getQuickTransition()}
              className="absolute inset-0 rounded-lg bg-[#68A243]/5 flex items-center justify-center pointer-events-none"
            >
              <div className="flex flex-col items-center gap-3">
                {/* Círculo expandible */}
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{
                    duration: 0.35,
                    type: "spring",
                    stiffness: 120,
                    damping: 14,
                  }}
                  className="relative w-16 h-16"
                >
                  {/* Círculo de fondo */}
                  <motion.div
                    animate={shouldReduceMotion ? {} : { scale: [1, 1.1, 1] }}
                    transition={
                      shouldReduceMotion
                        ? { duration: 0 }
                        : { duration: 0.8, repeat: 1, repeatType: "loop" }
                    }
                    className="absolute inset-0 rounded-full bg-[#68A243]/20 border-2 border-[#68A243]"
                  />
                  {/* Checkmark */}
                  <motion.div
                    initial={{ rotate: -180, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    transition={
                      shouldReduceMotion
                        ? { duration: 0 }
                        : {
                            duration: 0.3,
                            delay: 0.1,
                            type: "spring",
                            stiffness: 160,
                          }
                    }
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <CheckCircle className="h-16 w-16 text-[#68A243]" />
                  </motion.div>
                </motion.div>
                {/* Texto */}
                <motion.span
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={
                    shouldReduceMotion
                      ? { duration: 0 }
                      : { duration: 0.25, delay: 0.2 }
                  }
                  className="text-sm font-bold text-[#68A243]"
                >
                  ¡Aprobada!
                </motion.span>
              </div>
            </motion.div>
          )}

          {animatingAction === "deleted" && !shouldReduceMotion && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={getQuickTransition()}
              className="absolute inset-0 rounded-lg bg-red-500/5 flex items-center justify-center pointer-events-none"
            >
              <div className="flex flex-col items-center gap-3">
                {/* Círculo expandible */}
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{
                    duration: 0.35,
                    type: "spring",
                    stiffness: 120,
                    damping: 14,
                  }}
                  className="relative w-16 h-16"
                >
                  {/* Círculo de fondo */}
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{
                      duration: 0.8,
                      repeat: 1,
                      repeatType: "loop",
                    }}
                    className="absolute inset-0 rounded-full bg-red-500/20 border-2 border-red-500"
                  />
                  {/* X Icon */}
                  <motion.div
                    initial={{ rotate: 180, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    transition={{
                      duration: 0.3,
                      delay: 0.1,
                      type: "spring",
                      stiffness: 160,
                    }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <XCircle className="h-16 w-16 text-red-500" />
                  </motion.div>
                </motion.div>
                {/* Texto */}
                <motion.span
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={
                    shouldReduceMotion
                      ? { duration: 0 }
                      : { duration: 0.25, delay: 0.2 }
                  }
                  className="text-sm font-bold text-red-600"
                >
                  Eliminada
                </motion.span>
              </div>
            </motion.div>
          )}

          {animatingAction === "unapproved" && !shouldReduceMotion && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={getQuickTransition()}
              className="absolute inset-0 rounded-lg bg-orange-500/5 flex items-center justify-center pointer-events-none"
            >
              <div className="flex flex-col items-center gap-3">
                {/* Círculo expandible */}
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{
                    duration: 0.35,
                    type: "spring",
                    stiffness: 120,
                    damping: 14,
                  }}
                  className="relative w-16 h-16"
                >
                  {/* Círculo de fondo */}
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{
                      duration: 0.8,
                      repeat: 1,
                      repeatType: "loop",
                    }}
                    className="absolute inset-0 rounded-full bg-orange-500/20 border-2 border-orange-500"
                  />
                  {/* X Icon */}
                  <motion.div
                    initial={{ rotate: 180, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    transition={{
                      duration: 0.3,
                      delay: 0.1,
                      type: "spring",
                      stiffness: 160,
                    }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <XCircle className="h-16 w-16 text-orange-600" />
                  </motion.div>
                </motion.div>
                {/* Texto */}
                <motion.span
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={
                    shouldReduceMotion
                      ? { duration: 0 }
                      : { duration: 0.25, delay: 0.2 }
                  }
                  className="text-sm font-bold text-orange-600"
                >
                  Desaprobada
                </motion.span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
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

function escapeCsvValue(value: string | number | boolean) {
  return `"${String(value).replace(/"/g, '""')}"`;
}

function downloadCsv(companies: EmpresaResponse[]) {
  const headers = [
    "Razón Social",
    "CUIT",
    "Email",
    "Sector",
    "Teléfono",
    "Ubicación",
    "Email Validado",
    "Estado",
  ];

  const currentDate = new Date().toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  const content = [
    `Fecha: ${currentDate}`,
    headers.map(escapeCsvValue).join(","),
    ...companies.map((company) => {
      const emailValidado = company.email_confirmardo ?? false;
      const estado = company.eliminado
        ? "Eliminada"
        : company.aprobada
          ? "Aprobada"
          : "Pendiente";

      return [
        company.razon_social,
        company.cuit || "",
        company.email || "",
        company.sector?.nombre || "",
        company.telefono_contacto || "",
        `${company.localidad?.nombre || ""}, ${company.localidad?.provincia?.nombre || ""}`,
        emailValidado ? "Sí" : "No",
        estado,
      ]
        .map(escapeCsvValue)
        .join(",");
    }),
  ].join("\n");

  const blob = new Blob([`\uFEFF${content}`], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `empresas-${currentDate.replace(/\//g, "-")}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
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
  const { shouldReduceMotion } = useMotionContext();
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
  // const [isRecoverOpen, setIsRecoverOpen] = useState(false);
  // const [companyToRecover, setCompanyToRecover] =
  //   useState<EmpresaResponse | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "pending" | "approved" | "deleted"
  >("all");
  const [selectedCompanies, setSelectedCompanies] = useState<Set<number>>(
    new Set(),
  );
  const [isBulkApproving, setIsBulkApproving] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [approveProgress, setApproveProgress] = useState(0);
  const [deleteProgress, setDeleteProgress] = useState(0);
  const [bulkResults, setBulkResults] = useState<{
    success: { name: string }[];
    failed: { name: string; error: string }[];
  } | null>(null);
  const [isResultsOpen, setIsResultsOpen] = useState(false);
  const [isFooterVisible, setIsFooterVisible] = useState(false);
  const footerRef = useRef<HTMLDivElement | null>(null);
  const [animatingCompanies, setAnimatingCompanies] = useState<
    Map<number, "approved" | "unapproved" | "deleted">
  >(new Map());
  const [isApproving, setIsApproving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  // const [isRecovering, setIsRecovering] = useState(false);

  // isSelectionMode is computed based on selectedCompanies
  const isSelectionMode = selectedCompanies.size > 0;

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

  // Detectar si el footer es visible en el viewport
  useEffect(() => {
    if (!footerRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsFooterVisible(entry.isIntersecting);
      },
      { threshold: 0.1 },
    );

    observer.observe(footerRef.current);
    return () => observer.disconnect();
  }, []);

  const pendingCompanies = companies.filter((c) => !c.aprobada);
  const approvedCompanies = companies.filter((c) => c.aprobada);

  const filteredCompanies = useMemo(() => {
    return companies
      .filter((company) => {
        const matchesSearch =
          company.razon_social
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
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
  }, [companies, filterStatus, searchTerm]);

  // Deseleccionar empresas que ya no son visibles cuando cambia el filtro o búsqueda
  useEffect(() => {
    const visibleIds = new Set(filteredCompanies.map((c) => c.id));
    const newSelected = new Set(
      Array.from(selectedCompanies).filter((id) => visibleIds.has(id)),
    );
    if (newSelected.size !== selectedCompanies.size) {
      setSelectedCompanies(newSelected);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredCompanies]);

  const handleApproveClick = (company: EmpresaResponse) => {
    setCompanyToApprove(company);
    setIsApproveOpen(true);
  };

  const handleConfirmApprove = async () => {
    if (companyToApprove) {
      const nuevoEstado = !companyToApprove.aprobada;

      setIsApproving(true);
      try {
        await approveCompany(companyToApprove.id, nuevoEstado);

        // Agregar animación (approved si nuevoEstado es true, unapproved si es false)
        setAnimatingCompanies((prev) =>
          new Map(prev).set(
            companyToApprove.id,
            nuevoEstado ? "approved" : "unapproved",
          ),
        );

        // Esperar a que la animación termine completamente
        // Si shouldReduceMotion es true, el timeout es inmediato
        const animationDuration = shouldReduceMotion ? 0 : 1300;
        const exitDuration = shouldReduceMotion ? 0 : 350;

        setTimeout(() => {
          // Limpiar animación primero para que desaparezca
          setAnimatingCompanies((prev) => {
            const newMap = new Map(prev);
            newMap.delete(companyToApprove.id);
            return newMap;
          });

          // Esperar a que la animación de salida (exit) termine
          setTimeout(() => {
            // Actualizar UI después de que la animación haya desaparecido
            setCompanies(
              companies.map((c) =>
                c.id === companyToApprove.id
                  ? { ...c, aprobada: nuevoEstado }
                  : c,
              ),
            );
          }, exitDuration);
        }, animationDuration);

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
      } finally {
        setIsApproving(false);
      }
    }
  };

  const handleDeleteClick = (company: EmpresaResponse) => {
    setCompanyToDelete(company);
    setIsDeleteOpen(true);
  };

  // const handleRecoverClick = (company: EmpresaResponse) => {
  //   setCompanyToRecover(company);
  //   setIsRecoverOpen(true);
  // };

  const handleConfirmDelete = async () => {
    if (companyToDelete) {
      setIsDeleting(true);
      try {
        await deleteCompany(companyToDelete.id);

        // Agregar animación
        setAnimatingCompanies((prev) =>
          new Map(prev).set(companyToDelete.id, "deleted"),
        );

        // Esperar a que la animación termine completamente
        // Si shouldReduceMotion es true, el timeout es inmediato
        const animationDuration = shouldReduceMotion ? 0 : 1300;
        const exitDuration = shouldReduceMotion ? 0 : 350;

        setTimeout(() => {
          // Limpiar animación primero para que desaparezca
          setAnimatingCompanies((prev) => {
            const newMap = new Map(prev);
            newMap.delete(companyToDelete.id);
            return newMap;
          });

          // Esperar a que la animación de salida (exit) termine
          setTimeout(() => {
            // Actualizar UI después de que la animación haya desaparecido
            setCompanies(
              companies.map((c) =>
                c.id === companyToDelete.id ? { ...c, eliminado: true } : c,
              ),
            );
          }, exitDuration);
        }, animationDuration);

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
      } finally {
        setIsDeleting(false);
      }
    }
  };

  // const handleConfirmRecover = async () => {
  //   if (companyToRecover) {
  //     setIsRecovering(true);
  //     try {
  //       await recoverCompany(companyToRecover.id);
  //
  //       // Agregar animación de recuperación (reutilizamos "approved" para el efecto visual)
  //       setAnimatingCompanies((prev) =>
  //         new Map(prev).set(companyToRecover.id, "approved"),
  //       );
  //
  //       // Esperar a que la animación termine completamente
  //       const animationDuration = shouldReduceMotion ? 0 : 1300;
  //       const exitDuration = shouldReduceMotion ? 0 : 350;
  //
  //       setTimeout(() => {
  //         // Limpiar animación primero para que desaparezca
  //         setAnimatingCompanies((prev) => {
  //           const newMap = new Map(prev);
  //           newMap.delete(companyToRecover.id);
  //           return newMap;
  //         });
  //
  //         // Esperar a que la animación de salida (exit) termine
  //         setTimeout(() => {
  //           // Actualizar UI después de que la animación haya desaparecido
  //           setCompanies(
  //             companies.map((c) =>
  //               c.id === companyToRecover.id ? { ...c, eliminado: false } : c,
  //             ),
  //           );
  //         }, exitDuration);
  //       }, animationDuration);
  //
  //       toast.success(
  //         `${companyToRecover.razon_social} ha sido recuperada correctamente`,
  //       );
  //
  //       setIsRecoverOpen(false);
  //       setCompanyToRecover(null);
  //     } catch (err) {
  //       const errorMessage = getApiErrorMessage(
  //         err,
  //         "Ha ocurrido un error. Intenta de nuevo más tarde",
  //       );
  //       if (errorMessage) {
  //         toast.error(errorMessage);
  //       }
  //
  //       console.error("Error recovering company:", err);
  //     } finally {
  //       setIsRecovering(false);
  //     }
  //   }
  // };

  const handleViewDetail = (company: EmpresaResponse) => {
    setSelectedCompany(company);
    setIsDetailOpen(true);
  };

  const handleSelectCompany = (company: EmpresaResponse) => {
    const newSelected = new Set(selectedCompanies);
    if (newSelected.has(company.id)) {
      newSelected.delete(company.id);
    } else {
      newSelected.add(company.id);
    }
    setSelectedCompanies(newSelected);
  };

  const handleCancelSelection = () => {
    setSelectedCompanies(new Set());
  };

  const handleSelectAll = () => {
    if (selectedCompanies.size === filteredCompanies.length) {
      // Si todas están seleccionadas, deseleccionar todas
      setSelectedCompanies(new Set());
    } else {
      // Si no están todas seleccionadas, seleccionar todas
      const allIds = new Set(filteredCompanies.map((c) => c.id));
      setSelectedCompanies(allIds);
    }
  };

  // Verificar si todas las seleccionadas son desaprobadas (aprobada: false)
  const canApprove =
    selectedCompanies.size > 0 &&
    Array.from(selectedCompanies).every((id) => {
      const company = companies.find((c) => c.id === id);
      return company && !company.aprobada;
    });

  const processBulkAction = async (
    action: "approve" | "delete",
    state: boolean,
  ) => {
    const setLoading =
      action === "approve" ? setIsBulkApproving : setIsBulkDeleting;
    const setProgress =
      action === "approve" ? setApproveProgress : setDeleteProgress;

    setLoading(true);
    const selectedCompanyList = companies.filter((c) =>
      selectedCompanies.has(c.id),
    );

    let processed = 0;
    const results: {
      success: { name: string }[];
      failed: { name: string; error: string }[];
    } = { success: [], failed: [] };

    for (const company of selectedCompanyList) {
      try {
        if (action === "approve") {
          await approveCompany(company.id, state);
          setCompanies((prev) =>
            prev.map((c) =>
              c.id === company.id ? { ...c, aprobada: state } : c,
            ),
          );
          results.success.push({ name: company.razon_social });
        } else if (action === "delete") {
          await deleteCompany(company.id);
          setCompanies((prev) =>
            prev.map((c) =>
              c.id === company.id ? { ...c, eliminado: true } : c,
            ),
          );
          results.success.push({ name: company.razon_social });
        }
      } catch (err) {
        const errorMessage =
          getApiErrorMessage(err, "Error desconocido") || "Error desconocido";
        results.failed.push({
          name: company.razon_social,
          error: errorMessage,
        });
        console.error(`Error en ${action} para empresa ${company.id}:`, err);
      }

      processed++;
      setProgress(Math.round((processed / selectedCompanyList.length) * 100));
    }

    setLoading(false);
    setProgress(0);
    setSelectedCompanies(new Set());

    if (results.failed.length === 0) {
      toast.success(
        `${results.success.length} empresa(s) ${action === "approve" ? "procesada(s)" : "eliminada(s)"} correctamente`,
      );
    } else {
      setBulkResults(results);
      setIsResultsOpen(true);
    }
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

              <div className="flex items-center gap-2 flex-wrap">
                <Button
                  onClick={() => navigate("/representantes")}
                  variant="ghost"
                  className="h-10 px-4 text-white/80 hover:bg-white/10 hover:text-white font-medium gap-2"
                >
                  <Users className="h-4 w-4" />
                  Ver Representantes
                </Button>
                <Button
                  onClick={() => {
                    if (filteredCompanies.length === 0) {
                      toast.info(
                        "No hay empresas para descargar en el filtro actual",
                      );
                      return;
                    }
                    downloadCsv(filteredCompanies);
                    toast.success(
                      `Descargadas ${filteredCompanies.length} empresa(s)`,
                    );
                  }}
                  className="h-10 px-4 bg-white text-[#143E29] hover:bg-white/90 font-semibold gap-2"
                >
                  <Download className="h-4 w-4" />
                  Descargar CSV
                </Button>
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
            {/* Select All Checkbox */}
            <AnimatePresence>
              {isSelectionMode && filteredCompanies.length > 0 && (
                <motion.div
                  initial={
                    shouldReduceMotion
                      ? { opacity: 1, y: 0 }
                      : { opacity: 0, y: -8 }
                  }
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={
                    shouldReduceMotion ? { duration: 0 } : { duration: 0.15 }
                  }
                  className="mb-4 flex items-center gap-3 p-4 bg-white dark:bg-[#143E29] rounded-lg border-2 border-gray-200 dark:border-[#68A243]/20"
                >
                  <motion.div
                    onClick={handleSelectAll}
                    className="flex-shrink-0 w-5 h-5 cursor-pointer"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {selectedCompanies.size === filteredCompanies.length ? (
                      <motion.div
                        initial={{ scale: 0.8, rotate: -90 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{
                          duration: 0.3,
                          type: "spring",
                          stiffness: 200,
                        }}
                        className="w-5 h-5 bg-[#68A243] rounded-md flex items-center justify-center"
                      >
                        <CheckCircle className="h-5 w-5 text-white" />
                      </motion.div>
                    ) : (
                      <div className="w-5 h-5 border-2 border-gray-300 dark:border-gray-500 rounded-md" />
                    )}
                  </motion.div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Seleccionar todo ({filteredCompanies.length})
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
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
                  // onRecover={handleRecoverClick}
                  onView={handleViewDetail}
                  isSelected={selectedCompanies.has(company.id)}
                  onSelect={handleSelectCompany}
                  isSelectionMode={isSelectionMode}
                  animatingAction={animatingCompanies.get(company.id)}
                />
              ))
            )}
          </div>
        </div>
      </main>

      {/* Selection Bar + Footer Wrapper */}
      <div className={`flex flex-col ${isFooterVisible ? "relative" : ""}`}>
        {/* Selection Mode Action Bar */}
        <AnimatePresence>
          {isSelectionMode && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={
                shouldReduceMotion ? { duration: 0 } : { duration: 0.12 }
              }
              className={`${
                isFooterVisible ? "absolute" : "fixed"
              } left-0 right-0 bg-white dark:bg-[#143E29] border-t-2 border-[#68A243] p-4 shadow-lg z-40`}
              style={{
                bottom: "0px",
              }}
            >
              <div className="max-w-7xl mx-auto flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {selectedCompanies.size} seleccionada
                    {selectedCompanies.size !== 1 ? "s" : ""}
                  </span>
                  {isBulkApproving && (
                    <div className="flex items-center gap-2">
                      <div className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#68A243] transition-all duration-300"
                          style={{ width: `${approveProgress}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        {approveProgress}%
                      </span>
                    </div>
                  )}
                  {isBulkDeleting && (
                    <div className="flex items-center gap-2">
                      <div className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-red-500 transition-all duration-300"
                          style={{ width: `${deleteProgress}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        {deleteProgress}%
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleCancelSelection}
                    disabled={isBulkApproving || isBulkDeleting}
                    variant="ghost"
                    className="border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-[#68A243]/40 dark:text-[#68A243] dark:hover:bg-[#68A243]/10"
                  >
                    Cancelar
                  </Button>

                  <Button
                    onClick={() => processBulkAction("approve", true)}
                    disabled={isBulkApproving || isBulkDeleting || !canApprove}
                    className="gap-2 bg-[#68A243] hover:bg-[#5a9038] text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isBulkApproving ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                        >
                          <Loader2 className="h-4 w-4" />
                        </motion.div>
                        Aprobando...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4" />
                        Aprobar
                      </>
                    )}
                  </Button>

                  <Button
                    onClick={() => processBulkAction("delete", false)}
                    disabled={isBulkApproving || isBulkDeleting}
                    className="gap-2 bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isBulkDeleting ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                        >
                          <Loader2 className="h-4 w-4" />
                        </motion.div>
                        Eliminando...
                      </>
                    ) : (
                      <>
                        <Trash2 className="h-4 w-4" />
                        Eliminar
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={footerRef} className={isFooterVisible ? "" : ""}>
          <Footer />
        </div>
      </div>

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
                        <Badge className="bg-green-100 text-green-800 dark:bg-[#68A243]/20 dark:text-[#68A243] text-sm">
                          <Tag className="h-3 w-3 mr-1" />
                          {selectedCompany.sector.nombre}
                        </Badge>
                      )}
                      <Badge
                        className={`text-sm ${
                          (selectedCompany.email_confirmardo ?? false)
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400"
                            : "bg-amber-100 text-amber-800 dark:bg-amber-950/30 dark:text-amber-400"
                        }`}
                      >
                        {(selectedCompany.email_confirmardo ?? false) ? (
                          <MailCheck className="h-3 w-3 mr-1" />
                        ) : (
                          <MailX className="h-3 w-3 mr-1" />
                        )}
                        {(selectedCompany.email_confirmardo ?? false)
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
                                (selectedCompany.email_confirmardo ?? false)
                                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400"
                                  : "bg-amber-100 text-amber-800 dark:bg-amber-950/30 dark:text-amber-400"
                              }
                            >
                              {(selectedCompany.email_confirmardo ?? false)
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
      <Dialog
        open={isDeleteOpen}
        onOpenChange={(open) => !isDeleting && setIsDeleteOpen(open)}
      >
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
              disabled={isDeleting}
              className="border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-50 dark:border-[#68A243]/40 dark:text-[#68A243] dark:hover:bg-[#68A243]/10"
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white disabled:bg-red-600 disabled:opacity-75"
            >
              {isDeleting ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="inline-block mr-2"
                  >
                    <Loader2 className="h-4 w-4" />
                  </motion.div>
                  Eliminando...
                </>
              ) : (
                <>Eliminar</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approve Confirmation Modal */}
      <Dialog
        open={isApproveOpen}
        onOpenChange={(open) => !isApproving && setIsApproveOpen(open)}
      >
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
              disabled={isApproving}
              className="border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-50 dark:border-[#68A243]/40 dark:text-[#68A243] dark:hover:bg-[#68A243]/10"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConfirmApprove}
              disabled={isApproving}
              className={`text-white ${
                companyToApprove?.aprobada
                  ? "bg-amber-500 hover:bg-amber-600 disabled:bg-amber-500 disabled:opacity-75"
                  : "bg-[#68A243] hover:bg-[#5a9038] disabled:bg-[#68A243] disabled:opacity-75"
              }`}
            >
              {isApproving ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="inline-block mr-2"
                  >
                    <Loader2 className="h-4 w-4" />
                  </motion.div>
                  {companyToApprove?.aprobada
                    ? "Desaprobando..."
                    : "Aprobando..."}
                </>
              ) : (
                <>{companyToApprove?.aprobada ? "Desaprobar" : "Aprobar"}</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Recover Confirmation Modal - DESACTIVADO: Pendiente de implementación */}
      {/*
      <Dialog
        open={isRecoverOpen}
        onOpenChange={(open) => !isRecovering && setIsRecoverOpen(open)}
      >
        <DialogContent className="border-gray-200 dark:border-[#68A243]/20 bg-white dark:bg-[#143E29] max-w-md">
          <DialogHeader>
            <DialogTitle className="text-gray-900 dark:text-white">
              Confirmar recuperación
            </DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              ¿Estás seguro de que deseas recuperar{" "}
              <span className="font-bold text-gray-900 dark:text-white">
                {companyToRecover?.razon_social}
              </span>
              ? La empresa volverá a estar disponible en el sistema.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-3">
            <Button
              variant="outline"
              onClick={() => setIsRecoverOpen(false)}
              disabled={isRecovering}
              className="border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-50 dark:border-[#68A243]/40 dark:text-[#68A243] dark:hover:bg-[#68A243]/10"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConfirmRecover}
              disabled={isRecovering}
              className="bg-orange-500 hover:bg-orange-600 text-white disabled:bg-orange-500 disabled:opacity-75 dark:bg-orange-600 dark:hover:bg-orange-700"
            >
              {isRecovering ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="inline-block mr-2"
                  >
                    <Loader2 className="h-4 w-4" />
                  </motion.div>
                  Recuperando...
                </>
              ) : (
                <>Recuperar</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      */}

      {/* Bulk Results Modal */}
      <Dialog open={isResultsOpen} onOpenChange={setIsResultsOpen}>
        <DialogContent className="border-gray-200 dark:border-[#68A243]/20 bg-white dark:bg-[#143E29] max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="text-gray-900 dark:text-white">
              Resultados del procesamiento
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 overflow-y-auto max-h-[60vh]">
            {/* Success Section */}
            {bulkResults?.success && bulkResults.success.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  <h3 className="font-semibold text-emerald-600 dark:text-emerald-400">
                    Exitosas ({bulkResults.success.length})
                  </h3>
                </div>
                <div className="bg-emerald-50 dark:bg-emerald-950/20 rounded-lg p-3 space-y-2">
                  {bulkResults.success.map((item, idx) => (
                    <div
                      key={idx}
                      className="text-sm text-emerald-900 dark:text-emerald-200 flex items-start gap-2"
                    >
                      <span className="text-emerald-600 dark:text-emerald-400 mt-0.5">
                        ✓
                      </span>
                      <span>{item.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Failed Section */}
            {bulkResults?.failed && bulkResults.failed.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                  <h3 className="font-semibold text-red-600 dark:text-red-400">
                    Fallidas ({bulkResults.failed.length})
                  </h3>
                </div>
                <div className="bg-red-50 dark:bg-red-950/20 rounded-lg p-3 space-y-3">
                  {bulkResults.failed.map((item, idx) => (
                    <div
                      key={idx}
                      className="border-b border-red-200 dark:border-red-900/30 pb-2 last:border-b-0 last:pb-0"
                    >
                      <p className="text-sm font-medium text-red-900 dark:text-red-200">
                        {item.name}
                      </p>
                      <p className="text-xs text-red-700 dark:text-red-300 mt-1">
                        {item.error}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              onClick={() => setIsResultsOpen(false)}
              className="bg-[#68A243] hover:bg-[#5a9038] text-white"
            >
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
