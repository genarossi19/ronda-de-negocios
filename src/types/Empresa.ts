import type { GenericType } from "./GenericType";
import type { LocalidadResponse } from "./Localidad";

export interface EmpresaResponse {
  id: number;
  razon_social: string;
  descripcion?: string;
  logo?: string;
  sector: GenericType;
  localidad: LocalidadResponse;
  readOnly?: boolean;
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
