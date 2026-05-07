import { CompanyProvider } from "../src/context/CompanyContext";
import { Routes, Route, useLocation, useNavigate } from "react-router";
import { BookingProvider } from "./context/BookingContext";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { MotionPreferencesProvider } from "./context/MotionPreferencesContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { useAuth } from "./hooks/useAuth";
import { useSessionExpiryGuard } from "./hooks/useSessionExpiryGuard";
import { Toaster } from "./components/ui/sonner";
import { lazy, Suspense, useEffect } from "react";

const Landing = lazy(() => import("../src/pages/Landing"));
const Empresas = lazy(() => import("./pages/Empresas"));
const EmpresasDetail = lazy(() => import("./pages/EmpresasDetail"));
const Register = lazy(() => import("./pages/RegisterStep"));
const Shifts = lazy(() => import("./pages/Shifts"));
const Login = lazy(() => import("./pages/Login"));
const Tables = lazy(() => import("./pages/Tables"));
const Test = lazy(() => import("./pages/Test"));
const Dashboard = lazy(() => import("./pages/admin/Dashboard"));
const CompaniesManagement = lazy(
  () => import("./pages/admin/CompaniesManagement"),
);
const GestionarRondas = lazy(() => import("./pages/admin/GestionarRondas"));
const GestionarTurnos = lazy(() => import("./pages/admin/GestionarTurnos"));
const MeetingsSummary = lazy(() => import("./pages/admin/MeetingsSummary"));
const GestionarOtros = lazy(() => import("./pages/admin/GestionarOtros"));
const Representantes = lazy(() => import("./pages/Representantes"));
const NotFound = lazy(() => import("./pages/NotFound"));
const ValidarEmail = lazy(() => import("./pages/ValidarEmail"));
const VerificarEmailRepresentante = lazy(
  () => import("./pages/VerificarEmailRepresentante"),
);
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Settings = lazy(() => import("./pages/Settings"));
const RegisterSuccess = lazy(() => import("./pages/RegisterSuccess"));
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
  useSessionExpiryGuard();

  return (
    <ThemeProvider>
      <AuthRedirectHandler />
      <Suspense fallback={null}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/olvide-contraseña" element={<ForgotPassword />} />
          <Route
            path="/reset-password/:uidb/:token"
            element={<ResetPassword />}
          />
          <Route path="/" element={<Landing />} />
          <Route path="/empresas" element={<Empresas />} />
          <Route path="/empresas/:id" element={<EmpresasDetail />} />
          <Route path="/register" element={<Register />} />
          <Route path="/register-success" element={<RegisterSuccess />} />
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
            path="/panel-administrador/gestionar-rondas"
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
          <Route
            path="/panel-administrador/otros"
            element={
              <ProtectedRoute requiredAdmin>
                <GestionarOtros />
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
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </ThemeProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BookingProvider>
        <CompanyProvider>
          <MotionPreferencesProvider>
            {/* Quitamos el bg-background de aquí si ya lo pusiste en el CSS del body.
               Si lo dejas aquí, el padding del body siempre mostrará el color de "atrás".
            */}
            <div className="min-h-screen">
              <AppRoutes />
            </div>
            <Toaster richColors position="top-right" closeButton />
          </MotionPreferencesProvider>
        </CompanyProvider>
      </BookingProvider>
    </AuthProvider>
  );
}
