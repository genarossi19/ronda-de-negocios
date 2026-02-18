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

export default function App() {
  return (
    <AuthProvider>
      <BookingProvider>
        <CompanyProvider>
          <div className="min-h-screen bg-background">
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
              <Route path="/test" element={<Test />} />
            </Routes>
          </div>
        </CompanyProvider>
      </BookingProvider>
    </AuthProvider>
  );
}
