import { useCallback, useEffect, useState, useMemo, useRef } from "react";
import {
  Check,
  LayoutGrid,
  RefreshCw,
  Search,
  Shield,
  Trash2,
  UserPlus,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Label } from "./ui/label";
import { ScrollArea } from "./ui/scroll-area";
import { Skeleton } from "./ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { cn } from "../lib/utils";
import { createAsiento, deleteAsiento } from "../api/AsientoService";
import { getCompanies } from "../api/EmpresaService";
import { getMesasByTurnoId } from "../api/MesaService";
import { getRepresentantes } from "../api/RepresentanteService";
import { toast } from "sonner";
import { getApiErrorMessage, isSessionExpiredError } from "../lib/axios";
import type { EmpresaResponse } from "../types/Empresa";
import type { EventoResponse } from "../types/Evento";
import type { MesaResponse } from "../types/Mesa";
import type { RepresentanteResponse } from "../types/Representante";
import type { TurnoResponse } from "../types/Turno";

type MesaStatus = "empty" | "partial" | "full";

type SeatDeleteTarget = {
  asiento: MesaResponse["asientos"][number];
  mesaNumero: number;
  turnoId: number;
  turnoHorario: string;
};

function getMesaStatus(mesa: MesaResponse): MesaStatus {
  if (mesa.asientos.length >= 2) {
    return "full";
  }

  if (mesa.asientos.length === 1) {
    return "partial";
  }

  return "empty";
}

function formatRepresentativeName(asiento: MesaResponse["asientos"][number]) {
  const fullName = [
    asiento.representante_nombre,
    asiento.representante_apellido,
  ]
    .filter(Boolean)
    .join(" ")
    .trim();

  return fullName || "Representante sin nombre";
}

