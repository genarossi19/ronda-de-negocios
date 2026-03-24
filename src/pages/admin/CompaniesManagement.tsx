import { useState, useEffect } from "react";
import {
  Edit2,
  Trash2,
  CheckCircle,
  AlertCircle,
  Building2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import { toast } from "sonner";

// Mock data types
interface Company {
  id: number;
  razon_social: string;
  email: string;
  telefono_contacto: string;
  direccion: string;
  sector?: string;
  approved: boolean;
}

// Mock companies data
const MOCK_COMPANIES: Company[] = [
  {
    id: 1,
    razon_social: "TechSolutions SA",
    email: "contact@techsolutions.com",
    telefono_contacto: "+54 11 1234-5678",
    direccion: "Calle Principal 123, Buenos Aires",
    sector: "Tecnología",
    approved: false,
  },
  {
    id: 2,
    razon_social: "IndustriaGlobal ltda",
    email: "info@industriaglobal.com",
    telefono_contacto: "+54 11 2345-6789",
    direccion: "Av. Córdoba 456, Buenos Aires",
    sector: "Manufactura",
    approved: false,
  },
  {
    id: 3,
    razon_social: "ComercioExprés Inc",
    email: "ventas@comercioexpres.com",
    telefono_contacto: "+54 11 3456-7890",
    direccion: "Ruta Nacional 9 km 50, CABA",
    sector: "Comercio",
    approved: true,
  },
  {
    id: 4,
    razon_social: "Consulting Pro",
    email: "admin@consultingpro.ar",
    telefono_contacto: "+54 11 4567-8901",
    direccion: "Piso 10, Torre Financiera, Buenos Aires",
    sector: "Consultoría",
    approved: true,
  },
  {
    id: 5,
    razon_social: "Logística Andes",
    email: "logistics@andes.com",
    telefono_contacto: "+54 11 5678-9012",
    direccion: "Parque Industrial, La Plata",
    sector: "Logística",
    approved: false,
  },
  {
    id: 6,
    razon_social: "Agro Innovación",
    email: "info@agroinnovacion.com",
    telefono_contacto: "+54 11 6789-0123",
    direccion: "Ruta 5 km 150, Provincia de Buenos Aires",
    sector: "Agricultura",
    approved: true,
  },
];

export default function CompaniesManagement() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [companyToDelete, setCompanyToDelete] = useState<Company | null>(null);

  // Simulate data loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setCompanies(MOCK_COMPANIES);
      setIsLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  const pendingCompanies = companies.filter((c) => !c.approved);
  const approvedCompanies = companies.filter((c) => c.approved);

  const handleApprove = (company: Company) => {
    setCompanies(
      companies.map((c) =>
        c.id === company.id ? { ...c, approved: true } : c,
      ),
    );
    toast.success(`${company.razon_social} ha sido aprobada`);
  };

  const handleDeleteClick = (company: Company) => {
    setCompanyToDelete(company);
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = () => {
    if (companyToDelete) {
      setCompanies(companies.filter((c) => c.id !== companyToDelete.id));
      toast.success(`${companyToDelete.razon_social} ha sido eliminada`);
      setIsDeleteOpen(false);
      setCompanyToDelete(null);
    }
  };

  const handleViewDetail = (company: Company) => {
    setSelectedCompany(company);
    setIsDetailOpen(true);
  };

  const LoadingTable = () => (
    <div className="space-y-4">
      {Array(5)
        .fill(0)
        .map((_, i) => (
          <div key={i} className="flex gap-4 p-4">
            <Skeleton className="h-12 w-12 rounded" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
        ))}
    </div>
  );

  const EmptyState = ({
    icon: Icon,
    title,
    description,
  }: {
    icon: React.ReactNode;
    title: string;
    description: string;
  }) => (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="text-muted-foreground mb-4">{Icon}</div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );

  const CompaniesTable = ({ companies: data }: { companies: Company[] }) => (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="font-semibold">Empresa</TableHead>
            <TableHead className="font-semibold">Email</TableHead>
            <TableHead className="font-semibold">Teléfono</TableHead>
            <TableHead className="font-semibold">Sector</TableHead>
            <TableHead className="text-right font-semibold">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((company) => (
            <TableRow key={company.id} className="hover:bg-muted/50">
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                    <Building2 className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">
                      {company.razon_social}
                    </p>
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-sm">{company.email}</TableCell>
              <TableCell className="text-sm">
                {company.telefono_contacto}
              </TableCell>
              <TableCell className="text-sm">
                {company.sector && (
                  <Badge variant="secondary">{company.sector}</Badge>
                )}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  {!company.approved && (
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => handleApprove(company)}
                      className="gap-2"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Aprobar
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleViewDetail(company)}
                  >
                    Ver
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDeleteClick(company)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="space-y-8">
            <div className="space-y-2">
              <Skeleton className="h-8 w-1/4" />
              <Skeleton className="h-4 w-1/3" />
            </div>
            <LoadingTable />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8 space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Gestión de empresas
          </h1>
          <p className="text-muted-foreground">
            Administra empresas pendientes de aprobación y empresas registradas
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pendientes de aprobación
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">
                {pendingCompanies.length}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Requieren revisión
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Empresas aprobadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {approvedCompanies.length}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Activas en la plataforma
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total de empresas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">
                {companies.length}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                En el sistema
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="pending" className="relative">
              Pendientes
              {pendingCompanies.length > 0 && (
                <Badge
                  variant="destructive"
                  className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                >
                  {pendingCompanies.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="approved">Registradas</TabsTrigger>
          </TabsList>

          {/* Pending Approval Tab */}
          <TabsContent value="pending" className="space-y-6">
            {pendingCompanies.length === 0 ? (
              <Card className="border-amber-200 bg-amber-50/50">
                <CardContent className="pt-6">
                  <EmptyState
                    icon={<CheckCircle className="h-12 w-12 text-green-600" />}
                    title="Sin empresas pendientes"
                    description="Todas las empresas han sido aprobadas"
                  />
                </CardContent>
              </Card>
            ) : (
              <Card className="border-orange-200 bg-orange-50/30">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-orange-600" />
                    <CardTitle className="text-base">
                      Empresas pendientes de aprobación
                    </CardTitle>
                  </div>
                  <CardDescription>
                    {pendingCompanies.length}{" "}
                    {pendingCompanies.length === 1
                      ? "empresa requiere"
                      : "empresas requieren"}{" "}
                    tu revisión
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <CompaniesTable companies={pendingCompanies} />
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Approved Tab */}
          <TabsContent value="approved" className="space-y-6">
            {approvedCompanies.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <EmptyState
                    icon={
                      <Building2 className="h-12 w-12 text-muted-foreground" />
                    }
                    title="Sin empresas registradas"
                    description="No hay empresas aprobadas en el sistema"
                  />
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">
                      Empresas registradas
                    </CardTitle>
                    <Badge variant="outline">{approvedCompanies.length}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <CompaniesTable companies={approvedCompanies} />
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Detalle de empresa</DialogTitle>
          </DialogHeader>
          {selectedCompany && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-1">
                  Razón social
                </h3>
                <p className="font-medium">{selectedCompany.razon_social}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-1">
                    Email
                  </h3>
                  <p className="text-sm">{selectedCompany.email}</p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-1">
                    Teléfono
                  </h3>
                  <p className="text-sm">{selectedCompany.telefono_contacto}</p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-1">
                  Dirección
                </h3>
                <p className="text-sm">{selectedCompany.direccion}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-1">
                    Sector
                  </h3>
                  <p className="text-sm">
                    {selectedCompany.sector || "No especificado"}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-1">
                    Estado
                  </h3>
                  <Badge
                    variant={
                      selectedCompany.approved ? "default" : "destructive"
                    }
                  >
                    {selectedCompany.approved ? "Aprobada" : "Pendiente"}
                  </Badge>
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setIsDetailOpen(false)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>¿Eliminar empresa?</DialogTitle>
            <DialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente{" "}
              <span className="font-semibold text-foreground">
                {companyToDelete?.razon_social}
              </span>{" "}
              del sistema.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-3 sm:gap-0">
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
