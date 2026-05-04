import type { GenericType } from "./GenericType";
import type { LocalidadResponse } from "./Localidad";

export interface EmpresaResponse {
  id: number;
  razon_social: string;
  descripcion?: string;
  logo?: string;
  email?: string;
  email_confirmado?: boolean;
  email_confirmardo?: boolean;
  sector: GenericType;
  localidad: LocalidadResponse;
  readOnly?: boolean;
  aprobada?: boolean;
  eliminado?: boolean;
  fecha_eliminado?: string | null;
  fecha_registro?: string;
  cuit?: string;
  telefono_contacto?: string;
  direccion?: string;
  user?: number;
}

export interface EmpresaWrite {
  razon_social: string;
  cuit: string;
  descripcion?: string;
  email: string;
  password: string;
  password2: string;
  telefono_contacto: string;
  direccion: string;
  logo?: File;
  localidad: number;
  sector: number;
}

export type EmpresaUpdate = Partial<Omit<EmpresaResponse, "id">> & {
  id: number;
};

// Aliases for backward compatibility
export type CompanyResponse = EmpresaResponse;
export type Company = EmpresaResponse;