function formatRefreshTime(timestamp: number | null) {
  if (!timestamp) {
    return "Sin sincronizar";
  }

  return new Intl.DateTimeFormat("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date(timestamp));
}

interface GestionarAsientosModalProps {
  isOpen: boolean;
  onClose: () => void;
  turnoGestionado: TurnoResponse | null;
  evento: EventoResponse | null;
  loadTurnos: (eventoId: number) => Promise<void>;
}

export default function GestionarAsientosModal({
  isOpen,
  onClose,
  turnoGestionado,
  evento,
  loadTurnos,
}: GestionarAsientosModalProps) {
  const [mesaSeleccionada, setMesaSeleccionada] = useState<MesaResponse | null>(
    null,
  );
  const [mesasTurnoGestionado, setMesasTurnoGestionado] = useState<
    MesaResponse[]
  >([]);
  const [isLoadingMesasTurnoGestionado, setIsLoadingMesasTurnoGestionado] =
    useState(false);
  const [representantes, setRepresentantes] = useState<RepresentanteResponse[]>(
    [],
  );
  const [companies, setCompanies] = useState<EmpresaResponse[]>([]);
  const companiesRef = useRef<EmpresaResponse[]>([]);
  const [loadingCompanies, setLoadingCompanies] = useState(false);
  const [loadingRepresentantes, setLoadingRepresentantes] = useState(false);
  const [selectedCompanyId, setSelectedCompanyId] = useState("");
  const [selectedRepresentativeId, setSelectedRepresentativeId] = useState("");
  const [openRepresentativeSearch, setOpenRepresentativeSearch] =
    useState(false);
  const [isCreatingSeat, setIsCreatingSeat] = useState(false);
  const [seatToDelete, setSeatToDelete] = useState<SeatDeleteTarget | null>(
    null,
  );
  const [isDeletingSeat, setIsDeletingSeat] = useState(false);
  const [lastRealtimeSync, setLastRealtimeSync] = useState<number | null>(null);

  const loadRepresentativesByCompany = useCallback(
    async (companyId: number) => {
      try {
        setLoadingRepresentantes(true);
        const representantesData = await getRepresentantes({
          empresa: companyId,
        });

        // Filtrar representantes activos (no eliminados)
        const activeRepresentantes = representantesData.filter(
          (rep) => rep.eliminado === false,
        );

        setRepresentantes(activeRepresentantes);
      } catch (error) {
        if (!isSessionExpiredError(error)) {
          const message = getApiErrorMessage(
            error,
            "No se pudieron cargar los representantes de la empresa",
          );

          if (message) {
            toast.error(message);
          }
        }
        setRepresentantes([]);
      } finally {
        setLoadingRepresentantes(false);
      }
    },
    [],
  );

  const loadCompaniesCallback = useCallback(async () => {
    try {
      setLoadingCompanies(true);
      const orderedCompanies = (await getCompanies()).sort(
        (first: EmpresaResponse, second: EmpresaResponse) =>
          first.razon_social.localeCompare(second.razon_social),
      );
      companiesRef.current = orderedCompanies;
      setCompanies(orderedCompanies);
    } catch (error) {
      if (!isSessionExpiredError(error)) {
        const message = getApiErrorMessage(
          error,
          "No se pudieron cargar las empresas",
        );

        if (message) {
          toast.error(message);
        }
      }
    } finally {
      setLoadingCompanies(false);
    }
  }, []);

  const refreshMesasForTurno = useCallback(
    async (
      turnoIdToRefresh: number,
      options?: { silent?: boolean; showError?: boolean },
    ) => {
      const { silent = false, showError = false } = options ?? {};

      try {
        if (!silent) {
          setIsLoadingMesasTurnoGestionado(true);
        }

        const mesas = await getMesasByTurnoId(turnoIdToRefresh);
        const sortedMesas = [...mesas].sort(
          (first, second) => first.num_mesa - second.num_mesa,
        );

        setMesasTurnoGestionado(sortedMesas);
        setLastRealtimeSync(Date.now());
        setMesaSeleccionada((current) => {
          if (!current) {
            return null;
          }

          return sortedMesas.find((mesa) => mesa.id === current.id) ?? current;
        });

        return sortedMesas;
      } catch (error) {
        if (!isSessionExpiredError(error) && showError) {
          const message = getApiErrorMessage(
            error,
            "No se pudieron cargar las mesas del turno",
          );

          if (message) {
            toast.error(message);
          }
        }

        return [];
      } finally {
        if (!silent) {
          setIsLoadingMesasTurnoGestionado(false);
        }
      }
    },
    [],
  );

  useEffect(() => {
    if (!turnoGestionado) {
      setMesaSeleccionada(null);
      setSelectedCompanyId("");
      setSelectedRepresentativeId("");
      setOpenRepresentativeSearch(false);
      setLastRealtimeSync(null);
      setRepresentantes([]);
      return;
    }

    void refreshMesasForTurno(turnoGestionado.id, { showError: true });
    void loadCompaniesCallback();

    const intervalId = window.setInterval(() => {
      void refreshMesasForTurno(turnoGestionado.id, { silent: true });
    }, 15000);

    return () => window.clearInterval(intervalId);
  }, [turnoGestionado, refreshMesasForTurno, loadCompaniesCallback]);

  const representativesForSelectedCompany = useMemo(() => {
    // Deduplicar representantes por ID para evitar duplicados visuales
    const seen = new Set<number>();
    return representantes.filter((rep) => {
      if (seen.has(rep.id)) {
        return false;
      }
      seen.add(rep.id);
      return true;
    });
  }, [representantes]);

  const availableCompanies = useMemo(() => {
    // Mostrar solo empresas que tienen representantes
    return companies
      .filter((company) => company.id)
      .sort((a, b) => a.razon_social.localeCompare(b.razon_social));
  }, [companies]);

  const asientosOcupadosTurnoGestionado = useMemo(() => {
    return mesasTurnoGestionado.reduce(
      (total, mesa) => total + mesa.asientos.length,
      0,
    );
  }, [mesasTurnoGestionado]);

  const totalAsientosTurnoGestionado = useMemo(() => {
    return mesasTurnoGestionado.length * 2;
  }, [mesasTurnoGestionado]);

  const mesasParcialesTurnoGestionado = useMemo(() => {
    return mesasTurnoGestionado.filter((mesa) => mesa.asientos.length === 1)
      .length;
  }, [mesasTurnoGestionado]);

  const mesasCompletasTurnoGestionado = useMemo(() => {
    return mesasTurnoGestionado.filter((mesa) => mesa.asientos.length === 2)
      .length;
  }, [mesasTurnoGestionado]);

  const handleCreateSeat = async () => {
    if (!evento || !turnoGestionado || !mesaSeleccionada) {
      toast.error("Información incompleta para asignar el asiento");
      return;
    }

    const selectedCompanyIdNum = Number(selectedCompanyId);

    if (!selectedCompanyIdNum || selectedCompanyIdNum <= 0) {
      toast.error("Seleccioná una empresa válida");
      return;
    }

    const selectedRepresentative = representantes.find(
      (representante) =>
        representante.id.toString() === selectedRepresentativeId &&
        (representante.empresa || representante.empresa_id) ===
          selectedCompanyIdNum,
    );

    if (!selectedRepresentative) {
      toast.error(
        "El representante seleccionado no existe o no pertenece a la empresa",
      );
      return;
    }

    try {
      setIsCreatingSeat(true);
      await createAsiento({
        mesa: mesaSeleccionada.id,
        empresa: selectedCompanyIdNum,
        representante: selectedRepresentative.id,
      });

      // Refrescar estados
      await Promise.all([
        loadTurnos(evento.id),
        refreshMesasForTurno(turnoGestionado.id, { silent: true }),
      ]);

      toast.success(
        `${selectedRepresentative.nombre} ${selectedRepresentative.apellido} fue asignado correctamente`,
      );

      // Limpiar selecciones
      setSelectedCompanyId("");
      setSelectedRepresentativeId("");
      setOpenRepresentativeSearch(false);
    } catch (error) {
      const message = getApiErrorMessage(
        error,
        "No se pudo asignar el representante al asiento",
      );

      if (message) {
        toast.error(message);
      }
    } finally {
      setIsCreatingSeat(false);
    }
  };

  const handleDeleteSeat = async () => {
    if (!seatToDelete || !evento || !turnoGestionado) {
      return;
    }

    try {
      setIsDeletingSeat(true);
      await deleteAsiento(seatToDelete.asiento.id);
      await Promise.all([
        loadTurnos(evento.id),
        refreshMesasForTurno(turnoGestionado.id, { silent: true }),
      ]);
      toast.success("El asiento fue eliminado correctamente");
      setSeatToDelete(null);
    } catch (error) {
      const message = getApiErrorMessage(
        error,
        "No se pudo eliminar el asiento",
      );

      if (message) {
        toast.error(message);
      }
    } finally {
      setIsDeletingSeat(false);
    }
  };

  const handleDeleteSelectedMesa = async () => {
    if (!evento || !turnoGestionado || !mesaSeleccionada) {
      return;
    }

    if (mesaSeleccionada.asientos.length === 0) {
      toast.info("La mesa seleccionada no tiene asientos para eliminar.");
      return;
    }

    try {
      setIsDeletingSeat(true);

      await Promise.all(
        mesaSeleccionada.asientos.map((asiento) => deleteAsiento(asiento.id)),
      );

      await Promise.all([
        loadTurnos(evento.id),
        refreshMesasForTurno(turnoGestionado.id, { silent: true }),
      ]);

      toast.success(
        mesaSeleccionada.asientos.length === 1
          ? "El asiento de la mesa fue eliminado correctamente"
          : "Los asientos de la mesa fueron eliminados correctamente",
      );

      setSelectedCompanyId("");
      setSelectedRepresentativeId("");
      setOpenRepresentativeSearch(false);
    } catch (error) {
      const message = getApiErrorMessage(
        error,
        "No se pudo eliminar los asientos de la mesa",
      );

      if (message) {
        toast.error(message);
      }
    } finally {
      setIsDeletingSeat(false);
    }
  };

  const handleClose = () => {
    setMesaSeleccionada(null);
    setSelectedCompanyId("");
    setSelectedRepresentativeId("");
    setOpenRepresentativeSearch(false);
    setSeatToDelete(null);
    setRepresentantes([]);
    onClose();
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="!w-[min(96vw,1680px)] !max-w-none !h-[min(90vh,1080px)] !grid !grid-rows-[auto_minmax(0,1fr)] !overflow-hidden !rounded-[28px] !border-gray-200 dark:!border-[#68A243]/20 !bg-white dark:!bg-[#11161d] !p-0 !gap-0">
          <DialogHeader className="!gap-0">
            <div className="!border-b !border-[#68A243]/10 !px-8 !py-6 dark:!border-[#68A243]/15">
              <div className="!flex !flex-col !gap-4 lg:!flex-row lg:!items-start lg:!justify-between">
                <div>
                  <DialogTitle className="!text-[#143E29] dark:!text-white !flex !items-center !gap-2 !text-[clamp(1.35rem,1.1rem+0.8vw,1.9rem)] !leading-tight">
                    <Shield className="h-5 w-5 text-[#68A243]" />
                    Gestionar asientos del turno
                  </DialogTitle>
                  <DialogDescription className="dark:!text-gray-300 !mt-2 !max-w-3xl !text-base !leading-relaxed">
                    {turnoGestionado
                      ? `Turno ${turnoGestionado.hora_inicio} - ${turnoGestionado.hora_fin}. Monitoreá la ocupación en tiempo real y administrá quién se sienta en cada mesa.`
                      : ""}
                  </DialogDescription>
                </div>

                {turnoGestionado ? (
                  <div className="!flex !flex-col !items-start !gap-3 sm:!flex-row sm:!items-center sm:!justify-end">
                    <span className="!text-xs !font-semibold !uppercase !tracking-[0.14em] text-muted-foreground dark:!text-gray-400">
                      Última sincronización:{" "}
                      {formatRefreshTime(lastRealtimeSync)}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        refreshMesasForTurno(turnoGestionado.id, {
                          showError: true,
                        })
                      }
                      disabled={isLoadingMesasTurnoGestionado}
                      className="!h-11 !px-5 !border-[#68A243]/20 !text-[#68A243] hover:!bg-[#68A243] hover:!text-white"
                    >
                      <RefreshCw
                        className={`h-4 w-4 ${
                          isLoadingMesasTurnoGestionado ? "animate-spin" : ""
                        }`}
                      />
                      Actualizar
                    </Button>
                  </div>
                ) : null}
              </div>
            </div>
          </DialogHeader>

          <div className="!grid !h-full !min-h-0 !grid-cols-1 lg:!grid-cols-[minmax(0,1.65fr)_minmax(380px,460px)]">
            <div className="!min-h-0 !border-b !border-[#68A243]/10 lg:!border-b-0 lg:!border-r lg:!border-[#68A243]/10 dark:!border-[#68A243]/15">
              <ScrollArea className="!h-full">
                <div className="!space-y-6 !p-8">
                  <div className="!grid !grid-cols-1 md:!grid-cols-3 !gap-3">
                    <Card className="!gap-1 !py-2 !border-[#68A243]/20 dark:!bg-[#143E29] dark:!border-[#68A243]/20">
                      <CardContent className="!px-4 !pt-1">
                        <p className="!mb-1 !text-xs !font-medium !uppercase !tracking-[0.14em] text-muted-foreground dark:!text-gray-300">
                          Asientos ocupados
                        </p>
                        <p className="!text-2xl !font-semibold !text-[#143E29] dark:!text-white">
                          {asientosOcupadosTurnoGestionado} /{" "}
                          {totalAsientosTurnoGestionado}
                        </p>
                      </CardContent>
                    </Card>
                    <Card className="!gap-1 !py-2 !border-[#68A243]/20 dark:!bg-[#143E29] dark:!border-[#68A243]/20">
                      <CardContent className="!px-4 !pt-1">
                        <p className="!mb-1 !text-xs !font-medium !uppercase !tracking-[0.14em] text-muted-foreground dark:!text-gray-300">
                          Mesas parciales
                        </p>
                        <p className="!text-2xl !font-semibold !text-[#68A243]">
                          {mesasParcialesTurnoGestionado}
                        </p>
                      </CardContent>
                    </Card>
                    <Card className="!gap-1 !py-2 !border-[#68A243]/20 dark:!bg-[#143E29] dark:!border-[#68A243]/20">
                      <CardContent className="!px-4 !pt-1">
                        <p className="!mb-1 !text-xs !font-medium !uppercase !tracking-[0.14em] text-muted-foreground dark:!text-gray-300">
                          Mesas completas
                        </p>
                        <p className="!text-2xl !font-semibold !text-[#143E29] dark:!text-white">
                          {mesasCompletasTurnoGestionado}
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  <Card className="!gap-2 !py-3 !border-[#68A243]/20 dark:!bg-[#143E29] dark:!border-[#68A243]/20">
                    <CardHeader className="!px-4 !pb-0">
                      <CardTitle className="!text-base !text-[#143E29] dark:!text-white">
                        Leyenda operativa
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="!px-4 !pt-1">
                      <div className="!flex !flex-wrap !gap-4 !text-xs !text-gray-600 dark:!text-gray-300">
                        <div className="!flex !items-center !gap-2">
                          <div className="!w-8 !h-8 !bg-white dark:!bg-[#0f2f25] !border-2 !border-gray-300 dark:!border-gray-600 !rounded-lg" />
                          <span>Libre</span>
                        </div>
                        <div className="!flex !items-center !gap-2">
                          <div className="!w-8 !h-8 !bg-[#68A243]/10 !border-2 !border-[#68A243] !rounded-lg" />
                          <span>Parcial</span>
                        </div>
                        <div className="!flex !items-center !gap-2">
                          <div className="!w-8 !h-8 !bg-gray-200 dark:!bg-gray-700 !border-2 !border-gray-400 dark:!border-gray-600 !rounded-lg" />
                          <span>Completa</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="!rounded-[24px] !border !border-[#68A243]/20 !bg-white !p-8 dark:!border-[#68A243]/20 dark:!bg-[#143E29]">
                    <div className="!mb-7 !flex !items-center !justify-between !gap-3">
                      <div>
                        <h3 className="!text-2xl !font-semibold !text-[#143E29] dark:!text-white">
                          Mesas del turno
                        </h3>
                        <p className="!mt-1 !text-sm !text-gray-600 dark:!text-gray-300">
                          Seleccioná una mesa para ver quién está sentado,
                          eliminar un asiento o sumar un representante a un
                          lugar disponible.
                        </p>
                      </div>
                    </div>

                    {isLoadingMesasTurnoGestionado &&
                    mesasTurnoGestionado.length === 0 ? (
                      <div className="!grid !grid-cols-3 md:!grid-cols-4 xl:!grid-cols-6 !gap-5 !max-w-6xl !mx-auto">
                        {Array.from({
                          length: Math.max(turnoGestionado?.cant_mesas ?? 0, 6),
                        }).map((_, index) => (
                          <Skeleton
                            key={index}
                            className="!aspect-square !rounded-xl dark:!bg-[#0f2f25]"
                          />
                        ))}
                      </div>
                    ) : mesasTurnoGestionado.length > 0 ? (
                      <div className="!grid !grid-cols-3 md:!grid-cols-4 xl:!grid-cols-6 !gap-5 !max-w-6xl !mx-auto">
                        {mesasTurnoGestionado.map((mesa, index) => {
                          const mesaStatus = getMesaStatus(mesa);
                          const firstSeat = mesa.asientos[0];
                          const secondSeat = mesa.asientos[1];
                          const isSelected = mesaSeleccionada?.id === mesa.id;

                          return (
                            <button
                              key={mesa.id}
                              onClick={() => {
                                setMesaSeleccionada(mesa);
                                setSelectedRepresentativeId("");
                                setOpenRepresentativeSearch(false);
                              }}
                              className={cn(
                                "!relative !aspect-square !rounded-xl !border-2 !transition-all !duration-300 !ease-out !flex !flex-col !items-center !justify-center !p-3 hover:!scale-[1.03] hover:!shadow-lg",
                                mesaStatus === "full"
                                  ? "!bg-gray-200 dark:!bg-gray-700 !border-gray-400 dark:!border-gray-600"
                                  : mesaStatus === "partial"
                                    ? "!bg-[#68A243]/10 !border-[#68A243] dark:!bg-[#68A243]/10 dark:!border-[#68A243]"
                                    : "!bg-white dark:!bg-[#0f2f25] !border-gray-300 dark:!border-gray-600 hover:!border-[#68A243] dark:hover:!border-[#68A243]",
                                isSelected &&
                                  "!ring-4 !ring-[#143E29]/10 !border-[#143E29] dark:!ring-[#68A243]/20 dark:!border-[#9FD27B] !scale-[1.03]",
                              )}
                              style={{
                                animation: `fadeInUp 0.5s ease-out ${index * 0.04}s both`,
                              }}
                            >
                              <p className="!mb-1 !font-bold !text-lg !text-[#143E29] dark:!text-white">
                                {mesa.num_mesa}
                              </p>

                              {mesaStatus === "empty" ? (
                                <p className="!text-xs !text-gray-500 dark:!text-gray-200">
                                  Libre
                                </p>
                              ) : mesaStatus === "partial" ? (
                                <div className="!flex !flex-col !items-center !gap-1 !text-center">
                                  <div className="!h-8 !w-8 !rounded-full !bg-[#68A243] !text-white !text-xs !font-bold !flex !items-center !justify-center">
                                    {firstSeat?.empresa_nombre
                                      ?.substring(0, 1)
                                      .toUpperCase()}
                                  </div>
                                  <p className="!text-[11px] !text-gray-600 dark:!text-gray-200 line-clamp-2">
                                    {firstSeat?.empresa_nombre}
                                  </p>
                                </div>
                              ) : (
                                <div className="!flex !flex-col !items-center !gap-1 !text-center">
                                  <div className="!flex !-space-x-2">
                                    <div className="!h-7 !w-7 !rounded-full !bg-[#68A243] !text-white !text-[10px] !font-bold !flex !items-center !justify-center !border !border-white dark:!border-[#143E29]">
                                      {firstSeat?.empresa_nombre
                                        ?.substring(0, 1)
                                        .toUpperCase()}
                                    </div>
                                    <div className="!h-7 !w-7 !rounded-full !bg-[#143E29] !text-white !text-[10px] !font-bold !flex !items-center !justify-center !border !border-white dark:!border-[#143E29]">
                                      {secondSeat?.empresa_nombre
                                        ?.substring(0, 1)
                                        .toUpperCase()}
                                    </div>
                                  </div>
                                  <p className="!text-[11px] !text-gray-600 dark:!text-gray-200">
                                    Completa
                                  </p>
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="!rounded-2xl !border !border-dashed !border-[#68A243]/25 !bg-white/70 !p-8 !text-center dark:!border-[#68A243]/20 dark:!bg-[#11161d]">
                        <h4 className="!text-base !font-semibold !text-[#143E29] dark:!text-white">
                          Las mesas todavía no están disponibles
                        </h4>
                        <p className="!mt-2 !text-sm !text-gray-600 dark:!text-gray-300">
                          Este turno aún no devolvió mesas operativas desde la
                          API. Cuando estén creadas, vas a poder gestionarlas
                          desde este modal.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </ScrollArea>
            </div>

            <aside className="!min-h-0 !bg-[#143E29]/[0.03] dark:!bg-[#0f141a]">
              <ScrollArea className="!h-full">
                <div className="!space-y-4 !p-6 lg:!p-7">
                  {mesaSeleccionada ? (
                    <>
                      <div className="!rounded-2xl !border !border-[#68A243]/20 !bg-white !p-5 dark:!border-[#68A243]/20 dark:!bg-[#143E29]">
                        <div className="!flex !items-start !justify-between !gap-3">
                          <div>
                            <p className="!text-xs !font-medium !uppercase !tracking-[0.14em] text-muted-foreground dark:!text-gray-300">
                              Mesa seleccionada
                            </p>
                            <h3 className="!mt-1 !text-2xl !font-semibold !text-[#143E29] dark:!text-white">
                              Mesa {mesaSeleccionada.num_mesa}
                            </h3>
                            <p className="!mt-1 !text-sm !text-gray-600 dark:!text-gray-300">
                              {mesaSeleccionada.asientos.length} de 2 asientos
                              ocupados
                            </p>
                          </div>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={handleDeleteSelectedMesa}
                            disabled={isDeletingSeat}
                            className="!h-10 !px-4 !bg-[#F05826] hover:!bg-[#d84f21] !text-white"
                          >
                            <Trash2 className="h-4 w-4" />
                            {isDeletingSeat
                              ? "Eliminando..."
                              : "Eliminar asientos"}
                          </Button>
                        </div>
                      </div>

                      {mesaSeleccionada.asientos.map((asiento) => (
                        <Card
                          key={asiento.id}
                          className="!gap-3 !py-4 !border-[#68A243]/20 dark:!bg-[#143E29] dark:!border-[#68A243]/20"
                        >
                          <CardContent className="!px-5 !pt-2">
                            <div className="!flex !items-start !justify-between !gap-4">
                              <div className="!space-y-2">
                                <div className="!flex !flex-wrap !items-center !gap-2">
                                  <p className="!font-semibold !text-[#143E29] dark:!text-white">
                                    {formatRepresentativeName(asiento)}
                                  </p>
                                  {asiento.anfitriona && (
                                    <Badge className="!bg-[#68A243]/10 !text-[#3F6E20] !border-[#68A243]/20 dark:!bg-[#68A243]/20 dark:!text-[#9FD27B] dark:!border-[#68A243]/30">
                                      Anfitriona
                                    </Badge>
                                  )}
                                </div>
                                {asiento.representante_email && (
                                  <p className="!text-xs text-muted-foreground dark:!text-gray-400">
                                    {asiento.representante_email}
                                  </p>
                                )}
                                <p className="!text-xs text-gray-600 dark:text-gray-300">
                                  {asiento.empresa_nombre}
                                </p>
                              </div>

                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() =>
                                  setSeatToDelete({
                                    asiento,
                                    mesaNumero: mesaSeleccionada.num_mesa,
                                    turnoId: turnoGestionado?.id ?? 0,
                                    turnoHorario: turnoGestionado
                                      ? `${turnoGestionado.hora_inicio} - ${turnoGestionado.hora_fin}`
                                      : "",
                                  })
                                }
                                className="!h-10 !w-10 !border-[#F05826]/30 !text-[#F05826] hover:!bg-[#F05826] hover:!text-white dark:!border-[#F05826]/40"
                                aria-label={`Eliminar asiento de ${asiento.empresa_nombre}`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}

                      {mesaSeleccionada.asientos.length < 2 ? (
                        <Card className="!gap-4 !py-5 !border-[#68A243]/20 dark:!bg-[#143E29] dark:!border-[#68A243]/20">
                          <CardHeader className="!px-5 !pb-0">
                            <CardTitle className="!text-lg !text-[#143E29] dark:!text-white !flex !items-center !gap-2">
                              <UserPlus className="h-4 w-4 text-[#68A243]" />
                              Agregar representante al asiento disponible
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="!space-y-4 !px-5 !pt-0">
                            {loadingCompanies || loadingRepresentantes ? (
                              <div className="!space-y-3">
                                <Skeleton className="!h-10 !w-full dark:!bg-[#0f2f25]" />
                                <Skeleton className="!h-10 !w-full dark:!bg-[#0f2f25]" />
                              </div>
                            ) : availableCompanies.length > 0 ? (
                              <>
                                <div className="!space-y-2">
                                  <Label className="dark:!text-white">
                                    Empresa
                                  </Label>
                                  <Select
                                    value={selectedCompanyId}
                                    onValueChange={(value) => {
                                      setSelectedCompanyId(value);
                                      setSelectedRepresentativeId("");
                                      setOpenRepresentativeSearch(false);
                                      // Cargar representantes de la empresa seleccionada
                                      void loadRepresentativesByCompany(
                                        Number(value),
                                      );
                                    }}
                                  >
                                    <SelectTrigger className="w-full border-[#68A243]/20 focus-visible:border-[#68A243] focus-visible:ring-[#68A243]/20 bg-white dark:bg-[#143E29] dark:border-[#68A243]/20 dark:text-white transition-colors h-10">
                                      <SelectValue placeholder="Seleccioná una empresa" />
                                    </SelectTrigger>
                                    <SelectContent className="dark:bg-[#143E29] dark:border-[#68A243]/20">
                                      {availableCompanies.map((company) => (
                                        <SelectItem
                                          key={company.id}
                                          value={company.id.toString()}
                                        >
                                          {company.razon_social}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>

                                <Popover
                                  open={openRepresentativeSearch}
                                  onOpenChange={setOpenRepresentativeSearch}
                                >
                                  <PopoverTrigger asChild>
                                    <Button
                                      variant="outline"
                                      role="combobox"
                                      aria-expanded={openRepresentativeSearch}
                                      className="w-full justify-between h-10 border-[#68A243]/20 text-[#143E29] hover:bg-slate-50 hover:text-[#143E29] focus-visible:border-[#68A243] focus-visible:ring-[#68A243]/20 dark:bg-[#143E29] dark:border-[#68A243]/20 dark:text-white dark:hover:bg-[#1a3f30] dark:hover:text-white transition-colors"
                                      disabled={loadingRepresentantes}
                                    >
                                      {loadingRepresentantes ? (
                                        <span className="text-gray-400">
                                          Cargando representantes...
                                        </span>
                                      ) : selectedRepresentativeId ? (
                                        (() => {
                                          const selectedRepresentative =
                                            representativesForSelectedCompany.find(
                                              (representative) =>
                                                representative.id.toString() ===
                                                selectedRepresentativeId,
                                            );

                                          if (!selectedRepresentative) {
                                            return "Seleccioná un representante";
                                          }

                                          return `${selectedRepresentative.nombre} ${selectedRepresentative.apellido}${selectedRepresentative.email ? ` - ${selectedRepresentative.email}` : ""}`;
                                        })()
                                      ) : selectedCompanyId ? (
                                        "Buscá y seleccioná un representante"
                                      ) : (
                                        "Seleccioná primero una empresa"
                                      )}
                                      <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                  </PopoverTrigger>
                                  <PopoverContent
                                    className="w-[380px] p-0 dark:bg-[#143E29] dark:border-[#68A243]/20"
                                    align="start"
                                  >
                                    <Command className="dark:bg-[#143E29]">
                                      <CommandInput
                                        placeholder="Buscar representante..."
                                        className="dark:bg-[#0f2f25] dark:text-white dark:placeholder-gray-400 dark:border-[#68A243]/20 border-[#68A243]/20"
                                      />
                                      <CommandList className="dark:bg-[#143E29]">
                                        <CommandEmpty className="dark:text-gray-400">
                                          {loadingRepresentantes
                                            ? "Cargando representantes..."
                                            : representativesForSelectedCompany.length ===
                                                0
                                              ? "Esta empresa no tiene representantes cargados"
                                              : "No se encontró ningún representante"}
                                        </CommandEmpty>
                                        <CommandGroup className="dark:text-white">
                                          {representativesForSelectedCompany.map(
                                            (representative) => {
                                              return (
                                                <CommandItem
                                                  key={representative.id}
                                                  value={`${representative.nombre} ${representative.apellido} ${representative.email ?? ""} ${representative.empresa_nombre ?? ""}`}
                                                  onSelect={() => {
                                                    setSelectedRepresentativeId(
                                                      representative.id.toString(),
                                                    );
                                                    setOpenRepresentativeSearch(
                                                      false,
                                                    );
                                                  }}
                                                  className="cursor-pointer"
                                                >
                                                  <div className="flex items-center gap-3 flex-1">
                                                    <div className="h-8 w-8 rounded-full bg-[#68A243] text-white text-xs font-semibold flex items-center justify-center">
                                                      {`${representative.nombre[0] ?? "R"}${representative.apellido[0] ?? ""}`.toUpperCase()}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                      <p className="font-medium truncate">
                                                        {representative.nombre}{" "}
                                                        {
                                                          representative.apellido
                                                        }
                                                      </p>
                                                      <div className="flex flex-col gap-0.5">
                                                        {representative.email && (
                                                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                                            {
                                                              representative.email
                                                            }
                                                          </p>
                                                        )}
                                                        <p
                                                          className={cn(
                                                            "text-xs truncate",
                                                            representative.telefono &&
                                                              representative.telefono !==
                                                                ""
                                                              ? "text-gray-600 dark:text-gray-300"
                                                              : "italic text-gray-400 dark:text-gray-500",
                                                          )}
                                                        >
                                                          {representative.telefono &&
                                                          representative.telefono !==
                                                            ""
                                                            ? representative.telefono
                                                            : "Sin teléfono"}
                                                        </p>
                                                      </div>
                                                    </div>
                                                  </div>
                                                  <Check
                                                    className={cn(
                                                      "ml-auto h-4 w-4 text-[#68A243]",
                                                      selectedRepresentativeId ===
                                                        representative.id.toString()
                                                        ? "opacity-100"
                                                        : "opacity-0",
                                                    )}
                                                  />
                                                </CommandItem>
                                              );
                                            },
                                          )}
                                        </CommandGroup>
                                      </CommandList>
                                    </Command>
                                  </PopoverContent>
                                </Popover>

                                <Button
                                  onClick={handleCreateSeat}
                                  disabled={
                                    !selectedCompanyId ||
                                    !selectedRepresentativeId ||
                                    isCreatingSeat ||
                                    loadingRepresentantes
                                  }
                                  className="!w-full !h-11 !bg-[#68A243] hover:!bg-[#5a9038] !text-white disabled:!opacity-50 disabled:!cursor-not-allowed"
                                >
                                  {isCreatingSeat
                                    ? "Asignando..."
                                    : loadingRepresentantes
                                      ? "Cargando..."
                                      : "Agregar representante al asiento"}
                                </Button>
                              </>
                            ) : (
                              <div className="!rounded-xl !border !border-dashed !border-[#68A243]/25 !bg-[#68A243]/5 !p-4">
                                <p className="!text-sm !text-gray-600 dark:!text-gray-300">
                                  No hay empresas disponibles para asignar
                                  representantes.
                                </p>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ) : (
                        <div className="!rounded-xl !border !border-[#143E29]/10 !bg-[#143E29]/5 !p-4 dark:!border-[#68A243]/20 dark:!bg-[#143E29]/40">
                          <p className="!text-sm !text-gray-600 dark:!text-gray-300">
                            Esta mesa ya está completa. Desde acá podés revisar
                            los asientos actuales y eliminar alguno si necesitás
                            intervenir.
                          </p>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="!rounded-2xl !border !border-dashed !border-[#68A243]/25 !bg-white !p-8 !text-center dark:!border-[#68A243]/20 dark:!bg-[#143E29]">
                      <div className="!mx-auto !flex !h-16 !w-16 !items-center !justify-center !rounded-2xl !bg-[#68A243]/10 !text-[#68A243]">
                        <LayoutGrid className="h-6 w-6" />
                      </div>
                      <h3 className="!mt-4 !text-xl !font-semibold !text-[#143E29] dark:!text-white">
                        Seleccioná una mesa
                      </h3>
                      <p className="!mt-2 !text-sm !leading-relaxed !text-gray-600 dark:!text-gray-300">
                        El detalle de la mesa aparece acá, con sus asientos
                        actuales y las acciones administrativas disponibles.
                      </p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </aside>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(seatToDelete)}
        onOpenChange={(open) => {
          if (!open && !isDeletingSeat) {
            setSeatToDelete(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-lg border-gray-200 dark:border-[#68A243]/20 bg-white dark:bg-[#11161d]">
          <DialogHeader>
            <DialogTitle className="text-[#143E29] dark:text-white">
              Eliminar asientos
            </DialogTitle>
            <DialogDescription className="dark:text-gray-300">
              Esta acción elimina el asiento directamente desde administración.
              No se enviará la operación de cancelar.
            </DialogDescription>
          </DialogHeader>

          {seatToDelete ? (
            <div className="rounded-2xl border border-[#F05826]/15 bg-[#F05826]/5 p-4 dark:border-[#F05826]/20 dark:bg-[#2a1713]">
              <p className="text-sm font-medium text-[#143E29] dark:text-white">
                Mesa {seatToDelete.mesaNumero} - Turno{" "}
                {seatToDelete.turnoHorario}
              </p>
              <p className="mt-2 text-sm text-gray-700 dark:text-gray-200">
                Empresa: {seatToDelete.asiento.empresa_nombre}
              </p>
              <p className="text-sm text-gray-700 dark:text-gray-200">
                Representante: {formatRepresentativeName(seatToDelete.asiento)}
              </p>
              {seatToDelete.asiento.representante_email && (
                <p className="text-xs text-muted-foreground dark:text-gray-400">
                  {seatToDelete.asiento.representante_email}
                </p>
              )}
            </div>
          ) : null}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSeatToDelete(null)}
              disabled={isDeletingSeat}
            >
              Volver
            </Button>
            <Button
              onClick={handleDeleteSeat}
              disabled={isDeletingSeat}
              className="bg-[#F05826] hover:bg-[#d84f21] text-white"
            >
              {isDeletingSeat ? "Eliminando..." : "Eliminar asientos"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
