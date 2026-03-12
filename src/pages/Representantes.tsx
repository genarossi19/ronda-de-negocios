import { useEffect, useState } from "react";
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
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Badge } from "../components/ui/badge";
import { Skeleton } from "../components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import {
  Users,
  Plus,
  Mail,
  Phone,
  Briefcase,
  AlertCircle,
  User,
  Building2,
} from "lucide-react";
import {
  getRepresentantes,
  createRepresentante,
} from "../api/RepresentanteService";
import type {
  RepresentanteResponse,
  RepresentanteWrite,
} from "../types/Representante";
import { useCurrentUser } from "../hooks/useCurrentUser";
import { toast } from "sonner";

const CARGOS = [
  { id: 1, nombre: "Gerente" },
  { id: 2, nombre: "Director" },
  { id: 3, nombre: "Coordinador" },
  { id: 4, nombre: "Asesor" },
  { id: 5, nombre: "Otro" },
];

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<RepresentanteWrite>(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState<Partial<RepresentanteWrite>>({});
  const [submitting, setSubmitting] = useState(false);

  const fetchRepresentantes = async () => {
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
  };

  useEffect(() => {
    fetchRepresentantes();
  }, []);

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
      const nuevo = await createRepresentante(form);
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

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 pt-8 pb-4">
        {/* Header */}
        <div className="bg-gradient-to-br from-[#143E29] to-[#143E29]/90 text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold mb-2">Representantes</h1>
                <p className="text-gray-200 text-lg">
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
                    <>
                      <div className="flex items-center gap-2 text-sm mb-2">
                        <Users className="h-4 w-4 text-[#68A243]" />
                        <span className="font-semibold">Propios</span>
                      </div>
                      <p className="text-2xl font-bold mb-3">
                        {ownRepresentantes.length}
                      </p>
                      <div className="border-t border-white/20 pt-3">
                        <div className="flex items-center gap-2 text-sm mb-2">
                          <Users className="h-4 w-4 text-[#ffb900]" />
                          <span className="font-semibold">Total</span>
                        </div>
                        <p className="text-2xl font-bold">
                          {ownRepresentantes.length + representantes.length}
                        </p>
                      </div>
                    </>
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
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Nuevo representante</DialogTitle>
                  <DialogDescription>
                    Completá los datos del representante de tu empresa.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label htmlFor="nombre">Nombre</Label>
                      <Input
                        id="nombre"
                        name="nombre"
                        value={form.nombre}
                        onChange={handleChange}
                        placeholder="Juan"
                        aria-invalid={!!formErrors.nombre}
                      />
                      {formErrors.nombre && (
                        <p className="text-red-600 text-xs">
                          {formErrors.nombre}
                        </p>
                      )}
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="apellido">Apellido</Label>
                      <Input
                        id="apellido"
                        name="apellido"
                        value={form.apellido}
                        onChange={handleChange}
                        placeholder="Pérez"
                        aria-invalid={!!formErrors.apellido}
                      />
                      {formErrors.apellido && (
                        <p className="text-red-600 text-xs">
                          {formErrors.apellido}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="juan@empresa.com"
                      aria-invalid={!!formErrors.email}
                    />
                    {formErrors.email && (
                      <p className="text-red-600 text-xs">{formErrors.email}</p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="cargo">Cargo</Label>
                    <select
                      id="cargo"
                      name="cargo"
                      value={form.cargo}
                      onChange={handleChange}
                      className={`w-full h-9 rounded-md border bg-transparent px-3 py-1 text-sm transition-colors outline-none focus-visible:ring-[3px] ${
                        formErrors.cargo !== undefined && form.cargo === 0
                          ? "border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500/20"
                          : "border-input focus-visible:border-ring focus-visible:ring-ring/50"
                      }`}
                    >
                      <option value={0} disabled>
                        Seleccioná un cargo
                      </option>
                      {CARGOS.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.nombre}
                        </option>
                      ))}
                    </select>
                    {formErrors.cargo !== undefined && form.cargo === 0 && (
                      <p className="text-red-600 text-xs">
                        El cargo es requerido
                      </p>
                    )}
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setDialogOpen(false)}
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      disabled={submitting}
                      className="bg-[#68A243] hover:bg-[#68A243]/90 text-white"
                    >
                      {submitting ? "Guardando..." : "Guardar"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
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
                  <h2 className="text-2xl font-bold text-[#143E29] flex items-center gap-2">
                    <Badge className="bg-[#ffb900] text-black">
                      {ownRepresentantes.length}
                    </Badge>
                    Mis Representantes
                  </h2>
                  <p className="text-gray-600 text-sm mt-1">
                    Representantes de {user?.razon_social || "tu empresa"}
                  </p>
                </div>
                {ownRepresentantes.length === 0 ? (
                  <Card className="text-center py-8 border-2 border-dashed border-[#ffb900]/30">
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
                        className="hover:shadow-md transition-shadow border-2 border-[#ffb900] bg-yellow-50/30"
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-center gap-3">
                            <div className="bg-[#ffb900]/20 rounded-full p-2">
                              <User className="h-5 w-5 text-[#ffb900]" />
                            </div>
                            <div className="flex-1">
                              <CardTitle className="text-base text-[#143E29]">
                                {rep.nombre} {rep.apellido}
                              </CardTitle>
                              <Badge
                                variant="secondary"
                                className="text-xs mt-0.5"
                              >
                                {rep.cargo?.nombre || "Sin cargo"}
                              </Badge>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm text-gray-600">
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
                  <h2 className="text-2xl font-bold text-[#143E29] flex items-center gap-2">
                    <Badge className="bg-[#68A243]">
                      {representantes.length}
                    </Badge>
                    Todos los Representantes
                  </h2>
                  <p className="text-gray-600 text-sm mt-1">
                    Representantes de otras empresas
                  </p>
                </div>
                {representantes.length === 0 ? (
                  <Card className="text-center py-8 border-2 border-dashed border-gray-300">
                    <CardHeader>
                      <div className="flex justify-center mb-2">
                        <Users className="h-10 w-10 text-gray-300" />
                      </div>
                      <CardTitle className="text-gray-500 text-base">
                        Sin otros representantes
                      </CardTitle>
                    </CardHeader>
                  </Card>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {representantes.map((rep, i) => (
                      <Card
                        key={i}
                        className="hover:shadow-md transition-shadow border-2 hover:border-[#68A243]/30"
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-center gap-3">
                            <div className="bg-[#143E29]/10 rounded-full p-2">
                              <User className="h-5 w-5 text-[#143E29]" />
                            </div>
                            <div className="flex-1">
                              <CardTitle className="text-base text-[#143E29]">
                                {rep.nombre} {rep.apellido}
                              </CardTitle>
                              <Badge
                                variant="outline"
                                className="text-xs mt-0.5"
                              >
                                <Building2 className="h-3 w-3 mr-1" />
                                {rep.empresa_nombre || "Sin empresa"}
                              </Badge>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm text-gray-600">
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
            <Card className="text-center py-12">
              <CardHeader>
                <div className="flex justify-center mb-2">
                  <Users className="h-12 w-12 text-gray-300" />
                </div>
                <CardTitle className="text-gray-500">
                  Sin representantes
                </CardTitle>
                <CardDescription>
                  Todavía no hay representantes registrados para tu empresa.
                </CardDescription>
              </CardHeader>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {representantes.map((rep, i) => (
                <Card
                  key={i}
                  className="hover:shadow-md transition-shadow border-2 hover:border-[#68A243]/30"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className="bg-[#143E29]/10 rounded-full p-2">
                        <User className="h-5 w-5 text-[#143E29]" />
                      </div>
                      <div>
                        <CardTitle className="text-base text-[#143E29]">
                          {rep.nombre} {rep.apellido}
                        </CardTitle>
                        <Badge variant="secondary" className="text-xs mt-0.5">
                          {rep.cargo?.nombre || "Sin cargo"}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm text-gray-600">
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
      <Footer />
    </>
  );
}
