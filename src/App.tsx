"use client";

import { CompanyProvider } from "../src/context/CompanyContext";
import Landing from "../src/pages/Landing";
import Companies from "../src/pages/Companies";
import CompanyDetail from "../src/pages/CompanyDetail";
import { Routes, Route } from "react-router";

export default function App() {
  return (
    <CompanyProvider>
      <div className="min-h-screen bg-background">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/companies" element={<Companies />} />
          <Route path="/company/:id" element={<CompanyDetail />} />
        </Routes>
      </div>
    </CompanyProvider>
  );
}
