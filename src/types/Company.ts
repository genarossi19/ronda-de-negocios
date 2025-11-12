import type { GenericType } from "./GenericType";
import type { Localidad } from "./Localidad";

export interface CompanyType {
  id: number;
  email: string;
  nombre_contacto: string;
  apellido_contacto: string;
  password: string;
  password2: string;

  razon_social: string;
  cuit: string;
  email_empresa: string;
  telefono_contacto: string;
  descripcion: string;
  direccion: string;
  logo: File | null;
  localidad: number;
  sector: number;
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
