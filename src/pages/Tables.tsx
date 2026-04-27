import { useState, useEffect, useCallback } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import Navbar from "../components/Navbar";
import Footer from "../layout/Footer";
import { Button, buttonVariants } from "../components/ui/button";
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
  Trash2,
  LogOut,
  X,
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
import { AddRepresentativeModal } from "../components/AddRepresentativeModal";
import { useParams, useNavigate } from "react-router";
import { getMesasByTurnoId } from "../api/MesaService";
import {
  getRepresentantes,
  createRepresentante,
} from "../api/RepresentanteService";
import { getCargos } from "../api/CargoService";
import {
  cancelAsiento,
  createAsiento,
  deleteAsiento,
  updateAsiento,
} from "../api/AsientoService";
import type { MesaResponse } from "../types/Mesa";
import type { GenericType } from "../types/GenericType";
import type { AsientoResponse } from "../types/Asiento";
import type {
  RepresentanteResponse,
  RepresentanteWrite,
} from "../types/Representante";
import { toast } from "sonner";
import { useUserStore } from "../store/userStore";
import { getApiErrorMessage, isSessionExpiredError } from "../lib/axios";

interface TableUIData {
  id: number;
  number: number;
  status: "empty" | "partial" | "full";
  asientos: MesaResponse["asientos"];
}

function AlertDialog({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="alert-dialog" {...props} />;
}

function AlertDialogPortal({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal data-slot="alert-dialog-portal" {...props} />;
}

function AlertDialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      data-slot="alert-dialog-overlay"
      className={cn(
        "fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        className,
      )}
      {...props}
    />
  );
}

function AlertDialogContent({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content>) {
  return (
    <AlertDialogPortal>
      <AlertDialogOverlay />
      <DialogPrimitive.Content
        data-slot="alert-dialog-content"
        className={cn(
          "fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border border-[#669649] bg-white p-6 text-foreground shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 dark:border-[#1a5032] dark:bg-[#0f141a] dark:text-white sm:max-w-lg",
          className,
        )}
        {...props}
      />
    </AlertDialogPortal>
  );
}

function AlertDialogHeader({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("flex flex-col gap-2 text-center sm:text-left", className)}
      {...props}
    />
  );
}

function AlertDialogFooter({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        className,
      )}
      {...props}
    />
  );
}

function AlertDialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      className={cn("text-lg font-semibold", className)}
      {...props}
    />
  );
}

function AlertDialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

