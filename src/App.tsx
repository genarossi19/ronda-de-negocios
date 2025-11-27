import { CompanyProvider } from "../src/context/CompanyContext";
import Landing from "../src/pages/Landing";
import Companies from "../src/pages/Companies";
import CompanyDetail from "../src/pages/CompanyDetail";
import { Routes, Route } from "react-router";
import Register from "./pages/RegisterStep";
import Shifts from "./pages/Shifts";
import { BookingProvider } from "./context/BookingContext";
import { AuthProvider } from "./context/AuthContext";
import Login from "./pages/Login";
import Tables from "./pages/Tables";

export default function App() {
  return (
    <AuthProvider>
      <BookingProvider>
        <CompanyProvider>
          <div className="min-h-screen bg-background">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<Landing />} />
              <Route path="/companies" element={<Companies />} />
              <Route path="/companies/:id" element={<CompanyDetail />} />
              <Route path="/register" element={<Register />} />
              <Route path="/turnos" element={<Shifts />} />
              <Route path="/mesas" element={<Tables shiftId={"1"} />} />
            </Routes>
          </div>
        </CompanyProvider>
      </BookingProvider>
    </AuthProvider>
  );
}
