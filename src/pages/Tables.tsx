import { useState, useEffect, useCallback } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { Skeleton } from "../components/ui/skeleton";
import {
  ArrowLeft,
  Clock,
  Users,
  CheckCircle2,
  User,
  Search,
  Check,
  Plus,
} from "lucide-react";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../components/ui/popover";
import { cn } from "../lib/utils";
import { HelpTutorial } from "../components/HelpTutorial";
import { useParams, useNavigate } from "react-router";
import { getMesasByTurnoId } from "../api/MesaService";
import {
  getRepresentantes,
  createRepresentante,
} from "../api/RepresentanteService";
import { createAsiento, updateAsiento } from "../api/AsientoService";
import type { MesaResponse } from "../types/Mesa";
import type {
  RepresentanteResponse,
  RepresentanteWrite,
} from "../types/Representante";
import { toast } from "sonner";
import { useUserStore } from "../store/userStore";

interface TableUIData {
  id: number;
  number: number;
  status: "empty" | "partial" | "full";
  asientos: MesaResponse["asientos"];
}

export default function Tables() {
  const { id: turnoId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user: userFromStore } = useUserStore();

  const [tables, setTables] = useState<TableUIData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTable, setSelectedTable] = useState<TableUIData | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showChangeRepDialog, setShowChangeRepDialog] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [selectedRepresentative, setSelectedRepresentative] =
    useState<string>("");
  const [openRepresentativeSearch, setOpenRepresentativeSearch] =
    useState(false);
  const [representatives, setRepresentatives] = useState<
    RepresentanteResponse[]
  >([]);
  const [loadingRepresentatives, setLoadingRepresentatives] = useState(false);
  const [showAddRepresentativeDialog, setShowAddRepresentativeDialog] =
    useState(false);
  const [newRepForm, setNewRepForm] = useState<RepresentanteWrite>({
    nombre: "",
    apellido: "",
    email: "",
    cargo: 0,
  });
  const [newRepErrors, setNewRepErrors] = useState<Partial<RepresentanteWrite>>(
    {},
  );
  const [submittingNewRep, setSubmittingNewRep] = useState(false);
  const [submittingBooking, setSubmittingBooking] = useState(false);

  const tutorialSteps = [
    {
      title: "Selección de Mesas",
      description:
        "Aquí podés ver todas las mesas disponibles del turno. Cada mesa puede tener hasta 2 empresas para una reunión 1 a 1. Las mesas se muestran con diferentes colores según su estado.",
      icon: (
        <div className="grid grid-cols-4 gap-2">
          <div className="w-12 h-12 bg-white border-2 border-gray-300 rounded-lg" />
          <div className="w-12 h-12 bg-[#68A243]/10 border-2 border-[#68A243] rounded-lg" />
          <div className="w-12 h-12 bg-[#ffb900]/10 border-2 border-[#ffb900] rounded-lg" />
          <div className="w-12 h-12 bg-gray-200 border-2 border-gray-400 rounded-lg opacity-50" />
        </div>
      ),
    },
    {
      title: "Mesa Libre (Blanca)",
      description:
        "Las mesas de color blanco están completamente libres. Si elegís una mesa libre, vas a ser el primero en reservarla y otra empresa podrá unirse después para completar la reunión.",
    },
    {
      title: "Mesa Parcial (Verde)",
      description:
        "Las mesas verdes ya tienen una empresa esperando. Si elegís una de estas mesas, vas a unirte directamente con esa empresa para una reunión 1 a 1. Podés ver el logo y nombre de la empresa antes de confirmar.",
    },
    {
      title: "Tu Empresa Esperando (Naranja)",
      description:
        "Las mesas naranjas tienen un representante de tu empresa esperando. Si elegís una de estas mesas, podrás cambiar el representante de tu empresa que ya está asignado.",
    },
    {
      title: "Mesa Completa (Gris)",
      description:
        "Las mesas grises ya están completas con 2 empresas. No podés seleccionar estas mesas. Buscá otras mesas disponibles (blancas o verdes).",
    },
    {
      title: "Seleccionar Representante",
      description:
        "Al elegir una mesa, tenés que seleccionar qué representante de tu empresa va a asistir a esa reunión. Podés buscar por nombre si tenés muchos representantes. Si no tenés representantes, agregá uno desde el menú.",
      icon: <User className="h-16 w-16 text-[#68A243]" />,
    },
    {
      title: "Confirmar Reserva",
      description:
        "Después de elegir la mesa y el representante, hacé click en 'Confirmar Reserva'. Tu mesa quedará reservada y podrás ver los detalles de la reunión en la sección 'Mis Reuniones'.",
      icon: <CheckCircle2 className="h-16 w-16 text-[#68A243]" />,
    },
  ];

  // Cargar mesas desde la API
  useEffect(() => {
    const loadTables = async () => {
      if (!turnoId) {
        setError("No se especificó un turno");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const mesasData: MesaResponse[] = await getMesasByTurnoId(
          parseInt(turnoId),
        );

        // Transformar datos de API al formato de UI
        const transformedTables: TableUIData[] = mesasData.map((mesa) => {
          // Determinar status basado en cantidad de asientos
          let status: "empty" | "partial" | "full" = "empty";
          if (mesa.asientos.length === 1) {
            status = "partial";
          } else if (mesa.asientos.length >= 2) {
            status = "full";
          }

          return {
            id: mesa.id,
            number: mesa.num_mesa,
            status,
            asientos: mesa.asientos,
          };
        });

        setTables(transformedTables);
        setError(null);
      } catch (err) {
        console.error("Error cargando mesas:", err);
        setError("Error al cargar las mesas");
      } finally {
        setLoading(false);
      }
    };

    loadTables();
  }, [turnoId]);

  const loadRepresentatives = useCallback(async () => {
    try {
      setLoadingRepresentatives(true);
      const params = userFromStore?.is_superuser ? { all: true } : {};
      const data = await getRepresentantes(params);

      // Si es superadmin, ordenar propios primero
      if (userFromStore?.is_superuser && userFromStore?.empresa_id) {
        const own = data.filter(
          (rep) => rep.empresa_id === userFromStore.empresa_id,
        );
        const others = data.filter(
          (rep) => rep.empresa_id !== userFromStore.empresa_id,
        );
        setRepresentatives([...own, ...others]);
      } else {
        setRepresentatives(data);
      }
    } catch (err) {
      console.error("Error cargando representantes:", err);
    } finally {
      setLoadingRepresentatives(false);
    }
  }, [userFromStore?.is_superuser, userFromStore?.empresa_id]);

  // Cargar representantes cuando se abre cualquier modal de confirmación
  useEffect(() => {
    if (showConfirmDialog || showChangeRepDialog) {
      loadRepresentatives();
    }
  }, [showConfirmDialog, showChangeRepDialog, loadRepresentatives]);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 dark:bg-[#0a1a15] pt-8 pb-4 transition-colors duration-300">
          <div className="bg-gradient-to-br from-[#143E29] to-[#143E29]/90 dark:from-[#0f2f25] dark:to-[#143E29] text-white py-8 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold mb-2">Turno {turnoId}</h1>
                  <div className="flex flex-wrap items-center gap-4 text-gray-200">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>Cargando mesas...</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <Card className="dark:bg-[#143E29] dark:border-[#68A243]/20 transition-colors duration-300">
              <CardHeader>
                <CardTitle className="text-lg dark:text-white transition-colors duration-300">
                  Leyenda
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-6">
                  <div className="flex items-center gap-2">
                    <div className="w-12 h-12 bg-white dark:bg-[#0f2f25] border-2 border-gray-300 dark:border-gray-600 rounded-lg transition-colors duration-300" />
                    <span className="text-sm dark:text-gray-300 transition-colors duration-300">
                      Mesa Libre
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-12 h-12 bg-[#68A243]/10 border-2 border-[#68A243] rounded-lg" />
                    <span className="text-sm dark:text-gray-300 transition-colors duration-300">
                      Mesa con 1 Empresa
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-12 h-12 bg-[#ffb900]/10 border-2 border-[#ffb900] rounded-lg" />
                    <span className="text-sm dark:text-gray-300 transition-colors duration-300">
                      Tu Empresa Esperando
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 border-2 border-gray-400 dark:border-gray-600 rounded-lg opacity-50" />
                    <span className="text-sm dark:text-gray-300 transition-colors duration-300">
                      Mesa Completa
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
            <div className="bg-white dark:bg-[#143E29] rounded-xl shadow-sm border border-gray-200 dark:border-[#68A243]/20 p-8 transition-colors duration-300">
              <h2 className="text-2xl font-bold text-[#143E29] dark:text-white mb-6 text-center transition-colors duration-300">
                Seleccioná tu Mesa
              </h2>

              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 max-w-5xl mx-auto">
                {Array(12)
                  .fill(0)
                  .map((_, index) => (
                    <Skeleton
                      key={`skeleton-${index}`}
                      className="aspect-square rounded-lg dark:bg-[#0f2f25]"
                    />
                  ))}
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 dark:bg-[#0a1a15] pt-20 transition-colors duration-300">
          <div className="max-w-4xl mx-auto px-4 py-16">
            <Card className="dark:bg-[#143E29] dark:border-[#68A243]/20 transition-colors duration-300">
              <CardHeader>
                <CardTitle className="text-[#F05826] dark:text-orange-400 transition-colors duration-300">
                  {error}
                </CardTitle>
                <CardDescription className="dark:text-gray-300 transition-colors duration-300">
                  Intenta nuevamente más tarde o vuelve a los turnos disponibles
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => navigate("/turnos")}
                  className="bg-[#68A243] hover:bg-[#68A243]/90 text-white"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Volver a Turnos
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!turnoId) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 dark:bg-[#0a1a15] pt-20 transition-colors duration-300">
          <div className="max-w-4xl mx-auto px-4 py-16">
            <Card className="dark:bg-[#143E29] dark:border-[#68A243]/20 transition-colors duration-300">
              <CardHeader>
                <CardTitle className="text-[#143E29] dark:text-white transition-colors duration-300">
                  Turno no encontrado
                </CardTitle>
                <CardDescription className="dark:text-gray-300 transition-colors duration-300">
                  El turno que buscás no existe
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => navigate("/turnos")}
                  className="bg-[#68A243] hover:bg-[#68A243]/90 text-white"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Volver a Turnos
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (tables.length === 0) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 dark:bg-[#0a1a15] pt-8 pb-4 transition-colors duration-300">
          <div className="bg-gradient-to-br from-[#143E29] to-[#143E29]/90 dark:from-[#0f2f25] dark:to-[#143E29] text-white py-8 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <Button
                variant="ghost"
                onClick={() => navigate("/turnos")}
                className="text-white hover:bg-white/10 mb-4"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver a Turnos
              </Button>

              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold mb-2">Turno {turnoId}</h1>
                  <div className="flex flex-wrap items-center gap-4 text-gray-200">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>Mesas disponibles</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <Card className="dark:bg-[#143E29] dark:border-[#68A243]/20 transition-colors duration-300">
              <CardHeader>
                <CardTitle className="text-[#143E29] dark:text-white transition-colors duration-300">
                  No hay mesas disponibles
                </CardTitle>
                <CardDescription className="dark:text-gray-300 transition-colors duration-300">
                  No hay mesas para este turno. Intenta con otro turno o vuelve
                  más tarde.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => navigate("/turnos")}
                  className="bg-[#68A243] hover:bg-[#68A243]/90 text-white"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Volver a Turnos
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const handleTableClick = (table: TableUIData) => {
    if (table.status === "full") return;
    setSelectedTable(table);
    setSelectedRepresentative("");

    // Verificar si la mesa tiene un representante de MI empresa
    const isMyCompanyAtTable =
      table.status === "partial" &&
      table.asientos[0] &&
      table.asientos[0].empresa_id === userFromStore?.empresa_id;

    if (isMyCompanyAtTable) {
      setShowChangeRepDialog(true);
    } else {
      setShowConfirmDialog(true);
    }
  };

  const validateNewRep = (): boolean => {
    const errors: Partial<RepresentanteWrite> = {};
    if (!newRepForm.nombre.trim()) errors.nombre = "El nombre es requerido";
    if (!newRepForm.apellido.trim())
      errors.apellido = "El apellido es requerido";
    if (!newRepForm.email.trim()) errors.email = "El email es requerido";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newRepForm.email))
      errors.email = "El email no es válido";
    if (!newRepForm.cargo) errors.cargo = 0;
    setNewRepErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddRepresentative = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateNewRep()) return;

    setSubmittingNewRep(true);
    try {
      const nuevo = await createRepresentante(newRepForm);
      setRepresentatives((prev) => [...prev, nuevo]);
      setSelectedRepresentative(nuevo.id.toString());
      toast.success("Representante agregado correctamente");
      setShowAddRepresentativeDialog(false);
      setNewRepForm({ nombre: "", apellido: "", email: "", cargo: 0 });
      setNewRepErrors({});
    } catch (err) {
      console.error("Error creando representante:", err);
      toast.error("No se pudo agregar el representante. Intentá de nuevo.");
    } finally {
      setSubmittingNewRep(false);
    }
  };

  const handleConfirmBooking = async () => {
    // Validar datos requeridos
    if (!selectedTable) {
      toast.error("Por favor selecciona una mesa");
      return;
    }

    if (!selectedRepresentative) {
      toast.error("Por favor selecciona un representante");
      return;
    }

    if (!userFromStore?.empresa_id) {
      toast.error(
        "No se encontró el ID de la empresa. Por favor inicia sesión de nuevo",
      );
      return;
    }

    setSubmittingBooking(true);
    try {
      // Construir el payload
      const repIndex = parseInt(selectedRepresentative);
      const payload = {
        mesa: selectedTable.id,
        empresa: userFromStore.empresa_id,
        representante: repIndex,
      };

      // Llamar a la API
      await createAsiento(payload);

      // Mostrar éxito
      toast.success("¡Reserva confirmada exitosamente!");
      setBookingSuccess(true);
      setShowConfirmDialog(false);
      setSelectedRepresentative("");
      setNewRepForm({ nombre: "", apellido: "", email: "", cargo: 0 });

      // Recargar las mesas después de 2 segundos
      setTimeout(async () => {
        try {
          const mesasData = await getMesasByTurnoId(parseInt(turnoId!));
          const transformedTables = mesasData.map((mesa) => {
            let status: "empty" | "partial" | "full" = "empty";
            if (mesa.asientos.length === 1) {
              status = "partial";
            } else if (mesa.asientos.length >= 2) {
              status = "full";
            }

            return {
              id: mesa.id,
              number: mesa.num_mesa,
              status,
              asientos: mesa.asientos,
            };
          });
          setTables(transformedTables);
        } catch (err) {
          console.error("Error recargando mesas:", err);
        }
      }, 2000);

      // Ocultar el mensaje de éxito después de 3 segundos
      setTimeout(() => {
        setBookingSuccess(false);
      }, 3000);
    } catch (err) {
      console.error("Error confirmando reserva:", err);

      // Intentar extraer el mensaje de error del backend
      let errorMessage = "Error al confirmar la reserva";

      const axiosError = err as {
        response?: { data?: Record<string, string[]> };
        message?: string;
      };

      // Primero, intentar obtener el error específico del backend
      if (
        axiosError.response?.data &&
        typeof axiosError.response.data === "object"
      ) {
        const errorData = axiosError.response.data;
        // Obtener el primer array de errores del objeto
        const firstErrorArray = Object.values(errorData)[0];
        if (Array.isArray(firstErrorArray) && firstErrorArray.length > 0) {
          errorMessage = firstErrorArray[0];
        }
      }
      // Si no hay error del backend, usar el mensaje de axios
      else if (err instanceof Error) {
        errorMessage = err.message;
      }

      toast.error(errorMessage);
    } finally {
      setSubmittingBooking(false);
    }
  };

  const handleChangeRepresentative = async () => {
    // Validar datos requeridos
    if (!selectedTable) {
      toast.error("Por favor selecciona una mesa");
      return;
    }

    if (!selectedRepresentative) {
      toast.error("Por favor selecciona un representante");
      return;
    }

    if (!selectedTable.asientos[0]) {
      toast.error("No se encontró el asiento actual");
      return;
    }

    setSubmittingBooking(true);
    try {
      // Construir el payload con solo el representante
      const repId = parseInt(selectedRepresentative);
      const payload = {
        representante: repId,
      };

      // Llamar a la API para actualizar
      await updateAsiento(selectedTable.asientos[0].id, payload);

      // Mostrar éxito
      toast.success("¡Representante cambio exitosamente!");
      setShowChangeRepDialog(false);
      setSelectedRepresentative("");

      // Recargar las mesas después de 2 segundos
      setTimeout(async () => {
        try {
          const mesasData = await getMesasByTurnoId(parseInt(turnoId!));
          const transformedTables = mesasData.map((mesa) => {
            let status: "empty" | "partial" | "full" = "empty";
            if (mesa.asientos.length === 1) {
              status = "partial";
            } else if (mesa.asientos.length >= 2) {
              status = "full";
            }

            return {
              id: mesa.id,
              number: mesa.num_mesa,
              status,
              asientos: mesa.asientos,
            };
          });
          setTables(transformedTables);
        } catch (err) {
          console.error("Error recargando mesas:", err);
        }
      }, 2000);
    } catch (err) {
      console.error("Error cambiando representante:", err);

      // Intentar extraer el mensaje de error del backend
      let errorMessage = "Error al cambiar el representante";

      const axiosError = err as {
        response?: { data?: Record<string, string[]> };
        message?: string;
      };

      // Primero, intentar obtener el error específico del backend
      if (
        axiosError.response?.data &&
        typeof axiosError.response.data === "object"
      ) {
        const errorData = axiosError.response.data;
        // Obtener el primer array de errores del objeto
        const firstErrorArray = Object.values(errorData)[0];
        if (Array.isArray(firstErrorArray) && firstErrorArray.length > 0) {
          errorMessage = firstErrorArray[0];
        }
      }
      // Si no hay error del backend, usar el mensaje de axios
      else if (err instanceof Error) {
        errorMessage = err.message;
      }

      toast.error(errorMessage);
    } finally {
      setSubmittingBooking(false);
    }
  };

  // Para mostrar la empresa anfitriona en el dialog

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 dark:bg-[#0a1a15] pt-8 pb-4 transition-colors duration-300">
        <div className="bg-gradient-to-br from-[#143E29] to-[#143E29]/90 dark:from-[#0f2f25] dark:to-[#143E29] text-white py-8 transition-colors duration-300">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Button
              variant="ghost"
              onClick={() => navigate("/turnos")}
              className="text-white hover:bg-white/10 mb-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver a Turnos
            </Button>

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold mb-2">Turno {turnoId}</h1>
                <div className="flex flex-wrap items-center gap-4 text-gray-200">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>Mesas disponibles</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>
                      {tables.filter((t) => t.status !== "full").length} mesas
                      libres de {tables.length}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {bookingSuccess && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
            <div className="bg-green-50 dark:bg-green-950 border-l-4 border-green-500 p-4 rounded-lg flex items-center gap-3 transition-colors duration-300">
              <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
              <div>
                <p className="font-semibold text-green-800 dark:text-green-200">
                  ¡Reserva confirmada!
                </p>
                <p className="text-sm text-green-700 dark:text-green-300">
                  Tu mesa ha sido reservada exitosamente
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Card className="dark:bg-[#143E29] dark:border-[#68A243]/20 transition-colors duration-300">
            <CardHeader>
              <CardTitle className="text-lg dark:text-white transition-colors duration-300">
                Leyenda
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-12 h-12 bg-white dark:bg-[#0f2f25] border-2 border-gray-300 dark:border-gray-600 rounded-lg transition-colors duration-300" />
                  <span className="text-sm dark:text-gray-300 transition-colors duration-300">
                    Mesa Libre
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-12 h-12 bg-[#68A243]/10 border-2 border-[#68A243] rounded-lg" />
                  <span className="text-sm dark:text-gray-300 transition-colors duration-300">
                    Mesa con 1 Empresa
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-12 h-12 bg-[#ffb900]/10 border-2 border-[#ffb900] rounded-lg" />
                  <span className="text-sm dark:text-gray-300 transition-colors duration-300">
                    Tu Empresa Esperando
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 border-2 border-gray-400 dark:border-gray-600 rounded-lg opacity-50" />
                  <span className="text-sm dark:text-gray-300 transition-colors duration-300">
                    Mesa Completa
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <div className="bg-white dark:bg-[#143E29] rounded-xl shadow-sm border border-gray-200 dark:border-[#68A243]/20 p-8 transition-colors duration-300">
            <h2 className="text-2xl font-bold text-[#143E29] dark:text-white mb-6 text-center transition-colors duration-300">
              Seleccioná tu Mesa
            </h2>

            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 max-w-5xl mx-auto">
              {tables.map((table, index) => {
                const hostName =
                  table.status === "partial" && table.asientos[0]
                    ? `${table.asientos[0].representante_nombre || ""} ${
                        table.asientos[0].representante_apellido || ""
                      }`.trim()
                    : null;

                const isMyCompany =
                  table.status === "partial" &&
                  table.asientos[0] &&
                  table.asientos[0].empresa_id === userFromStore?.empresa_id;

                return (
                  <button
                    key={table.id}
                    onClick={() => handleTableClick(table)}
                    disabled={table.status === "full"}
                    className={`
                      relative aspect-square rounded-lg border-2 transition-all duration-300
                      flex flex-col items-center justify-center p-3
                      ${
                        table.status === "full"
                          ? "bg-gray-200 dark:bg-gray-700 border-gray-400 dark:border-gray-600 opacity-50 cursor-not-allowed"
                          : table.status === "partial"
                            ? isMyCompany
                              ? "bg-[#ffb900]/10 border-[#ffb900] hover:bg-[#ffb900]/20 hover:scale-105 cursor-pointer dark:bg-[#ffb900]/10 dark:border-[#ffb900]"
                              : "bg-[#68A243]/10 border-[#68A243] hover:bg-[#68A243]/20 hover:scale-105 cursor-pointer dark:bg-[#68A243]/10 dark:border-[#68A243]"
                            : "bg-white dark:bg-[#0f2f25] border-gray-300 dark:border-gray-600 hover:border-[#68A243] hover:scale-105 cursor-pointer hover:shadow-lg dark:hover:border-[#68A243] dark:hover:shadow-[#68A243]/20 transition-colors duration-300"
                      }
                    `}
                    style={{
                      animation: `fadeInUp 0.5s ease-out ${index * 0.05}s both`,
                    }}
                  >
                    <div className="text-center">
                      <p className="font-bold text-lg text-[#143E29] dark:text-white mb-1 transition-colors duration-300">
                        {table.number}
                      </p>

                      {table.status === "partial" && hostName ? (
                        <div className="flex flex-col items-center gap-1">
                          <div
                            className={`h-8 w-8 rounded-full flex items-center justify-center text-white text-xs font-bold border border-white ${
                              isMyCompany ? "bg-[#ffb900]" : "bg-[#68A243]"
                            }`}
                          >
                            {table.asientos[0]?.empresa_nombre
                              ?.substring(0, 1)
                              .toUpperCase()}
                          </div>
                          <p
                            className={`text-xs line-clamp-1 max-w-full transition-colors duration-300 ${
                              isMyCompany
                                ? "text-[#ffb900] font-semibold"
                                : "text-gray-600 dark:text-gray-300"
                            }`}
                          >
                            {hostName}
                          </p>
                          {isMyCompany && (
                            <p className="text-[10px] text-[#ffb900] font-semibold">
                              Tu empresa
                            </p>
                          )}
                        </div>
                      ) : table.status === "full" ? (
                        <p className="text-xs text-gray-500 dark:text-gray-200 transition-colors duration-300">
                          Completa
                        </p>
                      ) : (
                        <p className="text-xs text-gray-500 dark:text-gray-200 transition-colors duration-300">
                          Libre
                        </p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
          <DialogContent className="sm:max-w-md dark:bg-[#143E29] dark:border-[#68A243]/20">
            <DialogHeader>
              <DialogTitle className="text-[#143E29] dark:text-white transition-colors duration-300">
                Confirmar Reserva
              </DialogTitle>
              <DialogDescription className="dark:text-gray-300 transition-colors duration-300">
                {selectedTable?.status === "partial" &&
                selectedTable.asientos[0] ? (
                  <>
                    Te vas a unir a la mesa {selectedTable.number} donde está
                    esperando: {selectedTable.asientos[0].empresa_nombre}
                  </>
                ) : (
                  <>
                    Vas a reservar la mesa {selectedTable?.number}. Otra empresa
                    podrá unirse a tu mesa.
                  </>
                )}
              </DialogDescription>
            </DialogHeader>

            {selectedTable?.status === "partial" &&
              selectedTable.asientos[0] && (
                <Card className="border-[#68A243]/30 dark:bg-[#143E29] dark:border-[#68A243]/20 transition-colors duration-300">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                      <div className="h-16 w-16 rounded-full bg-[#68A243] flex items-center justify-center text-white text-lg font-bold">
                        {selectedTable.asientos[0].empresa_nombre
                          ?.substring(0, 1)
                          .toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-[#143E29] dark:text-white transition-colors duration-300">
                          {selectedTable.asientos[0].empresa_nombre}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300 transition-colors duration-300">
                          Rep: {selectedTable.asientos[0].representante_nombre}{" "}
                          {selectedTable.asientos[0].representante_apellido}
                        </p>
                        <Badge className="mt-1 bg-[#68A243]/10 text-[#68A243] hover:bg-[#68A243]/20">
                          Anfitrión
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

            <div className="space-y-2 mt-4">
              <Label className="flex items-center gap-2 text-[#143E29] dark:text-white transition-colors duration-300">
                <User className="h-4 w-4 text-[#68A243]" />
                Seleccioná el representante que asistirá
              </Label>
              {loadingRepresentatives ? (
                <div className="text-sm text-gray-600 dark:text-gray-300 p-3 rounded-lg bg-gray-50 dark:bg-[#0f2f25] transition-colors duration-300">
                  Cargando representantes...
                </div>
              ) : representatives && representatives.length > 0 ? (
                <Popover
                  open={openRepresentativeSearch}
                  onOpenChange={setOpenRepresentativeSearch}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openRepresentativeSearch}
                      className="w-full justify-between border-[#68A243]/20 hover:border-[#68A243] bg-transparent dark:bg-[#0f2f25] dark:border-[#68A243]/20 dark:text-white dark:hover:bg-[#1a3f30] transition-colors duration-300"
                    >
                      {selectedRepresentative
                        ? representatives.find(
                            (rep) =>
                              rep.id.toString() === selectedRepresentative,
                          )
                          ? `${
                              representatives.find(
                                (rep) =>
                                  rep.id.toString() === selectedRepresentative,
                              )?.nombre
                            } ${
                              representatives.find(
                                (rep) =>
                                  rep.id.toString() === selectedRepresentative,
                              )?.apellido
                            }`
                          : "Buscá y seleccioná un representante"
                        : "Buscá y seleccioná un representante"}
                      <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-full p-0 dark:bg-[#143E29] dark:border-[#68A243]/20"
                    align="start"
                  >
                    {loadingRepresentatives ? (
                      <div className="p-4 space-y-2 dark:bg-[#143E29]">
                        <Skeleton className="h-8 w-full dark:bg-[#1a3f30]" />
                        <Skeleton className="h-10 w-full dark:bg-[#1a3f30]" />
                        <Skeleton className="h-10 w-full dark:bg-[#1a3f30]" />
                        <Skeleton className="h-10 w-full dark:bg-[#1a3f30]" />
                      </div>
                    ) : (
                      <Command className="dark:bg-[#143E29]">
                        <CommandInput
                          placeholder="Buscar representante..."
                          className="h-9 dark:bg-[#0f2f25] dark:text-white dark:placeholder-gray-400 dark:border-[#68A243]/20"
                        />
                        <CommandList className="dark:bg-[#143E29]">
                          <CommandEmpty className="dark:text-gray-400">
                            No se encontró ningún representante
                          </CommandEmpty>
                          <CommandGroup className="dark:text-white">
                            {representatives.map((rep) => {
                              const isOwn =
                                userFromStore?.is_superuser &&
                                rep.empresa_id === userFromStore.empresa_id;
                              return (
                                <CommandItem
                                  key={rep.id}
                                  value={`${rep.nombre} ${rep.apellido}`}
                                  onSelect={() => {
                                    setSelectedRepresentative(
                                      rep.id.toString(),
                                    );
                                    setOpenRepresentativeSearch(false);
                                  }}
                                  className={cn(
                                    "cursor-pointer dark:hover:bg-[#1a3f30] dark:focus:bg-[#1a3f30] dark:text-white transition-colors duration-200",
                                    isOwn && "bg-yellow-50 dark:bg-[#1a3f30]",
                                  )}
                                >
                                  <div className="flex items-center gap-3 flex-1">
                                    <Avatar
                                      className={cn(
                                        "h-8 w-8",
                                        isOwn ? "bg-[#ffb900]" : "bg-[#68A243]",
                                      )}
                                    >
                                      <AvatarFallback
                                        className={cn(
                                          "text-white text-xs font-semibold",
                                          isOwn
                                            ? "bg-[#ffb900]"
                                            : "bg-[#68A243]",
                                        )}
                                      >
                                        {`${rep.nombre[0]}${rep.apellido[0]}`.toUpperCase()}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                      <p className="font-medium">
                                        {rep.nombre} {rep.apellido}
                                      </p>
                                      <p className="text-xs text-gray-500 dark:text-gray-200 transition-colors duration-300">
                                        {userFromStore?.is_superuser &&
                                        !isOwn ? (
                                          <span>
                                            {rep.email} •{" "}
                                            {rep.empresa_nombre ||
                                              "Sin empresa"}
                                          </span>
                                        ) : (
                                          rep.email
                                        )}
                                      </p>
                                    </div>
                                    {isOwn && (
                                      <Badge className="bg-[#ffb900] text-black shrink-0 dark:bg-amber-500 dark:text-black">
                                        Propio
                                      </Badge>
                                    )}
                                  </div>
                                  <Check
                                    className={cn(
                                      "ml-auto h-4 w-4 text-[#68A243]",
                                      selectedRepresentative ===
                                        rep.id.toString()
                                        ? "opacity-100"
                                        : "opacity-0",
                                    )}
                                  />
                                </CommandItem>
                              );
                            })}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    )}
                  </PopoverContent>
                </Popover>
              ) : (
                <div className="text-sm text-[#F05826] dark:text-orange-400 bg-[#F05826]/10 dark:bg-orange-950/20 p-3 rounded-lg border border-[#F05826]/30 dark:border-orange-700/30 transition-colors duration-300">
                  No tenés representantes agregados.
                </div>
              )}
              <div className="text-xs text-gray-500 dark:text-gray-200 px-1 py-2 mt-3 transition-colors duration-300">
                ¿No aparece en la lista? Agregá uno aquí ↓
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowAddRepresentativeDialog(true)}
                className="w-full border-[#68A243]/20 hover:border-[#68A243] text-[#68A243] dark:bg-[#0f2f25] dark:border-[#68A243]/20 dark:text-[#68A243] dark:hover:bg-[#1a3f30] transition-colors duration-300"
              >
                <Plus className="h-4 w-4 mr-2" />
                Agregar nuevo representante
              </Button>
            </div>

            <div className="flex gap-3 mt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowConfirmDialog(false);
                  setSelectedRepresentative("");
                }}
                className="flex-1 dark:bg-[#0f2f25] dark:border-[#68A243]/20 dark:text-white dark:hover:bg-[#1a3f30] transition-colors duration-300"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleConfirmBooking}
                className="flex-1 bg-[#68A243] hover:bg-[#68A243]/90 text-white"
                disabled={!selectedRepresentative || submittingBooking}
              >
                {submittingBooking ? "Confirmando..." : "Confirmar Reserva"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog
          open={showChangeRepDialog}
          onOpenChange={setShowChangeRepDialog}
        >
          <DialogContent className="sm:max-w-md dark:bg-[#143E29] dark:border-[#68A243]/20">
            <DialogHeader>
              <DialogTitle className="text-[#143E29] dark:text-white transition-colors duration-300">
                Cambiar Representante
              </DialogTitle>
              <DialogDescription className="dark:text-gray-300 transition-colors duration-300">
                Esta es tu mesa. Podés cambiar el representante que está
                sentado.
              </DialogDescription>
            </DialogHeader>

            {selectedTable?.status === "partial" &&
              selectedTable.asientos[0] && (
                <Card className="border-[#ffb900]/30 dark:bg-[#143E29] dark:border-[#ffb900]/20 transition-colors duration-300">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                      <div className="h-16 w-16 rounded-full bg-[#ffb900] flex items-center justify-center text-white text-lg font-bold">
                        {selectedTable.asientos[0].empresa_nombre
                          ?.substring(0, 1)
                          .toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-[#143E29] dark:text-white transition-colors duration-300">
                          {selectedTable.asientos[0].empresa_nombre}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300 transition-colors duration-300">
                          Rep: {selectedTable.asientos[0].representante_nombre}{" "}
                          {selectedTable.asientos[0].representante_apellido}
                        </p>
                        <Badge className="mt-1 bg-[#ffb900]/10 text-[#ffb900] hover:bg-[#ffb900]/20">
                          Tu Empresa
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

            <div className="space-y-2 mt-4">
              <Label className="flex items-center gap-2 text-[#143E29] dark:text-white transition-colors duration-300">
                <User className="h-4 w-4 text-[#ffb900]" />
                Seleccioná el nuevo representante
              </Label>
              {loadingRepresentatives ? (
                <div className="text-sm text-gray-600 dark:text-gray-300 p-3 rounded-lg bg-gray-50 dark:bg-[#0f2f25] transition-colors duration-300">
                  Cargando representantes...
                </div>
              ) : representatives && representatives.length > 0 ? (
                <Popover
                  open={openRepresentativeSearch}
                  onOpenChange={setOpenRepresentativeSearch}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openRepresentativeSearch}
                      className="w-full justify-between border-[#ffb900]/20 hover:border-[#ffb900] bg-transparent dark:bg-[#0f2f25] dark:border-[#ffb900]/20 dark:text-white dark:hover:bg-[#1a3f30] transition-colors duration-300"
                    >
                      {selectedRepresentative
                        ? representatives.find(
                            (rep) =>
                              rep.id.toString() === selectedRepresentative,
                          )
                          ? `${
                              representatives.find(
                                (rep) =>
                                  rep.id.toString() === selectedRepresentative,
                              )?.nombre
                            } ${
                              representatives.find(
                                (rep) =>
                                  rep.id.toString() === selectedRepresentative,
                              )?.apellido
                            }`
                          : "Buscá y seleccioná un representante"
                        : "Buscá y seleccioná un representante"}
                      <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-full p-0 dark:bg-[#143E29] dark:border-[#68A243]/20"
                    align="start"
                  >
                    {loadingRepresentatives ? (
                      <div className="p-4 space-y-2 dark:bg-[#143E29]">
                        <Skeleton className="h-8 w-full dark:bg-[#1a3f30]" />
                        <Skeleton className="h-10 w-full dark:bg-[#1a3f30]" />
                        <Skeleton className="h-10 w-full dark:bg-[#1a3f30]" />
                        <Skeleton className="h-10 w-full dark:bg-[#1a3f30]" />
                      </div>
                    ) : (
                      <Command className="dark:bg-[#143E29]">
                        <CommandInput
                          placeholder="Buscar representante..."
                          className="h-9 dark:bg-[#0f2f25] dark:text-white dark:placeholder-gray-400 dark:border-[#68A243]/20"
                        />
                        <CommandList className="dark:bg-[#143E29]">
                          <CommandEmpty className="dark:text-gray-400">
                            No se encontró ningún representante
                          </CommandEmpty>
                          <CommandGroup className="dark:text-white">
                            {representatives.map((rep) => {
                              const isOwn =
                                userFromStore?.is_superuser &&
                                rep.empresa_id === userFromStore.empresa_id;
                              return (
                                <CommandItem
                                  key={rep.id}
                                  value={`${rep.nombre} ${rep.apellido}`}
                                  onSelect={() => {
                                    setSelectedRepresentative(
                                      rep.id.toString(),
                                    );
                                    setOpenRepresentativeSearch(false);
                                  }}
                                  className={cn(
                                    "cursor-pointer",
                                    isOwn && "bg-yellow-50",
                                  )}
                                >
                                  <div className="flex items-center gap-3 flex-1">
                                    <Avatar
                                      className={cn(
                                        "h-8 w-8",
                                        isOwn ? "bg-[#ffb900]" : "bg-[#68A243]",
                                      )}
                                    >
                                      <AvatarFallback
                                        className={cn(
                                          "text-white text-xs font-semibold",
                                          isOwn
                                            ? "bg-[#ffb900]"
                                            : "bg-[#68A243]",
                                        )}
                                      >
                                        {`${rep.nombre[0]}${rep.apellido[0]}`.toUpperCase()}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                      <p className="font-medium">
                                        {rep.nombre} {rep.apellido}
                                      </p>
                                      <p className="text-xs text-gray-500 dark:text-gray-200 transition-colors duration-300">
                                        {userFromStore?.is_superuser &&
                                        !isOwn ? (
                                          <span>
                                            {rep.email} •{" "}
                                            {rep.empresa_nombre ||
                                              "Sin empresa"}
                                          </span>
                                        ) : (
                                          rep.email
                                        )}
                                      </p>
                                    </div>
                                    {isOwn && (
                                      <Badge className="bg-[#ffb900] text-black shrink-0 dark:bg-amber-500 dark:text-black">
                                        Propio
                                      </Badge>
                                    )}
                                  </div>
                                  <Check
                                    className={cn(
                                      "ml-auto h-4 w-4 text-[#ffb900]",
                                      selectedRepresentative ===
                                        rep.id.toString()
                                        ? "opacity-100"
                                        : "opacity-0",
                                    )}
                                  />
                                </CommandItem>
                              );
                            })}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    )}
                  </PopoverContent>
                </Popover>
              ) : (
                <div className="text-sm text-[#F05826] bg-[#F05826]/10 p-3 rounded-lg border border-[#F05826]/30">
                  No tenés representantes agregados.
                </div>
              )}
              <div className="text-xs text-gray-500 dark:text-gray-200 px-1 py-2 mt-3 transition-colors duration-300">
                ¿No aparece en la lista? Agregá uno aquí ↓
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowAddRepresentativeDialog(true)}
                className="w-full border-[#ffb900]/20 hover:border-[#ffb900] text-[#ffb900] dark:bg-[#0f2f25] dark:border-[#ffb900]/20 dark:text-[#ffb900] dark:hover:bg-[#1a3f30] transition-colors duration-300"
              >
                <Plus className="h-4 w-4 mr-2" />
                Agregar nuevo representante
              </Button>
            </div>

            <div className="flex gap-3 mt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowChangeRepDialog(false);
                  setSelectedRepresentative("");
                }}
                className="flex-1 dark:bg-[#0f2f25] dark:border-[#68A243]/20 dark:text-white dark:hover:bg-[#1a3f30] transition-colors duration-300"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleChangeRepresentative}
                className="flex-1 bg-[#ffb900] hover:bg-[#ffb900]/90 text-white"
                disabled={!selectedRepresentative || submittingBooking}
              >
                {submittingBooking ? "Cambiando..." : "Cambiar Representante"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog
          open={showAddRepresentativeDialog}
          onOpenChange={setShowAddRepresentativeDialog}
        >
          <DialogContent className="sm:max-w-md dark:bg-[#143E29] dark:border-[#68A243]/20">
            <DialogHeader>
              <DialogTitle className="text-[#143E29] dark:text-white transition-colors duration-300">
                Agregar Representante
              </DialogTitle>
              <DialogDescription className="dark:text-gray-300 transition-colors duration-300">
                Agregá un nuevo representante de tu empresa para esta reunión
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleAddRepresentative} className="space-y-4">
              <div>
                <Label
                  htmlFor="nombre"
                  className="text-[#143E29] dark:text-white transition-colors duration-300"
                >
                  Nombre *
                </Label>
                <Input
                  id="nombre"
                  name="nombre"
                  value={newRepForm.nombre}
                  onChange={(e) => {
                    setNewRepForm({ ...newRepForm, nombre: e.target.value });
                    setNewRepErrors({ ...newRepErrors, nombre: undefined });
                  }}
                  placeholder="Nombre"
                  className={`${newRepErrors.nombre ? "border-red-500" : ""} dark:bg-[#0f2f25] dark:border-[#68A243]/20 dark:text-white dark:placeholder-gray-500 dark:focus:border-[#68A243] transition-colors duration-300`}
                />
                {newRepErrors.nombre && (
                  <p className="text-xs text-red-500 dark:text-red-400 mt-1">
                    {newRepErrors.nombre}
                  </p>
                )}
              </div>

              <div>
                <Label
                  htmlFor="apellido"
                  className="text-[#143E29] dark:text-white transition-colors duration-300"
                >
                  Apellido *
                </Label>
                <Input
                  id="apellido"
                  name="apellido"
                  value={newRepForm.apellido}
                  onChange={(e) => {
                    setNewRepForm({ ...newRepForm, apellido: e.target.value });
                    setNewRepErrors({ ...newRepErrors, apellido: undefined });
                  }}
                  placeholder="Apellido"
                  className={`${newRepErrors.apellido ? "border-red-500" : ""} dark:bg-[#0f2f25] dark:border-[#68A243]/20 dark:text-white dark:placeholder-gray-500 dark:focus:border-[#68A243] transition-colors duration-300`}
                />
                {newRepErrors.apellido && (
                  <p className="text-xs text-red-500 dark:text-red-400 mt-1">
                    {newRepErrors.apellido}
                  </p>
                )}
              </div>

              <div>
                <Label
                  htmlFor="email"
                  className="text-[#143E29] dark:text-white transition-colors duration-300"
                >
                  Email *
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={newRepForm.email}
                  onChange={(e) => {
                    setNewRepForm({ ...newRepForm, email: e.target.value });
                    setNewRepErrors({ ...newRepErrors, email: undefined });
                  }}
                  placeholder="email@example.com"
                  className={`${newRepErrors.email ? "border-red-500" : ""} dark:bg-[#0f2f25] dark:border-[#68A243]/20 dark:text-white dark:placeholder-gray-500 dark:focus:border-[#68A243] transition-colors duration-300`}
                />
                {newRepErrors.email && (
                  <p className="text-xs text-red-500 dark:text-red-400 mt-1">
                    {newRepErrors.email}
                  </p>
                )}
              </div>

              <div>
                <Label
                  htmlFor="cargo"
                  className="text-[#143E29] dark:text-white transition-colors duration-300"
                >
                  Cargo *
                </Label>
                <select
                  id="cargo"
                  name="cargo"
                  value={newRepForm.cargo}
                  onChange={(e) => {
                    setNewRepForm({
                      ...newRepForm,
                      cargo: Number(e.target.value),
                    });
                    setNewRepErrors({ ...newRepErrors, cargo: undefined });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#68A243] dark:bg-[#0f2f25] dark:border-[#68A243]/20 dark:text-white dark:focus:ring-[#68A243] transition-colors duration-300"
                >
                  <option value="0">Selecciona un cargo</option>
                  <option value="1">Gerente</option>
                  <option value="2">Director</option>
                  <option value="3">Coordinador</option>
                  <option value="4">Asesor</option>
                  <option value="5">Otro</option>
                </select>
                {newRepErrors.cargo !== undefined &&
                  newRepErrors.cargo === 0 && (
                    <p className="text-xs text-red-500 dark:text-red-400 mt-1">
                      El cargo es requerido
                    </p>
                  )}
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddRepresentativeDialog(false)}
                  className="flex-1 dark:bg-[#0f2f25] dark:border-[#68A243]/20 dark:text-white dark:hover:bg-[#1a3f30] transition-colors duration-300"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={submittingNewRep}
                  className="flex-1 bg-[#68A243] hover:bg-[#68A243]/90 text-white"
                >
                  {submittingNewRep ? "Agregando..." : "Agregar"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <HelpTutorial title="Guía de Selección de Mesas" steps={tutorialSteps} />

      <Footer />
    </>
  );
}
