import { useState, useEffect, useCallback } from "react";
import { Pencil, Trash2, Plus, Check, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import Navbar from "../../components/Navbar";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../../components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import { useNavigate } from "react-router";
import {
  getCargos,
  createCargo,
  updateCargo,
  deleteCargo,
} from "../../api/CargoService";
import {
  getSectors,
  createSector,
  updateSector,
  deleteSector,
} from "../../api/SectorService";
import {
  getLocalidades,
  createLocalidad,
  updateLocalidad,
  deleteLocalidad,
} from "../../api/LocalidadesService";
import {
  getProvincias,
  createProvincia,
  updateProvincia,
  deleteProvincia,
} from "../../api/ProvinciaService";
import type { GenericType } from "../../types/GenericType";
import type { LocalidadResponse } from "../../types/Localidad";

// ─── Generic CRUD Tab ────────────────────────────────────────────────────────

interface GenericTabProps {
  title: string;
  items: GenericType[];
  loading: boolean;
  onAdd: (nombre: string) => Promise<void>;
  onEdit: (id: number, nombre: string) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

function GenericTab({
  title,
  items,
  loading,
  onAdd,
  onEdit,
  onDelete,
}: GenericTabProps) {
  const singularTitle = title.toLowerCase().slice(0, -1);
  const [newNombre, setNewNombre] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingNombre, setEditingNombre] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleAdd = async () => {
    const trimmed = newNombre.trim();
    if (!trimmed) return;
    setSubmitting(true);
    await onAdd(trimmed);
    setNewNombre("");
    setSubmitting(false);
  };

  const handleEdit = async (id: number) => {
    const trimmed = editingNombre.trim();
    if (!trimmed) return;
    setSubmitting(true);
    await onEdit(id, trimmed);
    setEditingId(null);
    setEditingNombre("");
    setSubmitting(false);
  };

  const startEdit = (item: GenericType) => {
    setEditingId(item.id);
    setEditingNombre(item.nombre);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingNombre("");
  };

  return (
    <div className="space-y-4">
      {/* Formulario de agregar */}
      <div className="rounded-xl border border-dashed border-[#68A243]/35 bg-[#68A243]/5 p-4 dark:border-[#2f5f45] dark:bg-[#0f2419]">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-[#2f5f1f] dark:text-[#9FD27B]">
          Nuevo {singularTitle}
        </p>
        <div className="flex items-center gap-2">
          <Input
            placeholder={`Nombre del ${singularTitle}`}
            value={newNombre}
            onChange={(e) => setNewNombre(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            className="h-10 flex-1 border-gray-300 bg-white text-gray-900 placeholder:text-gray-500 dark:border-[#2f5f45] dark:bg-[#0f2419] dark:text-gray-100 dark:placeholder:text-[#b8c0ca]"
          />
          <Button
            onClick={handleAdd}
            disabled={!newNombre.trim() || submitting}
            size="sm"
            className="h-10 bg-[#68A243] hover:bg-[#5a9139] text-white gap-1.5 shrink-0"
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            Agregar
          </Button>
        </div>
      </div>

      {/* Tabla */}
      <div className="rounded-lg border border-gray-200 dark:border-[#2f5f45] overflow-hidden">
        <Table>
          <TableHeader className="dark:border-[#2f5f45]">
            <TableRow className="bg-gray-50 dark:bg-[#0f2419] dark:border-[#2f5f45]">
              <TableHead className="w-16 text-gray-600 dark:text-gray-300">
                #
              </TableHead>
              <TableHead className="text-gray-600 dark:text-gray-300">
                Nombre
              </TableHead>
              <TableHead className="w-28 text-right text-gray-600 dark:text-gray-300">
                Acciones
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={3}
                  className="text-center py-8 text-gray-500 dark:text-gray-300"
                >
                  <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={3}
                  className="text-center py-8 text-gray-500 dark:text-gray-300"
                >
                  No hay {title.toLowerCase()} cargados.
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => (
                <TableRow
                  key={item.id}
                  className="hover:bg-gray-50 dark:border-[#2f5f45]/70 dark:hover:bg-[#2f5f45]/15"
                >
                  <TableCell className="text-gray-500 dark:text-gray-300 text-sm">
                    {item.id}
                  </TableCell>
                  <TableCell>
                    {editingId === item.id ? (
                      <Input
                        value={editingNombre}
                        onChange={(e) => setEditingNombre(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleEdit(item.id);
                          if (e.key === "Escape") cancelEdit();
                        }}
                        className="h-8 text-sm"
                        autoFocus
                      />
                    ) : (
                      <span className="text-gray-900 dark:text-gray-100">
                        {item.nombre}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {editingId === item.id ? (
                        <>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-950/20"
                            onClick={() => handleEdit(item.id)}
                            disabled={submitting}
                          >
                            <Check className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                            onClick={cancelEdit}
                          >
                            <X className="h-3.5 w-3.5" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 text-gray-500 dark:text-gray-300 hover:text-[#68A243] dark:hover:text-[#9FD27B] hover:bg-[#68A243]/10 dark:hover:bg-[#68A243]/20"
                            onClick={() => startEdit(item)}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7 text-gray-500 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/20"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Eliminar {title.toLowerCase().slice(0, -1)}
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  ¿Estás seguro de que querés eliminar{" "}
                                  <strong>{item.nombre}</strong>? Esta acción no
                                  se puede deshacer.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-red-600 hover:bg-red-700 text-white"
                                  onClick={() => onDelete(item.id)}
                                >
                                  Eliminar
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// ─── Localidades Tab ─────────────────────────────────────────────────────────

interface LocalidadesTabProps {
  localidades: LocalidadResponse[];
  provincias: GenericType[];
  loading: boolean;
  loadingProvincias: boolean;
  onAdd: (nombre: string, provinciaId: number) => Promise<void>;
  onEdit: (id: number, nombre: string, provinciaId: number) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

function LocalidadesTab({
  localidades,
  provincias,
  loading,
  loadingProvincias,
  onAdd,
  onEdit,
  onDelete,
}: LocalidadesTabProps) {
  const [newNombre, setNewNombre] = useState("");
  const [newProvincia, setNewProvincia] = useState<string>("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingNombre, setEditingNombre] = useState("");
  const [editingProvincia, setEditingProvincia] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  const handleAdd = async () => {
    const trimmed = newNombre.trim();
    if (!trimmed || !newProvincia) return;
    setSubmitting(true);
    await onAdd(trimmed, Number(newProvincia));
    setNewNombre("");
    setNewProvincia("");
    setSubmitting(false);
  };

  const handleEdit = async (id: number) => {
    const trimmed = editingNombre.trim();
    if (!trimmed || !editingProvincia) return;
    setSubmitting(true);
    await onEdit(id, trimmed, Number(editingProvincia));
    setEditingId(null);
    setSubmitting(false);
  };

  const startEdit = (loc: LocalidadResponse) => {
    setEditingId(loc.id);
    setEditingNombre(loc.nombre);
    setEditingProvincia(String(loc.provincia.id));
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingNombre("");
    setEditingProvincia("");
  };

  return (
    <div className="space-y-4">
      {/* Formulario de agregar */}
      <div className="rounded-xl border border-dashed border-[#68A243]/35 bg-[#68A243]/5 p-4 dark:border-[#2f5f45] dark:bg-[#0f2419]">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-[#2f5f1f] dark:text-[#9FD27B]">
          Nueva localidad
        </p>
        <div className="flex items-center gap-2">
          <Input
            placeholder="Nombre de la localidad"
            value={newNombre}
            onChange={(e) => setNewNombre(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            className="h-10 flex-1 border-gray-300 bg-white text-gray-900 placeholder:text-gray-500 dark:border-[#2f5f45] dark:bg-[#0f2419] dark:text-gray-100 dark:placeholder:text-[#b8c0ca]"
          />
          <Select
            value={newProvincia}
            onValueChange={setNewProvincia}
            disabled={loadingProvincias}
          >
            <SelectTrigger className="h-10 w-48 shrink-0 border-gray-300 bg-white text-gray-900 dark:border-[#2f5f45] dark:bg-[#0f2419] dark:text-gray-100">
              <SelectValue
                placeholder={loadingProvincias ? "Cargando..." : "Provincia"}
              />
            </SelectTrigger>
            <SelectContent>
              {provincias.map((p) => (
                <SelectItem key={p.id} value={String(p.id)}>
                  {p.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            onClick={handleAdd}
            disabled={
              !newNombre.trim() ||
              !newProvincia ||
              submitting ||
              loadingProvincias
            }
            size="sm"
            className="h-10 bg-[#68A243] hover:bg-[#5a9139] text-white gap-1.5 shrink-0"
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            Agregar
          </Button>
        </div>
      </div>

      {/* Tabla */}
      <div className="rounded-lg border border-gray-200 dark:border-[#2f5f45] overflow-hidden">
        <Table>
          <TableHeader className="dark:border-[#2f5f45]">
            <TableRow className="bg-gray-50 dark:bg-[#0f2419] dark:border-[#2f5f45]">
              <TableHead className="w-16 text-gray-600 dark:text-gray-300">
                #
              </TableHead>
              <TableHead className="text-gray-600 dark:text-gray-300">
                Nombre
              </TableHead>
              <TableHead className="text-gray-600 dark:text-gray-300">
                Provincia
              </TableHead>
              <TableHead className="w-28 text-right text-gray-600 dark:text-gray-300">
                Acciones
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center py-8 text-gray-500 dark:text-gray-300"
                >
                  <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            ) : localidades.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center py-8 text-gray-500 dark:text-gray-300"
                >
                  No hay localidades cargadas.
                </TableCell>
              </TableRow>
            ) : (
              localidades.map((loc) => (
                <TableRow
                  key={loc.id}
                  className="hover:bg-gray-50 dark:border-[#2f5f45]/70 dark:hover:bg-[#2f5f45]/15"
                >
                  <TableCell className="text-gray-500 dark:text-gray-300 text-sm">
                    {loc.id}
                  </TableCell>
                  <TableCell>
                    {editingId === loc.id ? (
                      <Input
                        value={editingNombre}
                        onChange={(e) => setEditingNombre(e.target.value)}
                        onKeyDown={(e) => e.key === "Escape" && cancelEdit()}
                        className="h-8 text-sm"
                        autoFocus
                      />
                    ) : (
                      <span className="text-gray-900 dark:text-gray-100">
                        {loc.nombre}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {editingId === loc.id ? (
                      <Select
                        value={editingProvincia}
                        onValueChange={setEditingProvincia}
                      >
                        <SelectTrigger className="h-8 text-sm w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {provincias.map((p) => (
                            <SelectItem key={p.id} value={String(p.id)}>
                              {p.nombre}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <span className="text-gray-600 dark:text-gray-300 text-sm">
                        {loc.provincia.nombre}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {editingId === loc.id ? (
                        <>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-950/20"
                            onClick={() => handleEdit(loc.id)}
                            disabled={submitting}
                          >
                            <Check className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                            onClick={cancelEdit}
                          >
                            <X className="h-3.5 w-3.5" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 text-gray-500 dark:text-gray-300 hover:text-[#68A243] dark:hover:text-[#9FD27B] hover:bg-[#68A243]/10 dark:hover:bg-[#68A243]/20"
                            onClick={() => startEdit(loc)}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7 text-gray-500 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/20"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Eliminar localidad
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  ¿Estás seguro de que querés eliminar{" "}
                                  <strong>{loc.nombre}</strong>? Esta acción no
                                  se puede deshacer.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-red-600 hover:bg-red-700 text-white"
                                  onClick={() => onDelete(loc.id)}
                                >
                                  Eliminar
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function GestionarOtros() {
  const { user } = useCurrentUser();
  const navigate = useNavigate();

  const [cargos, setCargos] = useState<GenericType[]>([]);
  const [sectores, setSectores] = useState<GenericType[]>([]);
  const [localidades, setLocalidades] = useState<LocalidadResponse[]>([]);
  const [provincias, setProvincias] = useState<GenericType[]>([]);

  const [loadingCargos, setLoadingCargos] = useState(true);
  const [loadingSectores, setLoadingSectores] = useState(true);
  const [loadingLocalidades, setLoadingLocalidades] = useState(true);
  const [loadingProvincias, setLoadingProvincias] = useState(true);

  // Guard: solo admin
  useEffect(() => {
    if (user !== undefined && !user?.is_superuser) {
      navigate("/panel-administrador", { replace: true });
    }
  }, [user, navigate]);

  const fetchCargos = useCallback(async () => {
    try {
      const data = await getCargos();
      setCargos(data);
    } catch {
      toast.error("Error al cargar cargos");
    } finally {
      setLoadingCargos(false);
    }
  }, []);

  const fetchSectores = useCallback(async () => {
    try {
      const data = await getSectors();
      setSectores(data);
    } catch {
      toast.error("Error al cargar sectores");
    } finally {
      setLoadingSectores(false);
    }
  }, []);

  const fetchLocalidades = useCallback(async () => {
    try {
      const data = await getLocalidades();
      setLocalidades(data);
    } catch {
      toast.error("Error al cargar localidades");
    } finally {
      setLoadingLocalidades(false);
    }
  }, []);

  const fetchProvincias = useCallback(async () => {
    try {
      const data = await getProvincias();
      setProvincias(data);
    } catch {
      toast.error("Error al cargar provincias");
    } finally {
      setLoadingProvincias(false);
    }
  }, []);

  useEffect(() => {
    fetchCargos();
    fetchSectores();
    fetchLocalidades();
    fetchProvincias();
  }, [fetchCargos, fetchSectores, fetchLocalidades, fetchProvincias]);

  // ── Cargos handlers ──────────────────────────────────────────────────────
  const handleAddCargo = async (nombre: string) => {
    try {
      await createCargo({ id: 0, nombre });
      toast.success("Cargo creado correctamente");
      await fetchCargos();
    } catch {
      toast.error("Error al crear el cargo");
    }
  };

  const handleEditCargo = async (id: number, nombre: string) => {
    try {
      await updateCargo(id, { id, nombre });
      toast.success("Cargo actualizado correctamente");
      await fetchCargos();
    } catch {
      toast.error("Error al actualizar el cargo");
    }
  };

  const handleDeleteCargo = async (id: number) => {
    try {
      await deleteCargo(id);
      toast.success("Cargo eliminado correctamente");
      await fetchCargos();
    } catch {
      toast.error("Error al eliminar el cargo");
    }
  };

  // ── Sectores handlers ────────────────────────────────────────────────────
  const handleAddSector = async (nombre: string) => {
    try {
      await createSector({ id: 0, nombre });
      toast.success("Sector creado correctamente");
      await fetchSectores();
    } catch {
      toast.error("Error al crear el sector");
    }
  };

  const handleEditSector = async (id: number, nombre: string) => {
    try {
      await updateSector(id, { id, nombre });
      toast.success("Sector actualizado correctamente");
      await fetchSectores();
    } catch {
      toast.error("Error al actualizar el sector");
    }
  };

  const handleDeleteSector = async (id: number) => {
    try {
      await deleteSector(id);
      toast.success("Sector eliminado correctamente");
      await fetchSectores();
    } catch {
      toast.error("Error al eliminar el sector");
    }
  };

  // ── Localidades handlers ─────────────────────────────────────────────────
  const handleAddLocalidad = async (nombre: string, provinciaId: number) => {
    try {
      await createLocalidad({ nombre, provincia: provinciaId });
      toast.success("Localidad creada correctamente");
      await fetchLocalidades();
    } catch {
      toast.error("Error al crear la localidad");
    }
  };

  const handleEditLocalidad = async (
    id: number,
    nombre: string,
    provinciaId: number,
  ) => {
    try {
      await updateLocalidad(id, { nombre, provincia: provinciaId });
      toast.success("Localidad actualizada correctamente");
      await fetchLocalidades();
    } catch {
      toast.error("Error al actualizar la localidad");
    }
  };

  const handleDeleteLocalidad = async (id: number) => {
    try {
      await deleteLocalidad(id);
      toast.success("Localidad eliminada correctamente");
      await fetchLocalidades();
    } catch {
      toast.error("Error al eliminar la localidad");
    }
  };

  // ── Provincias handlers ──────────────────────────────────────────────────
  const handleAddProvincia = async (nombre: string) => {
    try {
      await createProvincia({ id: 0, nombre });
      toast.success("Provincia creada correctamente");
      await fetchProvincias();
    } catch {
      toast.error("Error al crear la provincia");
    }
  };

  const handleEditProvincia = async (id: number, nombre: string) => {
    try {
      await updateProvincia(id, { id, nombre });
      toast.success("Provincia actualizada correctamente");
      await fetchProvincias();
    } catch {
      toast.error("Error al actualizar la provincia");
    }
  };

  const handleDeleteProvincia = async (id: number) => {
    try {
      await deleteProvincia(id);
      toast.success("Provincia eliminada correctamente");
      await fetchProvincias();
    } catch {
      toast.error("Error al eliminar la provincia");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#081710] transition-colors duration-300">
      <Navbar />
      <div className="pt-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Gestión de elementos generales
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-300 mt-1">
              Administrá cargos, sectores, localidades y provincias del sistema.
            </p>
          </div>

          {/* Tabs */}
          <div className="bg-white dark:bg-[#0f2419] rounded-xl border border-gray-200 dark:border-[#2f5f45] shadow-sm p-6">
            <Tabs defaultValue="cargos">
              <TabsList className="mb-6 grid h-auto w-full grid-cols-4 rounded-xl bg-gray-100 p-1.5 dark:bg-[#0f2419]">
                <TabsTrigger
                  value="cargos"
                  className="rounded-lg py-2 data-[state=active]:bg-white data-[state=active]:text-[#143E29] dark:text-gray-200 dark:data-[state=active]:bg-[#143E29] dark:data-[state=active]:text-white"
                >
                  Cargos
                </TabsTrigger>
                <TabsTrigger
                  value="sectores"
                  className="rounded-lg py-2 data-[state=active]:bg-white data-[state=active]:text-[#143E29] dark:text-gray-200 dark:data-[state=active]:bg-[#143E29] dark:data-[state=active]:text-white"
                >
                  Sectores
                </TabsTrigger>
                <TabsTrigger
                  value="localidades"
                  className="rounded-lg py-2 data-[state=active]:bg-white data-[state=active]:text-[#143E29] dark:text-gray-200 dark:data-[state=active]:bg-[#143E29] dark:data-[state=active]:text-white"
                >
                  Localidades
                </TabsTrigger>
                <TabsTrigger
                  value="provincias"
                  className="rounded-lg py-2 data-[state=active]:bg-white data-[state=active]:text-[#143E29] dark:text-gray-200 dark:data-[state=active]:bg-[#143E29] dark:data-[state=active]:text-white"
                >
                  Provincias
                </TabsTrigger>
              </TabsList>

              <TabsContent value="cargos">
                <GenericTab
                  title="Cargos"
                  items={cargos}
                  loading={loadingCargos}
                  onAdd={handleAddCargo}
                  onEdit={handleEditCargo}
                  onDelete={handleDeleteCargo}
                />
              </TabsContent>

              <TabsContent value="sectores">
                <GenericTab
                  title="Sectores"
                  items={sectores}
                  loading={loadingSectores}
                  onAdd={handleAddSector}
                  onEdit={handleEditSector}
                  onDelete={handleDeleteSector}
                />
              </TabsContent>

              <TabsContent value="localidades">
                <LocalidadesTab
                  localidades={localidades}
                  provincias={provincias}
                  loading={loadingLocalidades}
                  loadingProvincias={loadingProvincias}
                  onAdd={handleAddLocalidad}
                  onEdit={handleEditLocalidad}
                  onDelete={handleDeleteLocalidad}
                />
              </TabsContent>

              <TabsContent value="provincias">
                <GenericTab
                  title="Provincias"
                  items={provincias}
                  loading={loadingProvincias}
                  onAdd={handleAddProvincia}
                  onEdit={handleEditProvincia}
                  onDelete={handleDeleteProvincia}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
