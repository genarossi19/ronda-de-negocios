"use client";

import { useState, useEffect } from "react";
import { CompanyProvider } from "../src/context/CompanyContext";
import Landing from "../src/pages/Landing";
import Register from "../src/pages/Register";
import Companies from "../src/pages/Companies";
import CompanyDetail from "../src/pages/CompanyDetail";

export default function App() {
  const [currentPage, setCurrentPage] = useState("landing");
  const [companyId, setCompanyId] = useState<string | null>(null);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1) || "landing";
      const [page, id] = hash.split("/");
      setCurrentPage(page);
      setCompanyId(id || null);
    };

    handleHashChange();
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const renderPage = () => {
    switch (currentPage) {
      case "register":
        return <Register />;
      case "companies":
        return <Companies />;
      case "company":
        return <CompanyDetail companyId={companyId} />;
      default:
        return <Landing />;
    }
  };

  return (
    <CompanyProvider>
      <div className="min-h-screen bg-background">{renderPage()}</div>
    </CompanyProvider>
  );
}
