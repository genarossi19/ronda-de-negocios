import { useEffect, useState, useCallback } from "react";
import Navbar from "../components/Navbar";
import Footer from "../layout/Footer";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Skeleton } from "../components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import { Label } from "../components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/ui/alert-dialog";
import { AddRepresentativeModal } from "../components/AddRepresentativeModal";
import {
  Users,
  Plus,
  Mail,
  Phone,
  Briefcase,
  AlertCircle,
  User,
  Building2,
  Trash2,
  X,
  Search,
  Pencil,
} from "lucide-react";
import {
  getRepresentantes,
  createRepresentante,
  deleteRepresentante,
  editRepresentante,
} from "../api/RepresentanteService";
import { getCargos } from "../api/CargoService";
import { getCompanies } from "../api/EmpresaService";
import type {
  RepresentanteResponse,
  RepresentanteWrite,
} from "../types/Representante";
import type { EmpresaResponse } from "../types/Empresa";
import type { GenericType } from "../types/GenericType";
import { useCurrentUser } from "../hooks/useCurrentUser";
import { toast } from "sonner";

const EMPTY_FORM: RepresentanteWrite = {
  nombre: "",
  apellido: "",
  email: "",
  cargo: 0,
};

export default function Representantes() {
  const { user } = useCurrentUser();
  const [representantes, setRepresentantes] = useState<RepresentanteResponse[]>(
    [],
  );
  const [cargos, setCargos] = useState<GenericType[]>([]);
  const [empresas, setEmpresas] = useState<EmpresaResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<RepresentanteWrite>(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState<Partial<RepresentanteWrite>>({});
  const [submitting, setSubmitting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [repToDelete, setRepToDelete] = useState<RepresentanteResponse | null>(
    null,
  );
  const [deleting, setDeleting] = useState(false);
  const [searchName, setSearchName] = useState("");
  const [selectedCargos, setSelectedCargos] = useState<number[]>([]);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [repToEdit, setRepToEdit] = useState<RepresentanteResponse | null>(
    null,
  );
  const [editForm, setEditForm] =
    useState<Partial<RepresentanteWrite>>(EMPTY_FORM);
  const [editFormErrors, setEditFormErrors] = useState<
    Partial<RepresentanteWrite>
  >({});
  const [editSubmitting, setEditSubmitting] = useState(false);

  const fetchRepresentantes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      // Obtener todos los representantes si es superadmin, sino los de su empresa
      const params = user?.is_superuser ? { all: true } : {};
      const data = await getRepresentantes(params);
      setRepresentantes(data);
    } catch {
      setError("No se pudieron cargar los representantes. Intentá de nuevo.");
    } finally {
      setLoading(false);
    }
  }, [user?.is_superuser]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [repsData, cargosData, empresasData] = await Promise.all([
          getRepresentantes(user?.is_superuser ? { all: true } : {}),
          getCargos(),
          getCompanies(),
        ]);
        setCargos(cargosData);
        setEmpresas(empresasData);

        // Mapear representantes con empresa_nombre
        const repsWithEmpresa = repsData.map((rep) => {
          const empresa = empresasData.find(
            (e: EmpresaResponse) => e.id === (rep.empresa || rep.empresa_id),
          );
          return {
            ...rep,
            empresa_id: rep.empresa || rep.empresa_id,
            empresa_nombre: rep.empresa_nombre || empresa?.razon_social,
          };
        });

        setRepresentantes(repsWithEmpresa);
        setLoading(false);
      } catch {
        setError("No se pudieron cargar los representantes. Intentá de nuevo.");
        setLoading(false);
      }
    };

    loadData();
  }, [user?.is_superuser]);

  const validate = (): boolean => {
    const errors: Partial<RepresentanteWrite> = {};
    if (!form.nombre.trim()) errors.nombre = "El nombre es requerido";
    if (!form.apellido.trim()) errors.apellido = "El apellido es requerido";
    if (!form.email.trim()) errors.email = "El email es requerido";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errors.email = "El email no es válido";
    if (!form.cargo) errors.cargo = 0;
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      await createRepresentante(form);

      // Refrescar la lista desde el servidor para asegurar sincronización correcta
      const params = user?.is_superuser ? { all: true } : {};
      const repsData = await getRepresentantes(params);
      const repsWithEmpresa = repsData.map((rep) => {
        const empresa = empresas.find(
          (e: EmpresaResponse) => e.id === (rep.empresa || rep.empresa_id),
        );
        return {
          ...rep,
          empresa_id: rep.empresa || rep.empresa_id,
          empresa_nombre: rep.empresa_nombre || empresa?.razon_social,
        };
      });

      setRepresentantes(repsWithEmpresa);
      toast.success("Representante agregado correctamente.");
      setDialogOpen(false);
      setForm(EMPTY_FORM);
      setFormErrors({});
    } catch {
      toast.error("No se pudo agregar el representante. Intentá de nuevo.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "cargo" ? Number(value) : value,
    }));
    setFormErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleDelete = async (rep: RepresentanteResponse) => {
    if (!rep.id) {
      toast.error("Error: El representante no tiene un ID válido.");
      return;
    }
    setRepToDelete(rep);
    setDeleteDialogOpen(true);
  };

  const handleEdit = (rep: RepresentanteResponse) => {
    setRepToEdit(rep);
    setEditForm({
      nombre: rep.nombre,
      apellido: rep.apellido,
      email: rep.email,
      cargo: typeof rep.cargo === "number" ? rep.cargo : rep.cargo?.id || 0,
    });
    setEditFormErrors({});
    setEditDialogOpen(true);
  };

  const handleEditChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: name === "cargo" ? Number(value) : value,
    }));
    setEditFormErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const validateEditForm = (): boolean => {
    const errors: Partial<RepresentanteWrite> = {};
    if (!editForm.nombre?.trim()) errors.nombre = "El nombre es requerido";
    if (!editForm.cargo) errors.cargo = 0;
    setEditFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!repToEdit || !validateEditForm()) return;
    setEditSubmitting(true);
    try {
      const payloadToSend = {
        nombre: editForm.nombre,
        cargo: editForm.cargo,
      };
      await editRepresentante(repToEdit.id, payloadToSend);

      // Refrescar la lista desde el servidor para asegurar sincronización completa
      const params = user?.is_superuser ? { all: true } : {};
      const repsData = await getRepresentantes(params);
      const repsWithEmpresa = repsData.map((rep) => {
        const empresa = empresas.find(
          (e: EmpresaResponse) => e.id === (rep.empresa || rep.empresa_id),
        );
        return {
          ...rep,
          empresa_id: rep.empresa || rep.empresa_id,
          empresa_nombre: rep.empresa_nombre || empresa?.razon_social,
        };
      });
      setRepresentantes(repsWithEmpresa);

      toast.success("Representante actualizado correctamente.");
      setEditDialogOpen(false);
      setRepToEdit(null);
      setEditForm(EMPTY_FORM);
      setEditFormErrors({});
    } catch {
      toast.error("No se pudo actualizar el representante. Intentá de nuevo.");
    } finally {
      setEditSubmitting(false);
    }
  };

  const filterRepresentantes = (reps: RepresentanteResponse[]) => {
    return reps.filter((rep) => {
      const matchesName =
        searchName === "" ||
        `${rep.nombre} ${rep.apellido}`
          .toLowerCase()
          .includes(searchName.toLowerCase());
      const matchesCargo =
        selectedCargos.length === 0 ||
        selectedCargos.includes(
          typeof rep.cargo === "number" ? rep.cargo : rep.cargo?.id || 0,
        );
      return matchesName && matchesCargo;
    });
  };

  const addCargoFilter = (cargoId: number) => {
    if (!selectedCargos.includes(cargoId) && selectedCargos.length < 3) {
      setSelectedCargos([...selectedCargos, cargoId]);
    }
  };

  const removeCargoFilter = (cargoId: number) => {
    setSelectedCargos(selectedCargos.filter((id) => id !== cargoId));
  };

  const clearFilters = () => {
    setSearchName("");
    setSelectedCargos([]);
  };

  const filteredRepresentantes = filterRepresentantes(representantes);

  const confirmDelete = async () => {
    if (!repToDelete || !repToDelete.id) {
      toast.error("Error: No se pudo identificar el representante a eliminar.");
      setDeleteDialogOpen(false);
      return;
    }

    setDeleting(true);
    try {
      await deleteRepresentante(repToDelete.id);

      // Refrescar la lista desde el servidor para asegurar sincronización correcta
      const params = user?.is_superuser ? { all: true } : {};
      const repsData = await getRepresentantes(params);
      const repsWithEmpresa = repsData.map((rep) => {
        const empresa = empresas.find(
          (e: EmpresaResponse) => e.id === (rep.empresa || rep.empresa_id),
        );
        return {
          ...rep,
          empresa_id: rep.empresa || rep.empresa_id,
          empresa_nombre: rep.empresa_nombre || empresa?.razon_social,
        };
      });

      setRepresentantes(repsWithEmpresa);
      toast.success("Representante eliminado correctamente.");
      setDeleteDialogOpen(false);
      setRepToDelete(null);
    } catch {
      toast.error("No se pudo eliminar el representante. Intentá de nuevo.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 dark:bg-[#0a1a15] pt-8 pb-4 transition-colors duration-300">
        {/* Header */}
        <div className="bg-gradient-to-br from-[#143E29] to-[#143E29]/90 dark:from-[#0a1a15] dark:to-[#143E29] text-white py-12 transition-colors duration-300">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold mb-2 dark:text-white">
                  Representantes
                </h1>
                <p className="text-gray-200 dark:text-gray-300 text-lg transition-colors duration-300">
                  {user?.is_superuser
                    ? "Gestión de representantes de todas las empresas"
                    : user?.razon_social
                      ? `Gestión de representantes de ${user.razon_social}`
                      : "Gestión de representantes de tu empresa"}
                </p>
              </div>
              <div className="hidden md:block">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                  <div className="flex items-center gap-2 text-sm mb-1">
                    <Users className="h-4 w-4 text-[#68A243]" />
                    <span className="font-semibold">Total</span>
                  </div>
                  <p className="text-3xl font-bold">
                    {filteredRepresentantes.length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {/* Toolbar */}
          <div className="flex justify-end mb-6">
            <Dialog
              open={dialogOpen}
              onOpenChange={(open) => {
                setDialogOpen(open);
                if (!open) {
                  setForm(EMPTY_FORM);
                  setFormErrors({});
                }
              }}
            >
              <DialogTrigger asChild>
                <Button className="bg-[#68A243] hover:bg-[#68A243]/90 text-white gap-2">
                  <Plus className="h-4 w-4" />
                  Agregar representante
                </Button>
              </DialogTrigger>
              <AddRepresentativeModal
                open={dialogOpen}
                onOpenChange={(open) => {
                  setDialogOpen(open);
                  if (!open) {
                    setForm(EMPTY_FORM);
                    setFormErrors({});
                  }
                }}
                form={form}
                formErrors={formErrors}
                submitting={submitting}
                onChange={handleChange}
                onSubmit={handleSubmit}
                cargos={cargos}
              />
            </Dialog>
          </div>

          {/* Filters */}
          <div className="mb-8 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
              {/* Search by name */}
              <div className="w-full sm:flex-1 sm:max-w-2xl">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Buscar por nombre
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                  <Input
                    type="text"
                    placeholder="Ej: Juan García"
                    value={searchName}
                    onChange={(e) => setSearchName(e.target.value)}
                    className="pl-10 bg-white dark:bg-[#143E29] border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus-visible:ring-[#68A243]/50 dark:focus-visible:ring-[#68A243]/50"
                  />
                </div>
              </div>

              {/* Filter by cargo */}
              <div className="w-full sm:w-auto">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Filtrar por cargo
                </label>
                <Select
                  value=""
                  onValueChange={(cargoId) => {
                    addCargoFilter(Number(cargoId));
                  }}
                  disabled={selectedCargos.length >= 3}
                >
                  <SelectTrigger className="w-full sm:w-[240px] bg-white dark:bg-[#143E29] border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white hover:border-gray-400 dark:hover:border-[#68A243]/50 dark:hover:bg-[#1a4d35] transition-colors focus:ring-[#68A243]/50 dark:focus:ring-[#68A243]/50">
                    <SelectValue placeholder="Seleccionar cargo" />
                  </SelectTrigger>
                  <SelectContent>
                    {cargos.map((cargo) => (
                      <SelectItem
                        key={cargo.id}
                        value={String(cargo.id)}
                        disabled={selectedCargos.includes(cargo.id)}
                      >
                        {cargo.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Clear filters button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className={`text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 gap-2 transition-all ${
                  searchName || selectedCargos.length > 0
                    ? "visible opacity-100"
                    : "invisible opacity-0"
                }`}
              >
                <X className="h-4 w-4" />
                Limpiar filtros
              </Button>
            </div>

            {/* Selected cargo badges */}
            <div
              className={`flex flex-wrap gap-2 items-center min-h-10 transition-all ${
                selectedCargos.length > 0
                  ? "visible opacity-100"
                  : "invisible opacity-0"
              }`}
            >
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Cargos seleccionados:
              </span>
              {selectedCargos.map((cargoId) => {
                const cargo = cargos.find((c) => c.id === cargoId);
                return (
                  <Badge
                    key={cargoId}
                    variant="secondary"
                    className="bg-[#68A243]/20 text-[#68A243] dark:bg-[#68A243]/30 dark:text-[#68A243] flex items-center gap-2 pl-2.5"
                  >
                    {cargo?.nombre}
                    <button
                      onClick={() => removeCargoFilter(cargoId)}
                      className="hover:opacity-70 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                );
              })}
            </div>
          </div>

          {/* List */}
          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <Card key={i}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="space-y-1 flex-1">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-3/4" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : error ? (
            <Card className="border-destructive/50 bg-destructive/5">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-6 w-6 text-destructive" />
                  <CardTitle className="text-destructive">
                    Error al cargar
                  </CardTitle>
                </div>
                <CardDescription>{error}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  variant="outline"
                  onClick={fetchRepresentantes}
                  className="border-destructive/50 text-destructive hover:bg-destructive/10"
                >
                  Reintentar
                </Button>
              </CardContent>
            </Card>
          ) : filteredRepresentantes.length === 0 ? (
            <Card className="text-center py-12 dark:bg-[#143E29]/40 dark:border-gray-700/50 transition-colors duration-300">
              <CardHeader>
                <div className="flex justify-center mb-2">
                  <Users className="h-12 w-12 text-gray-300" />
                </div>
                <CardTitle className="text-gray-500 dark:text-gray-400 transition-colors duration-300">
                  {searchName || selectedCargos.length > 0
                    ? "No se encontraron representantes"
                    : "Sin representantes"}
                </CardTitle>
                <CardDescription className="dark:text-gray-500">
                  {searchName || selectedCargos.length > 0
                    ? "Intenta con otros filtros"
                    : user?.is_superuser
                      ? "No hay representantes disponibles"
                      : "Todavía no hay representantes registrados para tu empresa."}
                </CardDescription>
              </CardHeader>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredRepresentantes.map((rep, i) => (
                <Card
                  key={i}
                  className="relative group hover:shadow-md transition-shadow border-2 hover:border-[#68A243]/30 dark:bg-[#143E29]/40 dark:border-gray-700/50 dark:hover:border-[#68A243]/30 dark:hover:shadow-lg dark:hover:shadow-[#68A243]/10"
                >
                  <div className="absolute top-3 right-3 flex gap-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(rep)}
                      className="h-8 w-8 lg:w-auto p-0 lg:px-2 text-[#68A243] hover:text-[#5a9038] hover:bg-[#68A243]/10 dark:text-[#9FD27B] dark:hover:text-[#68A243] dark:hover:bg-[#68A243]/20 gap-1 transition-colors"
                      title="Editar representante"
                    >
                      <Pencil className="h-4 w-4" />
                      <span className="hidden lg:inline text-xs">Editar</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(rep)}
                      className="h-8 w-8 lg:w-auto p-0 lg:px-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950/30 gap-1"
                      title="Eliminar representante"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="hidden lg:inline text-xs">Eliminar</span>
                    </Button>
                  </div>
                  <CardHeader className="pb-3">
                    <div className="flex items-start gap-3">
                      <div className="bg-[#143E29]/10 dark:bg-[#68A243]/20 rounded-full p-2 shrink-0">
                        <User className="h-5 w-5 text-[#143E29] dark:text-[#68A243]" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-base text-[#143E29] dark:text-white">
                          {rep.nombre} {rep.apellido}
                        </CardTitle>
                        {user?.is_superuser && (
                          <Badge
                            variant="outline"
                            className="text-xs mt-0.5 dark:text-gray-300 dark:border-[#68A243]/30"
                          >
                            <Building2 className="h-3 w-3 mr-1" />
                            {rep.empresa_nombre || "Sin empresa"}
                          </Badge>
                        )}
                        {!user?.is_superuser && (
                          <Badge
                            variant="secondary"
                            className="text-xs mt-0.5 dark:bg-[#1a5032] dark:text-[#68A243]"
                          >
                            {typeof rep.cargo === "number"
                              ? "Sin cargo"
                              : rep.cargo?.nombre || "Sin cargo"}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-[#68A243] shrink-0" />
                      <span className="truncate">{rep.email}</span>
                      {!rep.email_confirmado && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <AlertCircle className="h-4 w-4 text-orange-500 dark:text-orange-400 shrink-0 cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent>Email sin confirmar</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                    {rep.telefono && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-[#68A243] shrink-0" />
                        <span>{rep.telefono}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="dark:bg-[#0F141A] dark:border-gray-700/50">
          <AlertDialogHeader>
            <AlertDialogTitle className="dark:text-white">
              Eliminar representante
            </AlertDialogTitle>
            <AlertDialogDescription className="dark:text-gray-300">
              ¿Estás seguro de que deseas eliminar a{" "}
              <span className="font-semibold dark:text-white">
                {repToDelete?.nombre} {repToDelete?.apellido}
              </span>
              ? Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-2 justify-end">
            <AlertDialogCancel className="dark:bg-[#143E29] dark:border-gray-700/50 dark:text-white dark:hover:bg-[#1a3f30]">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700 disabled:opacity-50"
            >
              {deleting ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog
        open={editDialogOpen}
        onOpenChange={(open) => {
          setEditDialogOpen(open);
          if (!open) {
            setRepToEdit(null);
            setEditForm(EMPTY_FORM);
            setEditFormErrors({});
          }
        }}
      >
        <DialogContent className="sm:max-w-md bg-white dark:bg-[#0F141A] text-foreground dark:text-white border-[#669649] dark:border-[#1a5032]">
          <DialogHeader>
            <DialogTitle className="text-[#143E29] dark:text-white transition-colors duration-300">
              Editar representante
            </DialogTitle>
            <DialogDescription className="dark:text-gray-300 transition-colors duration-300">
              Solo se puede editar el nombre y cargo.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            {/* Información de solo lectura */}
            <div className="space-y-3 rounded-lg bg-gray-100 dark:bg-[#143E29]/60 p-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-600 dark:text-gray-400 mb-1">
                    Apellido
                  </p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {repToEdit?.apellido}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-600 dark:text-gray-400 mb-1">
                    Email
                  </p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white break-all">
                    {repToEdit?.email}
                  </p>
                </div>
              </div>
              {user?.is_superuser && repToEdit?.empresa_nombre && (
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-600 dark:text-gray-400 mb-1">
                    Empresa
                  </p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {repToEdit.empresa_nombre}
                  </p>
                </div>
              )}
            </div>

            {/* Campos editables */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label
                  htmlFor="edit-nombre"
                  className="text-[#143E29] dark:text-white transition-colors duration-300"
                >
                  Nombre
                </Label>
                <Input
                  id="edit-nombre"
                  name="nombre"
                  value={editForm.nombre}
                  onChange={handleEditChange}
                  placeholder="Juan"
                  className={`${
                    editFormErrors.nombre ? "border-red-500" : ""
                  } dark:bg-[#0f2f25] dark:border-[#68A243]/20 dark:text-white dark:placeholder-gray-500 dark:focus:!border-[#68A243] transition-colors duration-300`}
                  aria-invalid={!!editFormErrors.nombre}
                />
                {editFormErrors.nombre && (
                  <p className="text-red-600 text-xs">
                    {editFormErrors.nombre}
                  </p>
                )}
              </div>
              <div className="space-y-1">
                <Label
                  htmlFor="edit-cargo"
                  className="text-[#143E29] dark:text-white transition-colors duration-300"
                >
                  Cargo
                </Label>
                <Select
                  value={editForm.cargo?.toString() || "0"}
                  onValueChange={(value) => {
                    setEditForm((prev) => ({
                      ...prev,
                      cargo: Number(value),
                    }));
                    setEditFormErrors((prev) => ({
                      ...prev,
                      cargo: undefined,
                    }));
                  }}
                >
                  <SelectTrigger
                    className={`${
                      editFormErrors.cargo ? "border-red-500" : ""
                    } dark:bg-[#0f2f25] dark:border-[#68A243]/20 dark:text-white dark:focus:!border-[#68A243] transition-colors duration-300`}
                    aria-invalid={!!editFormErrors.cargo}
                  >
                    <SelectValue placeholder="Seleccionar cargo" />
                  </SelectTrigger>
                  <SelectContent>
                    {cargos.map((cargo) => (
                      <SelectItem key={cargo.id} value={String(cargo.id)}>
                        {cargo.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {editFormErrors.cargo ? (
                  <p className="text-red-600 text-xs">El cargo es requerido</p>
                ) : null}
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={editSubmitting}
                className="bg-[#68A243] hover:bg-[#68A243]/90 text-white"
              >
                {editSubmitting ? "Guardando..." : "Guardar cambios"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal anterior a eliminar */}

      <Footer />
    </>
  );
}
