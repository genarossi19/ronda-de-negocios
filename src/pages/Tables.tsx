import { useState, useEffect } from "react";
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
import {
  ArrowLeft,
  Clock,
  Users,
  CheckCircle2,
  User,
  Search,
  Check,
} from "lucide-react";
import { useBooking } from "../context/BookingContext";
import { useAuth } from "../context/AuthContext";
import { useCompanies } from "../context/CompanyContext";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
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

interface TablesProps {
  shiftId: string | null;
}

export default function Tables({ shiftId }: TablesProps) {
  const { getShift, bookTable } = useBooking();
  const { user } = useAuth();
  const { getCompany } = useCompanies();
  const [shift, setShift] = useState(getShift(shiftId || ""));
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [selectedRepresentative, setSelectedRepresentative] =
    useState<string>("");
  const [openRepresentativeSearch, setOpenRepresentativeSearch] =
    useState(false);

  const tutorialSteps = [
    {
      title: "Selección de Mesas",
      description:
        "Aquí podés ver todas las mesas disponibles del turno. Cada mesa puede tener hasta 2 empresas para una reunión 1 a 1. Las mesas se muestran con diferentes colores según su estado.",
      icon: (
        <div className="grid grid-cols-3 gap-2">
          <div className="w-12 h-12 bg-white border-2 border-gray-300 rounded-lg" />
          <div className="w-12 h-12 bg-[#68A243]/10 border-2 border-[#68A243] rounded-lg" />
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

  useEffect(() => {
    if (shiftId) {
      setShift(getShift(shiftId));
    }
  }, [shiftId, getShift]);

  if (!shift) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 pt-20">
          <div className="max-w-4xl mx-auto px-4 py-16">
            <Card>
              <CardHeader>
                <CardTitle className="text-[#143E29]">
                  Turno no encontrado
                </CardTitle>
                <CardDescription>El turno que buscás no existe</CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => (window.location.href = "#shifts")}
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

  const handleTableClick = (tableId: string, status: string) => {
    if (status === "full") return;
    setSelectedTable(tableId);
    setSelectedRepresentative("");
    setShowConfirmDialog(true);
  };

  const handleConfirmBooking = () => {
    if (!selectedTable || !user?.id || !selectedRepresentative) return;

    const success = bookTable(
      shift.id,
      selectedTable,
      user.id,
      selectedRepresentative
    );

    if (success) {
      setBookingSuccess(true);
      setShowConfirmDialog(false);
      setSelectedRepresentative("");
      // Refresh shift data
      setShift(getShift(shift.id));

      setTimeout(() => {
        setBookingSuccess(false);
      }, 3000);
    }
  };

  const selectedTableData = shift.tables.find((t) => t.id === selectedTable);
  const selectedTableCompany = selectedTableData?.companies[0]
    ? getCompany(selectedTableData.companies[0])
    : null;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="bg-gradient-to-br from-[#143E29] to-[#143E29]/90 text-white py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Button
              variant="ghost"
              onClick={() => (window.location.href = "#shifts")}
              className="text-white hover:bg-white/10 mb-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver a Turnos
            </Button>

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold mb-2">Turno {shift.id}</h1>
                <div className="flex flex-wrap items-center gap-4 text-gray-200">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>
                      {shift.startTime} - {shift.endTime}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>
                      {shift.availableTables} mesas disponibles de{" "}
                      {shift.totalTables}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {bookingSuccess && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
            <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg flex items-center gap-3">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
              <div>
                <p className="font-semibold text-green-800">
                  ¡Reserva confirmada!
                </p>
                <p className="text-sm text-green-700">
                  Tu mesa ha sido reservada exitosamente
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Leyenda</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-12 h-12 bg-white border-2 border-gray-300 rounded-lg" />
                  <span className="text-sm">Mesa Libre</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-12 h-12 bg-[#68A243]/10 border-2 border-[#68A243] rounded-lg" />
                  <span className="text-sm">Mesa con 1 Empresa</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-12 h-12 bg-gray-200 border-2 border-gray-400 rounded-lg opacity-50" />
                  <span className="text-sm">Mesa Completa</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-[#143E29] mb-6 text-center">
              Seleccioná tu Mesa
            </h2>

            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 max-w-5xl mx-auto">
              {shift.tables.map((table, index) => {
                const company = table.companies[0]
                  ? getCompany(table.companies[0])
                  : null;

                return (
                  <button
                    key={table.id}
                    onClick={() => handleTableClick(table.id, table.status)}
                    disabled={table.status === "full"}
                    className={`
                      relative aspect-square rounded-lg border-2 transition-all duration-300
                      flex flex-col items-center justify-center p-3
                      ${
                        table.status === "full"
                          ? "bg-gray-200 border-gray-400 opacity-50 cursor-not-allowed"
                          : table.status === "partial"
                          ? "bg-[#68A243]/10 border-[#68A243] hover:bg-[#68A243]/20 hover:scale-105 cursor-pointer"
                          : "bg-white border-gray-300 hover:border-[#68A243] hover:scale-105 cursor-pointer hover:shadow-lg"
                      }
                    `}
                    style={{
                      animation: `fadeInUp 0.5s ease-out ${index * 0.05}s both`,
                    }}
                  >
                    <div className="text-center">
                      <p className="font-bold text-lg text-[#143E29] mb-1">
                        {table.number}
                      </p>

                      {table.status === "partial" && company ? (
                        <div className="flex flex-col items-center gap-1">
                          <Avatar className="h-8 w-8 border border-[#68A243]">
                            <AvatarImage
                              src={company.logo || "/placeholder.svg"}
                              alt={company.name}
                            />
                            <AvatarFallback className="bg-[#68A243] text-white text-xs">
                              {company.name.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <p className="text-xs text-gray-600 line-clamp-1">
                            {company.name}
                          </p>
                        </div>
                      ) : table.status === "full" ? (
                        <p className="text-xs text-gray-500">Completa</p>
                      ) : (
                        <p className="text-xs text-gray-500">Libre</p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-[#143E29]">
                Confirmar Reserva
              </DialogTitle>
              <DialogDescription>
                {selectedTableData?.status === "partial" &&
                selectedTableCompany ? (
                  <>
                    Te vas a unir a la mesa {selectedTableData.number} donde
                    está esperando:
                  </>
                ) : (
                  <>
                    Vas a reservar la mesa {selectedTableData?.number}. Otra
                    empresa podrá unirse a tu mesa.
                  </>
                )}
              </DialogDescription>
            </DialogHeader>

            {selectedTableData?.status === "partial" &&
              selectedTableCompany && (
                <Card className="border-[#68A243]/30">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-16 w-16 border-2 border-[#68A243]">
                        <AvatarImage
                          src={selectedTableCompany.logo || "/placeholder.svg"}
                          alt={selectedTableCompany.name}
                        />
                        <AvatarFallback className="bg-[#68A243] text-white font-bold">
                          {selectedTableCompany.name
                            .substring(0, 2)
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h4 className="font-bold text-[#143E29]">
                          {selectedTableCompany.name}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {selectedTableCompany.sector}
                        </p>
                        <Badge className="mt-1 bg-[#68A243]/10 text-[#68A243] hover:bg-[#68A243]/20">
                          {selectedTableCompany.province}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

            <div className="space-y-2 mt-4">
              <Label
                htmlFor="representative"
                className="flex items-center gap-2 text-[#143E29]"
              >
                <User className="h-4 w-4 text-[#68A243]" />
                Seleccioná el representante que asistirá
              </Label>
              {user?.representatives && user.representatives.length > 0 ? (
                <Popover
                  open={openRepresentativeSearch}
                  onOpenChange={setOpenRepresentativeSearch}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openRepresentativeSearch}
                      className="w-full justify-between border-[#68A243]/20 hover:border-[#68A243] bg-transparent"
                    >
                      {selectedRepresentative
                        ? user.representatives.find(
                            (rep) => rep.id === selectedRepresentative
                          )?.name
                        : "Buscá y seleccioná un representante"}
                      <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0" align="start">
                    <Command>
                      <CommandInput
                        placeholder="Buscar representante..."
                        className="h-9"
                      />
                      <CommandList>
                        <CommandEmpty>
                          No se encontró ningún representante
                        </CommandEmpty>
                        <CommandGroup>
                          {user.representatives.map((rep) => (
                            <CommandItem
                              key={rep.id}
                              value={rep.name}
                              onSelect={() => {
                                setSelectedRepresentative(rep.id);
                                setOpenRepresentativeSearch(false);
                              }}
                              className="cursor-pointer"
                            >
                              <div className="flex items-center gap-3 flex-1">
                                <Avatar className="h-8 w-8 bg-[#68A243]">
                                  <AvatarFallback className="bg-[#68A243] text-white text-xs font-semibold">
                                    {rep.name
                                      .split(" ")
                                      .map((word) => word[0])
                                      .join("")
                                      .toUpperCase()
                                      .slice(0, 2)}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <p className="font-medium">{rep.name}</p>
                                  <p className="text-xs text-gray-500">
                                    {rep.position}
                                  </p>
                                </div>
                              </div>
                              <Check
                                className={cn(
                                  "ml-auto h-4 w-4 text-[#68A243]",
                                  selectedRepresentative === rep.id
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              ) : (
                <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-200">
                  No tenés representantes.{" "}
                  <button
                    onClick={() => (window.location.href = "#representatives")}
                    className="font-semibold underline hover:text-amber-700"
                  >
                    Agregá uno aquí
                  </button>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-4">
              <Button
                variant="outline"
                onClick={() => setShowConfirmDialog(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleConfirmBooking}
                className="flex-1 bg-[#68A243] hover:bg-[#68A243]/90 text-white"
                disabled={!selectedRepresentative}
              >
                Confirmar Reserva
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <HelpTutorial title="Guía de Selección de Mesas" steps={tutorialSteps} />

      <Footer />
    </>
  );
}
