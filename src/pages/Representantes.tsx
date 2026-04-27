import { useEffect, useState, useCallback } from "react";
import Navbar from "../components/Navbar";
import Footer from "../layout/Footer";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Skeleton } from "../components/ui/skeleton";
import { Dialog, DialogTrigger } from "../components/ui/dialog";
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
} from "lucide-react";
import {
  getRepresentantes,
  createRepresentante,
  deleteRepresentante,
} from "../api/RepresentanteService";
import { getCargos } from "../api/CargoService";
import type {
  RepresentanteResponse,
  RepresentanteWrite,
} from "../types/Representante";
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
  const [ownRepresentantes, setOwnRepresentantes] = useState<
    RepresentanteResponse[]
  >([]);
  const [cargos, setCargos] = useState<GenericType[]>([]);
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

  const fetchRepresentantes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      // Si es superadmin, obtener todos los representantes
      const params = user?.is_superuser ? { all: true } : {};
      const data = await getRepresentantes(params);

      if (user?.is_superuser && user?.empresa_id) {
        // Separar entre propios y otros
        const own = data.filter((rep) => rep.empresa_id === user.empresa_id);
        const others = data.filter((rep) => rep.empresa_id !== user.empresa_id);
        setOwnRepresentantes(own);
        setRepresentantes(others);
      } else {
        setRepresentantes(data);
      }
    } catch {
      setError("No se pudieron cargar los representantes. Intentá de nuevo.");
    } finally {
      setLoading(false);
    }
  }, [user?.is_superuser, user?.empresa_id]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [repsData, cargosData] = await Promise.all([
          getRepresentantes(user?.is_superuser ? { all: true } : {}),
          getCargos(),
        ]);
        setCargos(cargosData);

        if (user?.is_superuser && user?.empresa_id) {
          const own = repsData.filter(
            (rep) => rep.empresa_id === user.empresa_id,
          );
          const others = repsData.filter(
            (rep) => rep.empresa_id !== user.empresa_id,
          );
          setOwnRepresentantes(own);
          setRepresentantes(others);
        } else {
          setRepresentantes(repsData);
        }
        setLoading(false);
      } catch {
        setError("No se pudieron cargar los representantes. Intentá de nuevo.");
        setLoading(false);
      }
    };

    loadData();
  }, [user?.is_superuser, user?.empresa_id]);

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
      let nuevo = await createRepresentante(form);

      // Asegurar que el cargo sea un objeto completo {id, nombre}
      if (nuevo.cargo && typeof nuevo.cargo === "number") {
        const cargoCompleto = cargos.find((c) => c.id === nuevo.cargo);
        nuevo = { ...nuevo, cargo: cargoCompleto as any };
      } else if (
        !nuevo.cargo ||
        (typeof nuevo.cargo === "object" && !nuevo.cargo.nombre)
      ) {
        // Si cargo no tiene nombre, buscar en la lista de cargos por ID
        const cargoCompleto = cargos.find((c) => c.id === form.cargo);
        nuevo = { ...nuevo, cargo: cargoCompleto as any };
      }

      // Actualizar la lista correctamente
      if (user?.is_superuser && user?.empresa_id) {
        if (nuevo.empresa_id === user.empresa_id) {
          setOwnRepresentantes((prev) => [...prev, nuevo]);
        } else {
          setRepresentantes((prev) => [...prev, nuevo]);
        }
      } else {
        setRepresentantes((prev) => [...prev, nuevo]);
      }
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
    setRepToDelete(rep);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!repToDelete) return;
    setDeleting(true);
    try {
      await deleteRepresentante(repToDelete.id);

      // Actualizar la lista correctamente
      if (user?.is_superuser && user?.empresa_id) {
        if (repToDelete.empresa_id === user.empresa_id) {
          setOwnRepresentantes((prev) =>
            prev.filter((r) => r.id !== repToDelete.id),
          );
        } else {
          setRepresentantes((prev) =>
            prev.filter((r) => r.id !== repToDelete.id),
          );
        }
      } else {
        setRepresentantes((prev) =>
          prev.filter((r) => r.id !== repToDelete.id),
        );
      }

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
                  {user?.is_superuser ? (
                    <div className="flex gap-6">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 text-sm mb-2">
                          <Users className="h-4 w-4 text-[#ffb900]" />
                          <span className="font-semibold">Propios</span>
                        </div>
                        <p className="text-2xl font-bold">
                          {ownRepresentantes.length}
                        </p>
                      </div>
                      <div className="flex-1 border-l border-white/20 pl-6">
                        <div className="flex items-center gap-2 text-sm mb-2">
                          <Users className="h-4 w-4 text-[#68A243]" />
                          <span className="font-semibold">Total</span>
                        </div>
                        <p className="text-2xl font-bold">
                          {ownRepresentantes.length + representantes.length}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-2 text-sm mb-1">
                        <Users className="h-4 w-4 text-[#68A243]" />
                        <span className="font-semibold">Total</span>
                      </div>
                      <p className="text-3xl font-bold">
                        {representantes.length}
                      </p>
                    </>
                  )}
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
          ) : user?.is_superuser ? (
            <>
              {/* Vista Superadmin: Mis Representantes */}
              <div className="mb-8">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-[#143E29] dark:text-white flex items-center gap-2">
                    <Badge className="bg-[#ffb900] text-black">
                      {ownRepresentantes.length}
                    </Badge>
                    Mis Representantes
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mt-1 transition-colors duration-300">
                    Representantes de {user?.razon_social || "tu empresa"}
                  </p>
                </div>
                {ownRepresentantes.length === 0 ? (
                  <Card className="text-center py-8 border-2 border-dashed border-[#ffb900]/30 dark:bg-[#143E29]/30 dark:border-[#ffb900]/20 transition-colors duration-300">
                    <CardHeader>
                      <div className="flex justify-center mb-2">
                        <Users className="h-10 w-10 text-gray-300" />
                      </div>
                      <CardTitle className="text-gray-500 text-base">
                        Sin representantes propios
                      </CardTitle>
                    </CardHeader>
                  </Card>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {ownRepresentantes.map((rep, i) => (
                      <Card
                        key={i}
                        className="relative group hover:shadow-md transition-shadow border-2 border-[#ffb900]/20 dark:bg-[#143E29]/40 dark:border-[#ffb900]/30 dark:hover:shadow-lg dark:hover:shadow-[#ffb900]/10"
                      >
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(rep)}
                          className="absolute top-3 right-3 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity h-8 w-8 lg:w-auto p-0 lg:px-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950/30 gap-1"
                          title="Eliminar representante"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="hidden lg:inline text-xs">
                            Eliminar
                          </span>
                        </Button>
                        <CardHeader className="pb-3">
                          <div className="flex items-start gap-3">
                            <div className="bg-[#ffb900]/20 dark:bg-[#ffb900]/20 rounded-full p-2 shrink-0">
                              <User className="h-5 w-5 text-[#ffb900]" />
                            </div>
                            <div className="flex-1">
                              <CardTitle className="text-base text-[#143E29] dark:text-white">
                                {rep.nombre} {rep.apellido}
                              </CardTitle>
                              <Badge
                                variant="secondary"
                                className="text-xs mt-0.5 dark:bg-[#ffb900]/20 dark:text-[#ffb900]"
                              >
                                {rep.cargo?.nombre || "Sin cargo"}
                              </Badge>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-[#68A243] shrink-0" />
                            <span className="truncate">{rep.email}</span>
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

              {/* Vista Superadmin: Todos los Representantes */}
              <div>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-[#143E29] dark:text-white flex items-center gap-2">
                    <Badge className="bg-[#68A243]">
                      {representantes.length}
                    </Badge>
                    Todos los Representantes
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mt-1 transition-colors duration-300">
                    Representantes de otras empresas
                  </p>
                </div>
                {representantes.length === 0 ? (
                  <Card className="text-center py-8 border-2 border-dashed border-gray-300 dark:bg-[#143E29]/30 dark:border-gray-600/30 transition-colors duration-300">
                    <CardHeader>
                      <div className="flex justify-center mb-2">
                        <Users className="h-10 w-10 text-gray-300" />
                      </div>
                      <CardTitle className="text-gray-500 dark:text-gray-400 text-base">
                        Sin otros representantes
                      </CardTitle>
                    </CardHeader>
                  </Card>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {representantes.map((rep, i) => (
                      <Card
                        key={i}
                        className="relative group hover:shadow-md transition-shadow border-2 hover:border-[#68A243]/30 dark:bg-[#143E29]/40 dark:border-gray-700/50 dark:hover:border-[#68A243]/30 dark:hover:shadow-lg dark:hover:shadow-[#68A243]/10"
                      >
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(rep)}
                          className="absolute top-3 right-3 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity h-8 w-8 lg:w-auto p-0 lg:px-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950/30 gap-1"
                          title="Eliminar representante"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="hidden lg:inline text-xs">
                            Eliminar
                          </span>
                        </Button>
                        <CardHeader className="pb-3">
                          <div className="flex items-start gap-3">
                            <div className="bg-[#143E29]/10 dark:bg-[#68A243]/20 rounded-full p-2 shrink-0">
                              <User className="h-5 w-5 text-[#143E29] dark:text-[#68A243]" />
                            </div>
                            <div className="flex-1">
                              <CardTitle className="text-base text-[#143E29] dark:text-white">
                                {rep.nombre} {rep.apellido}
                              </CardTitle>
                              <Badge
                                variant="outline"
                                className="text-xs mt-0.5 dark:text-gray-300 dark:border-[#68A243]/30"
                              >
                                <Building2 className="h-3 w-3 mr-1" />
                                {rep.empresa_nombre || "Sin empresa"}
                              </Badge>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-[#68A243] shrink-0" />
                            <span className="truncate">{rep.email}</span>
                          </div>
                          {rep.telefono && (
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4 text-[#68A243] shrink-0" />
                              <span>{rep.telefono}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <Briefcase className="h-4 w-4 text-[#68A243] shrink-0" />
                            <span>{rep.cargo?.nombre || "Sin cargo"}</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : representantes.length === 0 ? (
            <Card className="text-center py-12 dark:bg-[#143E29]/40 dark:border-gray-700/50 transition-colors duration-300">
              <CardHeader>
                <div className="flex justify-center mb-2">
                  <Users className="h-12 w-12 text-gray-300" />
                </div>
                <CardTitle className="text-gray-500 dark:text-gray-400 transition-colors duration-300">
                  Sin representantes
                </CardTitle>
                <CardDescription className="dark:text-gray-500">
                  Todavía no hay representantes registrados para tu empresa.
                </CardDescription>
              </CardHeader>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {representantes.map((rep, i) => (
                <Card
                  key={i}
                  className="relative group hover:shadow-md transition-shadow border-2 hover:border-[#68A243]/30 dark:bg-[#143E29]/40 dark:border-gray-700/50 dark:hover:border-[#68A243]/30 dark:hover:shadow-lg dark:hover:shadow-[#68A243]/10"
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(rep)}
                    className="absolute top-3 right-3 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity h-8 w-8 lg:w-auto p-0 lg:px-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950/30 gap-1"
                    title="Eliminar representante"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="hidden lg:inline text-xs">Eliminar</span>
                  </Button>
                  <CardHeader className="pb-3">
                    <div className="flex items-start gap-3">
                      <div className="bg-[#143E29]/10 dark:bg-[#68A243]/20 rounded-full p-2 shrink-0">
                        <User className="h-5 w-5 text-[#143E29] dark:text-[#68A243]" />
                      </div>
                      <div>
                        <CardTitle className="text-base text-[#143E29] dark:text-white">
                          {rep.nombre} {rep.apellido}
                        </CardTitle>
                        <Badge
                          variant="secondary"
                          className="text-xs mt-0.5 dark:bg-[#1a5032] dark:text-[#68A243]"
                        >
                          {rep.cargo?.nombre || "Sin cargo"}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-[#68A243] shrink-0" />
                      <span className="truncate">{rep.email}</span>
                    </div>
                    {rep.telefono && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-[#68A243] shrink-0" />
                        <span>{rep.telefono}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-[#68A243] shrink-0" />
                      <span>{rep.cargo?.nombre || "Sin cargo"}</span>
                    </div>
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

      <Footer />
    </>
  );
}
