import { CompanyProvider } from "../src/context/CompanyContext";
import Landing from "../src/pages/Landing";
import Empresas from "./pages/Empresas";
import EmpresasDetail from "./pages/EmpresasDetail";
import { Routes, Route } from "react-router";
import Register from "./pages/RegisterStep";
import Shifts from "./pages/Shifts";
import { BookingProvider } from "./context/BookingContext";
import { AuthProvider } from "./context/AuthContext";
import Login from "./pages/Login";
import Tables from "./pages/Tables";
import Test from "./pages/Test";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { useAuth } from "./hooks/useAuth";
import Dashboard from "./pages/admin/Dashboard";
import Representantes from "./pages/Representantes";
import NotFound from "./pages/NotFound";
import { Toaster } from "./components/ui/sonner";

function AppRoutes() {
  useAuth();

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Landing />} />
      <Route path="/empresas" element={<Empresas />} />
      <Route path="/empresas/:id" element={<EmpresasDetail />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/turnos"
        element={
          <ProtectedRoute>
            <Shifts />
          </ProtectedRoute>
        }
      />
      <Route
        path="/mesas/:id"
        element={
          <ProtectedRoute>
            <Tables />
          </ProtectedRoute>
        }
      />
      <Route
        path="/panel-administrador"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route path="/test" element={<Test />} />
      <Route
        path="/representantes"
        element={
          <ProtectedRoute>
            <Representantes />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BookingProvider>
        <CompanyProvider>
          {/* Quitamos el bg-background de aquí si ya lo pusiste en el CSS del body.
             Si lo dejas aquí, el padding del body siempre mostrará el color de "atrás".
          */}
          <div className="min-h-screen">
            <AppRoutes />
          </div>
          <Toaster richColors position="top-right" closeButton />
        </CompanyProvider>
      </BookingProvider>
    </AuthProvider>
  );
}
