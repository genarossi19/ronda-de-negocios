"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

export interface Company {
  id: string;
  name: string;
  description: string;
  email: string;
  contactName: string;
  phone: string;
  sector: string;
  province: string;
  logo: string;
}

interface CompanyContextType {
  companies: Company[];
  addCompany: (company: Omit<Company, "id">) => void;
  getCompany: (id: string) => Company | undefined;
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

export function CompanyProvider({ children }: { children: ReactNode }) {
  const [companies, setCompanies] = useState<Company[]>([
    {
      id: "1",
      name: "TechSolutions SA",
      description: "Soluciones tecnológicas innovadoras para empresas",
      email: "contacto@techsolutions.com",
      contactName: "María González",
      phone: "+54 11 4567-8900",
      sector: "Tecnología",
      province: "Buenos Aires",
      logo: "/tech-company-logo.jpg",
    },
    {
      id: "2",
      name: "AgroIndustrias del Sur",
      description: "Producción y comercialización de productos agrícolas",
      email: "info@agroindustrias.com",
      contactName: "Carlos Rodríguez",
      phone: "+54 2392 123456",
      sector: "Agropecuario",
      province: "Buenos Aires",
      logo: "/agriculture-company-logo.jpg",
    },
    {
      id: "3",
      name: "Constructora Moderna",
      description: "Construcción de obras civiles e infraestructura",
      email: "ventas@constructoramoderna.com",
      contactName: "Juan Pérez",
      phone: "+54 11 5555-1234",
      sector: "Construcción",
      province: "Buenos Aires",
      logo: "/construction-company-logo.png",
    },
    {
      id: "4",
      name: "Servicios Financieros Plus",
      description: "Asesoramiento financiero y gestión de inversiones",
      email: "contacto@sfplus.com",
      contactName: "Ana Martínez",
      phone: "+54 11 6789-0123",
      sector: "Servicios Financieros",
      province: "Buenos Aires",
      logo: "/finance-company-logo.png",
    },
  ]);

  const addCompany = (company: Omit<Company, "id">) => {
    const newCompany = {
      ...company,
      id: Date.now().toString(),
    };
    setCompanies([...companies, newCompany]);
  };

  const getCompany = (id: string) => {
    return companies.find((c) => c.id === id);
  };

  return (
    <CompanyContext.Provider value={{ companies, addCompany, getCompany }}>
      {children}
    </CompanyContext.Provider>
  );
}

export function useCompanies() {
  const context = useContext(CompanyContext);
  if (!context) {
    throw new Error("useCompanies must be used within CompanyProvider");
  }
  return context;
}