function AlertDialogAction({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return (
    <DialogPrimitive.Close
      className={cn(buttonVariants({ variant: "destructive" }), className)}
      {...props}
    />
  );
}

function AlertDialogCancel({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return (
    <DialogPrimitive.Close
      className={cn(buttonVariants({ variant: "outline" }), className)}
      {...props}
    />
  );
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
  const [showFullTableInfoDialog, setShowFullTableInfoDialog] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [selectedRepresentative, setSelectedRepresentative] =
    useState<string>("");
  const [openRepresentativeSearch, setOpenRepresentativeSearch] =
    useState(false);
  const [representatives, setRepresentatives] = useState<
    RepresentanteResponse[]
  >([]);
  const [cargos, setCargos] = useState<GenericType[]>([]);
  const [loadingRepresentatives, setLoadingRepresentatives] = useState(false);
  const [showAddRepresentativeDialog, setShowAddRepresentativeDialog] =
    useState(false);
  const [pendingSeatAction, setPendingSeatAction] = useState<{
    asiento: AsientoResponse;
    action: "cancel" | "delete";
  } | null>(null);
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

  const isAdmin = userFromStore?.is_superuser === true;

  const transformMesasToTables = (mesasData: MesaResponse[]): TableUIData[] =>
    mesasData.map((mesa) => {
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

  const refreshTables = useCallback(async () => {
    if (!turnoId) return;

    const mesasData = await getMesasByTurnoId(parseInt(turnoId));
    setTables(transformMesasToTables(mesasData));
  }, [turnoId]);

  const validRepresentatives = representatives.filter(
    (
      rep,
    ): rep is RepresentanteResponse & {
      id: number;
    } => typeof rep?.id === "number",
  );

  const tutorialSteps = [
    {
      title: "Selección de Mesas",
      description:
        "Aquí podés ver todas las mesas disponibles del turno. Cada mesa puede tener hasta 2 empresas para una reunión 1 a 1. Las mesas se muestran con diferentes colores según su estado.",
      icon: (
        <div className="grid grid-cols-4 gap-2">
          <div className="w-12 h-12 bg-transparent border-2 border-slate-400 dark:border-slate-500 rounded-lg" />
          <div className="w-12 h-12 bg-transparent border-2 border-[#68A243] dark:border-[#68A243] rounded-lg" />
          <div className="w-12 h-12 bg-transparent border-2 border-[#ffb900] dark:border-[#ffb900] rounded-lg" />
          <div className="w-12 h-12 bg-slate-300 border-2 border-slate-500 dark:bg-slate-700 dark:border-slate-600 rounded-lg" />
        </div>
      ),
    },
    {
      title: (
        <div className="flex items-center gap-2 flex-wrap">
          <span>Mesa Libre</span>
          <div className="w-5 h-5 sm:w-6 sm:h-6 bg-transparent border-2 border-slate-400 dark:border-slate-500 rounded" />
        </div>
      ),
      description:
        "Las mesas de color blanco están completamente libres. Si elegís una mesa libre, vas a ser el primero en reservarla y otra empresa podrá unirse después para completar la reunión.",
    },
    {
      title: (
        <div className="flex items-center gap-2 flex-wrap">
          <span>Mesa Parcial</span>
          <div className="w-5 h-5 sm:w-6 sm:h-6 bg-transparent border-2 border-[#68A243] dark:border-[#68A243] rounded" />
        </div>
      ),
      description:
        "Las mesas verdes ya tienen una empresa esperando. Si elegís una de estas mesas, vas a unirte directamente con esa empresa para una reunión 1 a 1. Podés ver el logo y nombre de la empresa antes de confirmar.",
    },
    {
      title: (
        <div className="flex items-center gap-2 flex-wrap">
          <span>Tu Empresa Esperando</span>
          <div className="w-5 h-5 sm:w-6 sm:h-6 bg-transparent border-2 border-[#ffb900] dark:border-[#ffb900] rounded" />
        </div>
      ),
      description:
        "Las mesas naranjas tienen un representante de tu empresa esperando. Si elegís una de estas mesas, podrás cambiar el representante de tu empresa que ya está asignado.",
    },
    {
      title: (
        <div className="flex items-center gap-2 flex-wrap">
          <span>Mesa Completa</span>
          <div className="w-5 h-5 sm:w-6 sm:h-6 bg-slate-300 border-2 border-slate-500 dark:bg-slate-700 dark:border-slate-600 rounded" />
        </div>
      ),
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
        await refreshTables();
        setError(null);
      } catch (err) {
        console.error("Error cargando mesas:", err);
        if (!isSessionExpiredError(err)) {
          setError("Error al cargar las mesas");
        }
      } finally {
        setLoading(false);
      }
    };

    loadTables();
  }, [turnoId, refreshTables]);

  useEffect(() => {
    const loadCargos = async () => {
      try {
        const data = await getCargos();
        setCargos(data);
      } catch (err) {
        console.error("Error cargando cargos:", err);
        toast.error("No se pudieron cargar los cargos.");
      }
    };

    loadCargos();
  }, []);

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
        const orderedRepresentatives = [...own, ...others];
        setRepresentatives(orderedRepresentatives);
        return orderedRepresentatives;
      } else {
        setRepresentatives(data);
        return data;
      }
    } catch (err) {
      console.error("Error cargando representantes:", err);
      if (!isSessionExpiredError(err)) {
        toast.error("No se pudieron cargar los representantes.");
      }
      return [];
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
    const isMyCompanyAtFullTable =
      table.status === "full" &&
      table.asientos.some(
        (asiento) => asiento.empresa_id === userFromStore?.empresa_id,
      );

    if (table.status === "full" && !isMyCompanyAtFullTable && !isAdmin) {
      return;
    }

    setSelectedTable(table);
    setSelectedRepresentative("");

    if (table.status === "full" && (isMyCompanyAtFullTable || isAdmin)) {
      setShowFullTableInfoDialog(true);
      return;
    }

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

  const closeSeatDialogs = () => {
    setShowConfirmDialog(false);
    setShowChangeRepDialog(false);
    setShowFullTableInfoDialog(false);
    setSelectedRepresentative("");
  };

  const requestCancelSeat = (asiento: AsientoResponse) => {
    if (asiento.empresa_id !== userFromStore?.empresa_id) {
      toast.error("Solo podés salir de un asiento de tu propia empresa.");
      return;
    }

    setPendingSeatAction({ asiento, action: "cancel" });
  };

  const requestDeleteSeat = (asiento: AsientoResponse) => {
    if (!isAdmin) {
      toast.error("No tenés permisos para eliminar asientos.");
      return;
    }

    setPendingSeatAction({ asiento, action: "delete" });
  };

  const handleCancelSeat = async (asiento: AsientoResponse) => {
    if (asiento.empresa_id !== userFromStore?.empresa_id) {
      toast.error("Solo podés salir de un asiento de tu propia empresa.");
      return;
    }

    setSubmittingBooking(true);

    try {
      await cancelAsiento(asiento.id);
      toast.success("Saliste de la mesa correctamente.");
      closeSeatDialogs();
      await refreshTables();
    } catch (err) {
      console.error("Error cancelando asiento:", err);
      const errorMessage = getApiErrorMessage(err, "Error al salir de la mesa");

      if (errorMessage) {
        toast.error(errorMessage);
      }
    } finally {
      setSubmittingBooking(false);
    }
  };

  const handleDeleteSeat = async (asiento: AsientoResponse) => {
    if (!isAdmin) {
      toast.error("No tenés permisos para eliminar asientos.");
      return;
    }

    setSubmittingBooking(true);

    try {
      await deleteAsiento(asiento.id);
      toast.success("Asiento eliminado correctamente.");
      closeSeatDialogs();
      await refreshTables();
    } catch (err) {
      console.error("Error eliminando asiento:", err);
      const errorMessage = getApiErrorMessage(
        err,
        "Error al eliminar el asiento",
      );

      if (errorMessage) {
        toast.error(errorMessage);
      }
    } finally {
      setSubmittingBooking(false);
    }
  };

  const handleConfirmSeatAction = async () => {
    if (!pendingSeatAction) return;

    const { asiento, action } = pendingSeatAction;
    setPendingSeatAction(null);

    if (action === "cancel") {
      await handleCancelSeat(asiento);
      return;
    }

    await handleDeleteSeat(asiento);
  };

  const ownSeatInSelectedTable = selectedTable?.asientos.find(
    (asiento) => asiento.empresa_id === userFromStore?.empresa_id,
  );

  const seatActionLabel =
    pendingSeatAction?.action === "delete"
      ? "Eliminar asiento"
      : "Salir de la mesa";

  const seatActionDescription = pendingSeatAction
    ? pendingSeatAction.action === "delete"
      ? `Vas a eliminar el asiento de ${pendingSeatAction.asiento.empresa_nombre}. Si la mesa queda con una sola empresa, el backend debería marcarla como no completa y reasignar anfitrión cuando corresponda.`
      : `Vas a darte de baja de la mesa de ${pendingSeatAction.asiento.empresa_nombre}. Si eras anfitrión y queda otra empresa en la mesa, el backend debería reasignar ese rol automáticamente.`
    : "";

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
      const formSnapshot = { ...newRepForm };
      const nuevo = await createRepresentante(newRepForm);

      let representativeId =
        typeof nuevo?.id === "number" ? nuevo.id.toString() : undefined;

      if (representativeId) {
        setRepresentatives((prev) => [...prev, nuevo]);
      } else {
        const refreshedRepresentatives = await loadRepresentatives();
        const createdRepresentative = refreshedRepresentatives.find(
          (rep) =>
            rep.email === formSnapshot.email &&
            rep.nombre === formSnapshot.nombre &&
            rep.apellido === formSnapshot.apellido &&
            typeof rep.id === "number",
        );

        if (createdRepresentative) {
          representativeId = createdRepresentative.id.toString();
        }
      }

      if (representativeId) {
        setSelectedRepresentative(representativeId);
      }

      toast.success("Representante agregado correctamente");
      setShowAddRepresentativeDialog(false);
      setNewRepForm({ nombre: "", apellido: "", email: "", cargo: 0 });
      setNewRepErrors({});

      if (!representativeId) {
        toast.warning(
          "El representante se creó, pero no se pudo autoseleccionar.",
        );
      }
    } catch (err) {
      console.error("Error creando representante:", err);
      toast.error("No se pudo agregar el representante. Intentá de nuevo.");
    } finally {
      setSubmittingNewRep(false);
    }
  };

  const handleNewRepChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setNewRepForm((prev) => ({
      ...prev,
      [name]: name === "cargo" ? Number(value) : value,
    }));
    setNewRepErrors((prev) => ({ ...prev, [name]: undefined }));
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
      await refreshTables();

      // Ocultar el mensaje de éxito después de 3 segundos
      setTimeout(() => {
        setBookingSuccess(false);
      }, 3000);
    } catch (err) {
      console.error("Error confirmando reserva:", err);
      const errorMessage = getApiErrorMessage(
        err,
        "Error al confirmar la reserva",
      );
      if (errorMessage) {
        toast.error(errorMessage);
      }
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
      await refreshTables();
    } catch (err) {
      console.error("Error cambiando representante:", err);
      const errorMessage = getApiErrorMessage(
        err,
        "Error al cambiar el representante",
      );
      if (errorMessage) {
        toast.error(errorMessage);
      }
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

                const hostCompanyName =
                  table.status === "partial" && table.asientos[0]
                    ? table.asientos[0].empresa_nombre
                    : null;

                const isMyCompany =
                  table.status === "partial" &&
                  table.asientos[0] &&
                  table.asientos[0].empresa_id === userFromStore?.empresa_id;

                const isMyCompanyAtFullTable =
                  table.status === "full" &&
                  table.asientos.some(
                    (asiento) =>
                      asiento.empresa_id === userFromStore?.empresa_id,
                  );

                const canInspectFullTable =
                  table.status === "full" &&
                  (isMyCompanyAtFullTable || isAdmin);

                return (
                  <button
                    key={table.id}
                    onClick={() => handleTableClick(table)}
                    disabled={table.status === "full" && !canInspectFullTable}
                    className={`
                      relative aspect-square rounded-lg border-2 transition-all duration-300 ease-out
                      flex flex-col items-center justify-center p-3
                      ${
                        table.status === "full"
                          ? canInspectFullTable
                            ? "bg-gray-200 dark:bg-gray-700 border-gray-400 dark:border-gray-600 opacity-50 cursor-pointer hover:scale-105 hover:shadow-lg"
                            : "bg-gray-200 dark:bg-gray-700 border-gray-400 dark:border-gray-600 opacity-50 cursor-not-allowed"
                          : table.status === "partial"
                            ? isMyCompany
                              ? "bg-[#ffb900]/10 border-[#ffb900] hover:bg-[#ffb900]/20 hover:scale-105 hover:shadow-lg cursor-pointer dark:bg-[#ffb900]/10 dark:border-[#ffb900]"
                              : "bg-[#68A243]/10 border-[#68A243] hover:bg-[#68A243]/20 hover:scale-105 hover:shadow-lg cursor-pointer dark:bg-[#68A243]/10 dark:border-[#68A243]"
                            : "bg-white dark:bg-[#0f2f25] border-gray-300 dark:border-gray-600 hover:border-[#68A243] hover:scale-105 hover:shadow-lg cursor-pointer dark:hover:border-[#68A243] dark:hover:shadow-[#68A243]/20"
                      }
                    `}
                    style={{
                      animation: `fadeInUp 0.5s ease-out ${index * 0.05}s both`,
                    }}
                  >
                    {isMyCompanyAtFullTable && (
                      <div className="absolute top-1.5 right-1.5 rounded-full border border-white/40 bg-white/90 px-2 py-0.5 text-[10px] font-semibold text-[#143E29] shadow-sm dark:border-white/20 dark:bg-[#0f2f25] dark:text-white">
                        Tu empresa
                      </div>
                    )}

                    <div className="text-center">
                      <p className="font-bold text-lg text-[#143E29] dark:text-white mb-1 transition-colors duration-300">
                        {table.number}
                      </p>

                      {table.status === "partial" &&
                      (hostName || hostCompanyName) ? (
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
                            {isMyCompany ? hostName : hostCompanyName}
                          </p>
                          {isMyCompany && (
                            <p className="text-[10px] text-[#ffb900] font-semibold">
                              Tu empresa
                            </p>
                          )}
                        </div>
                      ) : table.status === "full" ? (
                        <div className="flex flex-col items-center gap-1">
                          <p className="text-xs text-gray-500 dark:text-gray-200 transition-colors duration-300">
                            Completa
                          </p>
                          {isMyCompanyAtFullTable && (
                            <p className="text-[10px] font-semibold text-[#143E29] dark:text-white transition-colors duration-300">
                              Ya sentado
                            </p>
                          )}
                        </div>
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
          <DialogContent className="sm:max-w-md bg-white dark:bg-[#0F141A] text-foreground dark:text-white border-[#669649] dark:border-[#1a5032]">
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

                    {isAdmin && (
                      <div className="mt-4 border-t border-[#68A243]/15 pt-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                          Gestion administrativa
                        </p>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() =>
                            requestDeleteSeat(selectedTable.asientos[0])
                          }
                          disabled={submittingBooking}
                          className="mt-3 w-full sm:w-auto"
                        >
                          <Trash2 className="h-4 w-4" />
                          Eliminar asiento
                        </Button>
                      </div>
                    )}
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
              ) : validRepresentatives.length > 0 ? (
                <div className="relative">
                  <Popover
                    open={openRepresentativeSearch}
                    onOpenChange={setOpenRepresentativeSearch}
                  >
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openRepresentativeSearch}
                        className="w-full justify-between h-10 !border-[#68A243]/20 hover:!border-[#68A243]/50 !focus-visible:border-[#68A243] !focus-visible:ring-[#68A243]/20 !bg-white hover:!bg-gray-50 dark:!bg-[#143E29] dark:hover:!bg-[#1a3f30] dark:!border-[#68A243]/20 dark:hover:!border-[#68A243]/40 !text-gray-900 dark:!text-white transition-colors duration-300"
                      >
                        <span className="flex-1 text-left">
                          {selectedRepresentative
                            ? validRepresentatives.find(
                                (rep) =>
                                  rep.id.toString() === selectedRepresentative,
                              )
                              ? `${
                                  validRepresentatives.find(
                                    (rep) =>
                                      rep.id.toString() ===
                                      selectedRepresentative,
                                  )?.nombre
                                } ${
                                  validRepresentatives.find(
                                    (rep) =>
                                      rep.id.toString() ===
                                      selectedRepresentative,
                                  )?.apellido
                                }`
                              : "Buscá y seleccioná un representante"
                            : "Buscá y seleccioná un representante"}
                        </span>
                        {!selectedRepresentative && (
                          <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-[var(--radix-popover-trigger-width)] p-0 dark:bg-[#143E29] dark:border-[#68A243]/20"
                      align="start"
                      side="bottom"
                      sideOffset={4}
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
                              {validRepresentatives.map((rep) => {
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
                                          isOwn
                                            ? "bg-[#ffb900]"
                                            : "bg-[#68A243]",
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
                            <div className="border-t border-[#68A243]/20 p-2">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setShowAddRepresentativeDialog(true);
                                  setOpenRepresentativeSearch(false);
                                }}
                                disabled={!!selectedRepresentative}
                                className="w-full text-[#68A243] dark:text-[#68A243] hover:bg-[#68A243]/10 dark:hover:bg-[#68A243]/15 disabled:opacity-50 disabled:cursor-not-allowed justify-start text-xs h-8"
                              >
                                <Plus className="h-3 w-3 mr-2" />
                                Cargar nuevo representante
                              </Button>
                            </div>
                          </CommandList>
                        </Command>
                      )}
                    </PopoverContent>
                  </Popover>
                  {selectedRepresentative && (
                    <button
                      onClick={() => {
                        setSelectedRepresentative("");
                        setOpenRepresentativeSearch(false);
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:opacity-100 opacity-70 transition-opacity z-10"
                    >
                      <X className="h-4 w-4 text-[#68A243]" />
                    </button>
                  )}
                </div>
              ) : (
                <div className="text-sm text-[#F05826] dark:text-orange-400 bg-[#F05826]/10 dark:bg-orange-950/20 p-3 rounded-lg border border-[#F05826]/30 dark:border-orange-700/30 transition-colors duration-300">
                  No tenés representantes agregados.
                </div>
              )}
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
          open={showFullTableInfoDialog}
          onOpenChange={setShowFullTableInfoDialog}
        >
          <DialogContent className="sm:max-w-lg bg-white dark:bg-[#0F141A] text-foreground dark:text-white border-[#669649] dark:border-[#1a5032]">
            <DialogHeader>
              <DialogTitle className="text-[#143E29] dark:text-white transition-colors duration-300">
                Reunión confirmada en mesa {selectedTable?.number}
              </DialogTitle>
              <DialogDescription className="dark:text-gray-300 transition-colors duration-300">
                Esta mesa ya está completa. Aquí podés ver con qué empresa tenés
                la reunión y qué representantes asisten.
              </DialogDescription>
            </DialogHeader>

            {selectedTable && (
              <div className="space-y-4">
                {selectedTable.asientos.map((asiento) => {
                  const isOwnCompany =
                    asiento.empresa_id === userFromStore?.empresa_id;

                  return (
                    <Card
                      key={asiento.id}
                      className="border-gray-200 dark:border-[#68A243]/20 dark:bg-[#143E29]"
                    >
                      <CardContent className="pt-6">
                        <div className="flex items-start gap-4">
                          <div
                            className={cn(
                              "h-12 w-12 rounded-full flex items-center justify-center text-white text-sm font-bold",
                              isOwnCompany ? "bg-[#ffb900]" : "bg-[#68A243]",
                            )}
                          >
                            {asiento.empresa_nombre
                              ?.substring(0, 1)
                              .toUpperCase()}
                          </div>
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-semibold text-[#143E29] dark:text-white">
                                {asiento.empresa_nombre}
                              </p>
                              {isOwnCompany && (
                                <Badge className="bg-[#ffb900]/10 text-[#ffb900] hover:bg-[#ffb900]/20">
                                  Tu empresa
                                </Badge>
                              )}
                              {asiento.anfitriona && (
                                <Badge className="bg-[#68A243]/10 text-[#68A243] hover:bg-[#68A243]/20">
                                  Anfitrión
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              Representante:{" "}
                              {asiento.representante_nombre || "Sin nombre"}{" "}
                              {asiento.representante_apellido || ""}
                            </p>
                            {asiento.representante_email && (
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {asiento.representante_email}
                              </p>
                            )}

                            <div className="flex flex-wrap gap-2 pt-3">
                              {isAdmin && (
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => requestDeleteSeat(asiento)}
                                  disabled={submittingBooking}
                                >
                                  <Trash2 className="h-4 w-4" />
                                  Eliminar asiento
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}

                <Button
                  variant="outline"
                  onClick={() => setShowFullTableInfoDialog(false)}
                  className={cn(
                    "dark:bg-[#0f2f25] dark:border-[#68A243]/20 dark:text-white dark:hover:bg-[#1a3f30] transition-colors duration-300",
                    ownSeatInSelectedTable ? "flex-1" : "w-full",
                  )}
                >
                  Cerrar
                </Button>
                {ownSeatInSelectedTable && (
                  <div className="rounded-xl border border-[#ffb900]/30 bg-[#ffb900]/8 p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm font-semibold text-[#143E29] dark:text-white">
                          Tu participacion en esta reunion
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-300">
                          Si salis de la mesa, tu asiento se cancela y la
                          reunion vuelve a actualizarse segun la logica del
                          backend.
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() =>
                          requestCancelSeat(ownSeatInSelectedTable)
                        }
                        disabled={submittingBooking}
                        className="border-[#ffb900]/40 bg-white/70 text-[#b57b00] hover:bg-[#ffb900]/12 hover:border-[#ffb900] dark:bg-[#0f2f25] dark:text-[#ffb900] dark:hover:bg-[#ffb900]/10"
                      >
                        <LogOut className="h-4 w-4" />
                        Salir de la mesa
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        <Dialog
          open={showChangeRepDialog}
          onOpenChange={setShowChangeRepDialog}
        >
          <DialogContent className="sm:max-w-md bg-white dark:bg-[#0F141A] text-foreground dark:text-white border-[#669649] dark:border-[#1a5032]">
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

                    <div className="mt-4 rounded-xl border border-[#ffb900]/30 bg-[#ffb900]/8 p-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-sm font-semibold text-[#143E29] dark:text-white">
                            Gestion de tu asiento
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-300">
                            Podes cambiar el representante o salir de la mesa si
                            ya no vas a participar.
                          </p>
                        </div>
                        <div className="flex flex-wrap justify-end gap-2">
                          <Button
                            variant="outline"
                            onClick={() =>
                              requestCancelSeat(selectedTable.asientos[0])
                            }
                            disabled={submittingBooking}
                            className="border-[#ffb900]/40 bg-white/70 text-[#b57b00] hover:bg-[#ffb900]/12 hover:border-[#ffb900] dark:bg-[#0f2f25] dark:text-[#ffb900] dark:hover:bg-[#ffb900]/10"
                          >
                            <LogOut className="h-4 w-4" />
                            Salir de la mesa
                          </Button>
                          {isAdmin && (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() =>
                                requestDeleteSeat(selectedTable.asientos[0])
                              }
                              disabled={submittingBooking}
                            >
                              <Trash2 className="h-4 w-4" />
                              Eliminar asiento
                            </Button>
                          )}
                        </div>
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
              ) : validRepresentatives.length > 0 ? (
                <div className="relative">
                  <Popover
                    open={openRepresentativeSearch}
                    onOpenChange={setOpenRepresentativeSearch}
                  >
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openRepresentativeSearch}
                        className="w-full justify-between h-10 !border-[#ffb900]/20 hover:!border-[#ffb900]/50 !focus-visible:border-[#ffb900] !focus-visible:ring-[#ffb900]/20 !bg-white hover:!bg-gray-50 dark:!bg-[#143E29] dark:hover:!bg-[#1a3f30] dark:!border-[#ffb900]/20 dark:hover:!border-[#ffb900]/40 !text-gray-900 dark:!text-white transition-colors duration-300"
                      >
                        <span className="flex-1 text-left">
                          {selectedRepresentative
                            ? validRepresentatives.find(
                                (rep) =>
                                  rep.id.toString() === selectedRepresentative,
                              )
                              ? `${
                                  validRepresentatives.find(
                                    (rep) =>
                                      rep.id.toString() ===
                                      selectedRepresentative,
                                  )?.nombre
                                } ${
                                  validRepresentatives.find(
                                    (rep) =>
                                      rep.id.toString() ===
                                      selectedRepresentative,
                                  )?.apellido
                                }`
                              : "Buscá y seleccioná un representante"
                            : "Buscá y seleccioná un representante"}
                        </span>
                        {!selectedRepresentative && (
                          <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-[var(--radix-popover-trigger-width)] p-0 dark:bg-[#143E29] dark:border-[#68A243]/20"
                      align="start"
                      side="bottom"
                      sideOffset={4}
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
                              {validRepresentatives.map((rep) => {
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
                                          isOwn
                                            ? "bg-[#ffb900]"
                                            : "bg-[#68A243]",
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
                            <div className="border-t border-[#ffb900]/20 p-2">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setShowAddRepresentativeDialog(true);
                                  setOpenRepresentativeSearch(false);
                                }}
                                disabled={!!selectedRepresentative}
                                className="w-full text-[#ffb900] dark:text-[#ffb900] hover:bg-[#ffb900]/10 dark:hover:bg-[#ffb900]/15 disabled:opacity-50 disabled:cursor-not-allowed justify-start text-xs h-8"
                              >
                                <Plus className="h-3 w-3 mr-2" />
                                Cargar nuevo representante
                              </Button>
                            </div>
                          </CommandList>
                        </Command>
                      )}
                    </PopoverContent>
                  </Popover>
                  {selectedRepresentative && (
                    <button
                      onClick={() => {
                        setSelectedRepresentative("");
                        setOpenRepresentativeSearch(false);
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:opacity-100 opacity-70 transition-opacity z-10"
                    >
                      <X className="h-4 w-4 text-[#ffb900]" />
                    </button>
                  )}
                </div>
              ) : (
                <div className="text-sm text-[#F05826] bg-[#F05826]/10 p-3 rounded-lg border border-[#F05826]/30">
                  No tenés representantes agregados.
                </div>
              )}
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
          <AddRepresentativeModal
            open={showAddRepresentativeDialog}
            onOpenChange={setShowAddRepresentativeDialog}
            form={newRepForm}
            formErrors={newRepErrors}
            submitting={submittingNewRep}
            onChange={handleNewRepChange}
            onSubmit={handleAddRepresentative}
            cargos={cargos}
            title="Nuevo Representante"
            description="Agregá un nuevo representante de tu empresa para esta reunión"
          />
        </Dialog>

        <AlertDialog
          open={pendingSeatAction !== null}
          onOpenChange={(open: boolean) => {
            if (!open) {
              setPendingSeatAction(null);
            }
          }}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{seatActionLabel}</AlertDialogTitle>
              <AlertDialogDescription>
                {seatActionDescription}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-[#68A243]/15 dark:bg-[#143E29]">
              <p className="text-sm font-semibold text-[#143E29] dark:text-white">
                {pendingSeatAction?.asiento.empresa_nombre}
              </p>
              <p className="mt-1 text-xs text-gray-600 dark:text-gray-300">
                Representante:{" "}
                {pendingSeatAction?.asiento.representante_nombre ||
                  "Sin nombre"}{" "}
                {pendingSeatAction?.asiento.representante_apellido || ""}
              </p>
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={submittingBooking}>
                Volver
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirmSeatAction}
                disabled={submittingBooking}
              >
                {submittingBooking
                  ? "Procesando..."
                  : pendingSeatAction?.action === "delete"
                    ? "Eliminar asiento"
                    : "Confirmar salida"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <HelpTutorial title="Guía de Selección de Mesas" steps={tutorialSteps} />

      <Footer />
    </>
  );
}
