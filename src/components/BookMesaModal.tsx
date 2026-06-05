import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../components/ui/dialog";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Label } from "../components/ui/label";
import { Skeleton } from "../components/ui/skeleton";
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
import type { EmpresaResponse } from "../types/Empresa";
import type { MesaEmpresaResponse } from "../types/Mesa";
import type { RepresentanteResponse } from "../types/Representante";
import { getMesasByEmpresaId } from "../api/MesaService";
import { getRepresentantes } from "../api/RepresentanteService";
import { createAsiento } from "../api/AsientoService";
import { getApiErrorMessage } from "../lib/axios";
import { cn } from "../lib/utils";
import { useUserStore } from "../store/userStore";
import { toast } from "sonner";
import {
  Check,
  ChevronDown,
  Clock,
  Loader2,
  Search,
  TableProperties,
  Users,
} from "lucide-react";

interface BookMesaModalProps {
  company: EmpresaResponse | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function BookMesaModal({
  company,
  open,
  onOpenChange,
}: BookMesaModalProps) {
  const { user } = useUserStore();
  const [mesasDisponibles, setMesasDisponibles] = useState<
    MesaEmpresaResponse[]
  >([]);
  const [representantes, setRepresentantes] = useState<RepresentanteResponse[]>(
    [],
  );
  const [selectedMesaId, setSelectedMesaId] = useState<number | null>(null);
  const [selectedRepresentativeId, setSelectedRepresentativeId] =
    useState<string>("");
  const [openRepresentativeSearch, setOpenRepresentativeSearch] =
    useState(false);
  const [loadingBookingData, setLoadingBookingData] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [submittingBooking, setSubmittingBooking] = useState(false);

  const selectedMesa = useMemo(
    () => mesasDisponibles.find((mesa) => mesa.id === selectedMesaId) ?? null,
    [mesasDisponibles, selectedMesaId],
  );

  const selectedRepresentative = useMemo(
    () =>
      representantes.find(
        (representante) =>
          representante.id.toString() === selectedRepresentativeId,
      ) ?? null,
    [representantes, selectedRepresentativeId],
  );

  const canBookMesa = useMemo(() => {
    if (!company) return false;

    return Boolean(
      user?.aprobada && user?.empresa_id && user.empresa_id !== company.id,
    );
  }, [company, user?.aprobada, user?.empresa_id]);

  const bookingAccessMessage = useMemo(() => {
    if (!company) return null;
    if (!user?.aprobada) {
      return "Tu empresa todavía está pendiente de aprobación.";
    }
    if (!user?.empresa_id) {
      return "No pudimos identificar tu empresa.";
    }
    if (company.id === user.empresa_id) {
      return "Esta es tu propia empresa. Abrí otra empresa participante para anotarte en una mesa.";
    }

    return null;
  }, [company, user?.aprobada, user?.empresa_id]);

  const loadBookingData = useCallback(async () => {
    if (!company || !canBookMesa || !user?.empresa_id) {
      setMesasDisponibles([]);
      setRepresentantes([]);
      setSelectedMesaId(null);
      setSelectedRepresentativeId("");
      setBookingError(null);
      setLoadingBookingData(false);
      return;
    }

    setLoadingBookingData(true);
    setBookingError(null);

    try {
      const [mesasResponse, representativesResponse] = await Promise.all([
        getMesasByEmpresaId(company.id),
        getRepresentantes({ empresa: user.empresa_id }),
      ]);

      const mesasOrdenadas = [...mesasResponse.mesas].sort(
        (a, b) => a.num_mesa - b.num_mesa,
      );

      const representantesValidos = representativesResponse
        .filter((representante) => typeof representante.id === "number")
        .sort((a, b) => {
          const nombreA = `${a.nombre} ${a.apellido}`.trim();
          const nombreB = `${b.nombre} ${b.apellido}`.trim();
          return nombreA.localeCompare(nombreB);
        });

      setMesasDisponibles(mesasOrdenadas);
      setRepresentantes(representantesValidos);
      setSelectedMesaId((currentSelectedMesaId) =>
        mesasOrdenadas.some((mesa) => mesa.id === currentSelectedMesaId)
          ? currentSelectedMesaId
          : (mesasOrdenadas[0]?.id ?? null),
      );
    } catch (error) {
      setBookingError(
        getApiErrorMessage(
          error,
          "No se pudieron cargar las mesas disponibles.",
        ) ?? "No se pudieron cargar las mesas disponibles.",
      );
      setMesasDisponibles([]);
      setRepresentantes([]);
      setSelectedMesaId(null);
      setSelectedRepresentativeId("");
    } finally {
      setLoadingBookingData(false);
    }
  }, [company, user?.empresa_id, canBookMesa]);

  useEffect(() => {
    if (!open || !company) {
      setMesasDisponibles([]);
      setRepresentantes([]);
      setSelectedMesaId(null);
      setSelectedRepresentativeId("");
      setOpenRepresentativeSearch(false);
      setBookingError(null);
      setLoadingBookingData(false);
      return;
    }

    void loadBookingData();
  }, [company, loadBookingData, open]);

  const handleBookMesa = async () => {
    if (!company) return;

    if (!canBookMesa) {
      toast.error(bookingAccessMessage ?? "No tenés permisos para anotarte.");
      return;
    }

    if (!selectedMesa) {
      toast.error("Seleccioná una mesa disponible.");
      return;
    }

    if (!selectedRepresentative) {
      toast.error("Seleccioná un representante.");
      return;
    }

    if (!user?.empresa_id) {
      toast.error("No se encontró tu empresa. Iniciá sesión nuevamente.");
      return;
    }

    setSubmittingBooking(true);

    try {
      await createAsiento({
        mesa: selectedMesa.id,
        empresa: user.empresa_id,
        representante: selectedRepresentative.id,
      });

      toast.success("Te anotaste correctamente en la mesa.");
      setSelectedRepresentativeId("");
      await loadBookingData();
    } catch (error) {
      const message = getApiErrorMessage(
        error,
        "No se pudo completar la inscripción en la mesa.",
      );

      if (message) {
        toast.error(message);
      }
    } finally {
      setSubmittingBooking(false);
    }
  };

  if (!company) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto transition-colors bg-white dark:bg-[#0F141A] text-foreground dark:text-white border-[#669649] dark:border-[#1a5032]">
        <DialogHeader>
          <div className="flex flex-col items-center text-center space-y-4 pb-4">
            <div>
              <DialogTitle className="text-2xl font-bold text-[#143E29] dark:text-white mb-2 transition-colors">
                Mesas libres en {company.razon_social}
              </DialogTitle>
              <DialogDescription className="text-base dark:text-gray-300 transition-colors">
                Selecciona una mesa y un representante para confirmarte
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-3 rounded-xl border border-[#68A243]/15 bg-[#68A243]/5 dark:bg-[#68A243]/10 p-4 transition-colors">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 text-[#143E29] dark:text-white transition-colors">
                  <Users className="h-4 w-4 text-[#68A243]" />
                  <h3 className="font-semibold">Mesas libres</h3>
                </div>
                <p className="mt-1 text-sm text-muted-foreground dark:text-gray-300 transition-colors">
                  Selecciona una mesa disponible para reservar tu lugar
                </p>
              </div>

              <Badge className="bg-[#68A243] hover:bg-[#68A243]/90 text-white whitespace-nowrap">
                <TableProperties className="mr-1 h-3 w-3" />
                {mesasDisponibles.length} disponibles
              </Badge>
            </div>

            {!canBookMesa ? (
              <div className="rounded-lg border border-dashed border-[#68A243]/20 bg-white/70 dark:bg-[#0f141a] p-4 text-sm text-muted-foreground dark:text-gray-300 transition-colors">
                {bookingAccessMessage}
              </div>
            ) : loadingBookingData ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[...Array(4)].map((_, index) => (
                  <div
                    key={index}
                    className="rounded-lg border border-[#68A243]/15 bg-white dark:bg-[#11161d] p-4"
                  >
                    <Skeleton className="h-4 w-24 mb-3" />
                    <Skeleton className="h-6 w-20 mb-2" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                ))}
              </div>
            ) : bookingError ? (
              <div className="rounded-lg border border-red-200 bg-red-50 dark:border-red-950/40 dark:bg-red-950/20 p-4 text-sm text-red-800 dark:text-red-300 transition-colors">
                <div className="flex items-start gap-2">
                  <Clock className="mt-0.5 h-4 w-4 flex-shrink-0" />
                  <div className="space-y-3">
                    <p>{bookingError}</p>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => void loadBookingData()}
                      className="border-red-200 bg-white text-red-800 hover:bg-red-100 dark:border-red-900/40 dark:bg-transparent dark:text-red-300 dark:hover:bg-red-950/30"
                    >
                      <Search className="mr-2 h-4 w-4" />
                      Reintentar
                    </Button>
                  </div>
                </div>
              </div>
            ) : mesasDisponibles.length === 0 ? (
              <div className="rounded-lg border border-dashed border-[#68A243]/20 bg-white/80 dark:bg-[#11161d] p-4 text-sm text-muted-foreground dark:text-gray-300 transition-colors">
                Esta empresa no tiene mesas libres para anotarte en este
                momento.
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  {mesasDisponibles.map((mesa) => {
                    const isSelected = mesa.id === selectedMesaId;

                    return (
                      <button
                        key={mesa.id}
                        type="button"
                        onClick={() => setSelectedMesaId(mesa.id)}
                        className={cn(
                          "relative aspect-square rounded-lg border-2 p-3 transition-all duration-200 flex flex-col items-center justify-center text-center",
                          isSelected
                            ? "border-[#68A243] bg-[#68A243]/10 shadow-sm dark:bg-[#68A243]/15"
                            : "border-gray-300 bg-white hover:border-[#68A243] hover:scale-105 hover:shadow-lg dark:border-gray-600 dark:bg-[#0f141a] dark:hover:border-[#68A243]",
                        )}
                      >
                        {isSelected && (
                          <div className="absolute top-2 right-2 rounded-full bg-[#68A243] text-white p-1">
                            <Check className="h-3.5 w-3.5" />
                          </div>
                        )}
                        <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground dark:text-gray-400">
                          Mesa
                        </span>
                        <span className="mt-2 text-3xl font-bold text-[#143E29] dark:text-white">
                          {mesa.num_mesa}
                        </span>
                        <span className="mt-2 text-[11px] uppercase tracking-[0.2em] text-[#68A243] dark:text-[#a7d198]">
                          Libre
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="rounded-lg border border-[#68A243]/15 bg-white dark:bg-[#11161d] p-4 transition-colors">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground dark:text-gray-400">
                        Confirmación
                      </p>
                      <h4 className="mt-1 text-base font-semibold text-[#143E29] dark:text-white">
                        {selectedMesa
                          ? `Mesa ${selectedMesa.num_mesa}`
                          : "Elegí una mesa"}
                      </h4>
                    </div>
                    <Badge className="bg-[#68A243]/10 text-[#143E29] hover:bg-[#68A243]/10 dark:bg-[#68A243]/20 dark:text-[#d7efc8]">
                      {representantes.length} representantes
                    </Badge>
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-[#143E29] dark:text-white">
                        Representante
                      </Label>

                      <Popover
                        open={openRepresentativeSearch}
                        onOpenChange={setOpenRepresentativeSearch}
                      >
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            className="w-full justify-between border-[#68A243]/20 bg-white text-left font-normal dark:border-[#68A243]/15 dark:bg-[#0f141a] dark:text-white"
                          >
                            <span className="truncate">
                              {selectedRepresentative
                                ? `${selectedRepresentative.nombre} ${selectedRepresentative.apellido}`.trim()
                                : "Elegí un representante"}
                            </span>
                            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[320px] p-0" align="start">
                          <Command>
                            <CommandInput placeholder="Buscar representante..." />
                            <CommandList>
                              <CommandEmpty>
                                No se encontraron representantes.
                              </CommandEmpty>
                              <CommandGroup>
                                {representantes.map((representante) => {
                                  const label =
                                    `${representante.nombre} ${representante.apellido}`.trim();

                                  return (
                                    <CommandItem
                                      key={representante.id}
                                      value={label}
                                      onSelect={() => {
                                        setSelectedRepresentativeId(
                                          representante.id.toString(),
                                        );
                                        setOpenRepresentativeSearch(false);
                                      }}
                                    >
                                      <Check
                                        className={cn(
                                          "mr-2 h-4 w-4",
                                          selectedRepresentativeId ===
                                            representante.id.toString()
                                            ? "opacity-100"
                                            : "opacity-0",
                                        )}
                                      />
                                      <div className="flex flex-col">
                                        <span>{label}</span>
                                        <span className="text-xs text-muted-foreground">
                                          {representante.email}
                                        </span>
                                      </div>
                                    </CommandItem>
                                  );
                                })}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>

                      {representantes.length === 0 && (
                        <p className="text-xs text-muted-foreground dark:text-gray-400">
                          No tenés representantes cargados. Desde la sección de
                          representantes podés crear uno para anotarte.
                        </p>
                      )}
                    </div>

                    <div className="flex gap-2 sm:justify-end">
                      <Button
                        type="button"
                        onClick={() => void handleBookMesa()}
                        disabled={
                          submittingBooking ||
                          !selectedMesa ||
                          !selectedRepresentative
                        }
                        className="bg-[#68A243] text-white hover:bg-[#143E29] dark:hover:bg-[#68A243]/80"
                      >
                        {submittingBooking ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Anotando...
                          </>
                        ) : (
                          <>
                            <Users className="mr-2 h-4 w-4" />
                            Anotarme en la mesa
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
