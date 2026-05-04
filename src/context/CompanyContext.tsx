import { createContext, useContext, useState, type ReactNode } from "react";
import type { CompanyResponse } from "../types/Empresa";

// export interface Company {
//   id: string;
//   name: string;
//   description: string;
//   email: string;
//   contactName: string;
//   phone: string;
//   sector: string;
//   province: string;
//   logo: string;
// }

interface CompanyContextType {
  companies: CompanyResponse[];
  addCompany: (company: Omit<CompanyResponse, "id">) => void;
  getCompany: (id: number) => CompanyResponse | undefined;
  error: string | null;
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

export function CompanyProvider({ children }: { children: ReactNode }) {
  const [companies, setCompanies] = useState<CompanyResponse[]>([
    {
      id: 1,
      cuit: "41243129343",
      razon_social: "TechSolutions SA",
      descripcion: "Soluciones tecnológicas innovadoras para empresas",

      sector: {
        id: 1,
        nombre: "Logistica",
      },
      localidad: {
        id: 1,
        nombre: "Trenque lauquen",
        provincia: {
          id: 1,
          nombre: "Buenos aires",
        },
      },
      logo: "/tech-company-logo.jpg",
    },
    {
      id: 2,
      razon_social: "AgroIndustrias del Sur",
      descripcion: "Producción y comercialización de productos agrícolas",
      cuit: "1111111111",
      sector: {
        id: 2,
        nombre: "Agro",
      },
      localidad: {
        id: 1,
        nombre: "Trenque lauquen",
        provincia: {
          id: 1,
          nombre: "Buenos aires",
        },
      },
      logo: "/agriculture-company-logo.jpg",
    },
    // {
    //   id: "3",
    //   name: "Constructora Moderna",
    //   description: "Construcción de obras civiles e infraestructura",
    //   email: "ventas@constructoramoderna.com",
    //   contactName: "Juan Pérez",
    //   phone: "+54 11 5555-1234",
    //   sector: "Construcción",
    //   province: "Buenos Aires",
    //   logo: "/construction-company-logo.png",
    // },
    // {
    //   id: "4",
    //   name: "Servicios Financieros Plus",
    //   description: "Asesoramiento financiero y gestión de inversiones",
    //   email: "contacto@sfplus.com",
    //   contactName: "Ana Martínez",
    //   phone: "+54 11 6789-0123",
    //   sector: "Servicios Financieros",
    //   province: "Buenos Aires",
    //   logo: "/finance-company-logo.png",
    // },
  ]);

  const [error] = useState<string | null>(null);

  const addCompany = (company: Omit<CompanyResponse, "id">) => {
    const newCompany = {
      ...company,
      id: companies.length + 1,
    };
    setCompanies([...companies, newCompany]);
  };

  const getCompany = (id: number) => {
    return companies.find((c) => c.id === id);
  };

  return (
    <CompanyContext.Provider
      value={{ companies, addCompany, getCompany, error }}
    >
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
