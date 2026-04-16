import { CompanyProvider } from "../src/context/CompanyContext";
import Landing from "../src/pages/Landing";
import Empresas from "./pages/Empresas";
import EmpresasDetail from "./pages/EmpresasDetail";
import { Routes, Route, useLocation, useNavigate } from "react-router";
import Register from "./pages/RegisterStep";
import Shifts from "./pages/Shifts";
import { BookingProvider } from "./context/BookingContext";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import Login from "./pages/Login";
import Tables from "./pages/Tables";
import Test from "./pages/Test";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { useAuth } from "./hooks/useAuth";
import Dashboard from "./pages/admin/Dashboard";
import CompaniesManagement from "./pages/admin/CompaniesManagement";
import GestionarRondas from "./pages/admin/GestionarRondas";
import GestionarTurnos from "./pages/admin/GestionarTurnos";
import MeetingsSummary from "./pages/admin/MeetingsSummary";
import Representantes from "./pages/Representantes";
import NotFound from "./pages/NotFound";
import { Toaster } from "./components/ui/sonner";
import ValidarEmail from "./pages/ValidarEmail";
import VerificarEmailRepresentante from "./pages/VerificarEmailRepresentante";
import { useEffect } from "react";
import {
  AUTH_SESSION_EXPIRED_EVENT,
  SESSION_EXPIRED_MESSAGE,
  SESSION_EXPIRED_REASON,
} from "./lib/axios";

type SessionExpiredEventDetail = {
  message?: string;
  reason?: string;
};

function AuthRedirectHandler() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleSessionExpired = (event: Event) => {
      event.preventDefault();

      const customEvent = event as CustomEvent<SessionExpiredEventDetail>;
      const reason = customEvent.detail?.reason ?? SESSION_EXPIRED_REASON;
      const message = customEvent.detail?.message ?? SESSION_EXPIRED_MESSAGE;

      navigate(`/login?reason=${reason}`, {
        replace: true,
        state: {
          sessionExpired: true,
          message,
          redirectedFrom: location.pathname,
        },
      });
    };

    window.addEventListener(
      AUTH_SESSION_EXPIRED_EVENT,
      handleSessionExpired as EventListener,
    );

    return () => {
      window.removeEventListener(
        AUTH_SESSION_EXPIRED_EVENT,
        handleSessionExpired as EventListener,
      );
    };
  }, [location.pathname, navigate]);

  return null;
}

function AppRoutes() {
  useAuth();

  return (
    <ThemeProvider>
      <AuthRedirectHandler />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Landing />} />
        <Route path="/empresas" element={<Empresas />} />
        <Route path="/empresas/:id" element={<EmpresasDetail />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/verificar-email/:uidb64/:token"
          element={<ValidarEmail />}
        />
        <Route
          path="/verificar-email-representante/:uidb64/:token"
          element={<VerificarEmailRepresentante />}
        />
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
            <ProtectedRoute requiredAdmin>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/gestionar-rondas"
          element={
            <ProtectedRoute requiredAdmin>
              <GestionarRondas />
            </ProtectedRoute>
          }
        />
        <Route
          path="/panel-administrador/empresas"
          element={
            <ProtectedRoute requiredAdmin>
              <CompaniesManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/panel-administrador/turnos/:eventoId"
          element={
            <ProtectedRoute requiredAdmin>
              <GestionarTurnos />
            </ProtectedRoute>
          }
        />
        <Route
          path="/panel-administrador/reuniones"
          element={
            <ProtectedRoute requiredAdmin>
              <MeetingsSummary />
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
    </ThemeProvider>
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
