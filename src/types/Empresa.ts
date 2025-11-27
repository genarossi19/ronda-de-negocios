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
  descripcion?: string;
  sector: number;
  localidad: number;
}

export type EmpresaUpdate = Partial<Omit<EmpresaResponse, "id">> & {
  id: number;
};
