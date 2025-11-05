import type { GenericType } from "./GenericType";
import type { Localidad } from "./Localidad";

export interface CompanyType {
  id: number;
  razon_social: string;
  cuit: string;
  descripcion: string;
  logo: string;
  localidadId: number;
  sectorId: number;
}

export interface CompanyResponse {
  id: number;
  razon_social: string;
  cuit: string;
  descripcion: string;
  logo: string;
  localidad: Localidad;
  sector: GenericType;
}
