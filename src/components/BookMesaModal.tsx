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
  TableProperties,
  Users,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface BookMesaModalProps {
  company: EmpresaResponse | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ITEMS_PER_PAGE = 8;

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

  // Estado para la paginación local de las mesas
  const [currentPage, setCurrentPage] = useState(1);

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
    if (!user?.aprobada)
      return "Tu empresa todavía está pendiente de aprobación.";
    if (!user?.empresa_id) return "No pudimos identificar tu empresa.";
    if (company.id === user.empresa_id) {
      return "Esta es tu propia empresa. Abrí otra para anotarte en una mesa.";
    }
    return null;
  }, [company, user?.aprobada, user?.empresa_id]);

  // Cálculo de paginación
  const totalPages = Math.ceil(mesasDisponibles.length / ITEMS_PER_PAGE);
  const paginatedMesas = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return mesasDisponibles.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [mesasDisponibles, currentPage]);

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
        .sort((a, b) =>
          `${a.nombre} ${a.apellido}`.localeCompare(
            `${b.nombre} ${b.apellido}`,
          ),
        );

      setMesasDisponibles(mesasOrdenadas);
      setRepresentantes(representantesValidos);
      setCurrentPage(1); // Resetear a la primera página al cargar datos nuevos

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
    if (
      !company ||
      !canBookMesa ||
      !selectedMesa ||
      !selectedRepresentative ||
      !user?.empresa_id
    )
      return;

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
      if (message) toast.error(message);
    } finally {
      setSubmittingBooking(false);
    }
  };

  if (!company) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-[500px] sm:!max-w-[500px] w-[min(95vw,500px)] max-h-[90vh] overflow-y-auto bg-white dark:bg-[#0F141A] text-foreground dark:text-white border-[#669649] dark:border-[#1a5032] p-6">
        <DialogHeader className="text-center sm:text-center pb-2">
          <DialogTitle className="text-xl font-bold text-[#143E29] dark:text-white mb-1">
            Mesas en {company.razon_social}
          </DialogTitle>
          <DialogDescription className="text-sm dark:text-gray-300">
            Elegí una mesa libre y tu representante para confirmar
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          {/* Alertas de Acceso o Error */}
          {!canBookMesa && (
            <div className="rounded-lg border border-dashed border-[#68A243]/30 bg-[#68A243]/5 p-3.5 text-sm text-center text-muted-foreground dark:text-gray-300">
              {bookingAccessMessage}
            </div>
          )}

          {bookingError && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-950/40 dark:bg-red-950/20 dark:text-red-300">
              <div className="flex gap-2">
                <Clock className="h-4 w-4 shrink-0 mt-0.5" />
                <div className="space-y-2 flex-1">
                  <p>{bookingError}</p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => void loadBookingData()}
                    className="border-red-200 bg-white dark:bg-transparent"
                  >
                    Reintentar
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Estado de carga */}
          {loadingBookingData && (
            <div className="grid grid-cols-4 gap-2 py-4">
              {[...Array(4)].map((_, idx) => (
                <Skeleton
                  key={idx}
                  className="aspect-square w-full rounded-lg dark:bg-slate-800"
                />
              ))}
            </div>
          )}

          {/* Grid de mesas libres sin recuadros extra */}
          {canBookMesa && !loadingBookingData && !bookingError && (
            <>
              {mesasDisponibles.length === 0 ? (
                <div className="rounded-lg border border-dashed border-gray-200 p-6 text-center text-sm text-muted-foreground">
                  No hay mesas libres disponibles en este momento. <br />
                  Inscribete a un turno o espera a que{" "}
                  <span className="text-[#68A243]">
                    {company.razon_social}
                  </span>{" "}
                  se inscriba.
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                    <span className="flex items-center gap-1.5">
                      <TableProperties className="h-3.5 w-3.5 text-[#68A243]" />
                      Seleccionar Mesa
                    </span>
                    <Badge
                      variant="secondary"
                      className="font-normal normal-case"
                    >
                      {mesasDisponibles.length} disponibles
                    </Badge>
                  </div>

                  {/* Rediseño de cuadraditos en 4 columnas compactas */}
                  <div className="grid grid-cols-4 gap-2.5">
                    {paginatedMesas.map((mesa) => {
                      const isSelected = mesa.id === selectedMesaId;
                      // Formateamos el horario (ej: "18:50" - "19:05")
                      const horaInicio =
                        mesa.turno__hora_inicio?.slice(0, 5) || "";
                      const horaFin = mesa.turno__hora_fin?.slice(0, 5) || "";

                      return (
                        <button
                          key={mesa.id}
                          type="button"
                          onClick={() => setSelectedMesaId(mesa.id)}
                          className={cn(
                            "relative aspect-square rounded-xl border-2 flex flex-col items-center justify-center transition-all duration-150 p-1",
                            isSelected
                              ? "border-[#68A243] bg-[#68A243]/10 dark:bg-[#68A243]/20"
                              : "border-slate-200 bg-white hover:border-[#68A243] dark:border-slate-800 dark:bg-[#0f141a]",
                          )}
                        >
                          <span className="text-[10px] uppercase tracking-wider text-muted-foreground dark:text-gray-400">
                            Mesa {mesa.num_mesa}
                          </span>
                          <span className="text-xs font-bold text-[#143E29] dark:text-white mt-0.5">
                            {horaInicio}
                          </span>
                          <span className="text-[10px] text-[#68A243] font-medium">
                            a {horaFin}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Controles de Paginación Local */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-xs text-muted-foreground">
                        Página {currentPage} de {totalPages}
                      </span>
                      <div className="flex gap-1">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          disabled={currentPage === 1}
                          onClick={() => setCurrentPage((prev) => prev - 1)}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          disabled={currentPage === totalPages}
                          onClick={() => setCurrentPage((prev) => prev + 1)}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Formulario de Representante (Integrado limpiamente) */}
              {mesasDisponibles.length > 0 && (
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Asignar Representante
                    </Label>
                    <Popover
                      open={openRepresentativeSearch}
                      onOpenChange={setOpenRepresentativeSearch}
                    >
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          className="w-full justify-between h-10 border-slate-200 bg-white font-normal dark:border-slate-800 dark:bg-[#0f141a]"
                        >
                          <span className="truncate text-sm">
                            {selectedRepresentative
                              ? `${selectedRepresentative.nombre} ${selectedRepresentative.apellido}`.trim()
                              : "Elegí un representante..."}
                          </span>
                          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-[360px] sm:w-[450px] p-0"
                        align="start"
                      >
                        <Command>
                          <CommandInput placeholder="Buscar representante por nombre..." />
                          <CommandList>
                            <CommandEmpty>
                              No se encontraron representantes.
                            </CommandEmpty>
                            <CommandGroup>
                              {representantes.map((rep) => {
                                const label =
                                  `${rep.nombre} ${rep.apellido}`.trim();
                                return (
                                  <CommandItem
                                    key={rep.id}
                                    value={label}
                                    onSelect={() => {
                                      setSelectedRepresentativeId(
                                        rep.id.toString(),
                                      );
                                      setOpenRepresentativeSearch(false);
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4 shrink-0",
                                        selectedRepresentativeId ===
                                          rep.id.toString()
                                          ? "opacity-100"
                                          : "opacity-0",
                                      )}
                                    />
                                    <div className="flex flex-col min-w-0">
                                      <span className="text-sm font-medium">
                                        {label}
                                      </span>
                                      <span className="text-xs text-muted-foreground truncate">
                                        {rep.email}
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
                  </div>

                  {/* Botón único de confirmación de acción */}
                  <div className="pt-2">
                    <Button
                      type="button"
                      onClick={() => void handleBookMesa()}
                      disabled={
                        submittingBooking ||
                        !selectedMesa ||
                        !selectedRepresentative
                      }
                      className="w-full h-11 bg-[#68A243] text-white hover:bg-[#143E29] transition-colors text-sm font-semibold shadow-sm"
                    >
                      {submittingBooking ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Confirmando reserva...
                        </>
                      ) : (
                        <>
                          <Users className="mr-2 h-4 w-4" />
                          Confirmar en Mesa {selectedMesa?.num_mesa}
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
