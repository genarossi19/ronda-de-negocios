import type { GenericType } from "./GenericType";

export interface RepresentanteResponse {
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
  cargo: GenericType;
  empresa?: number;
}

export interface RepresentanteWrite {
  nombre: string;
  apellido: string;
  email: string;
  cargo: number;
  telefono?: string;
}

export type RepresentanteUpdate = Partial<
  Omit<RepresentanteResponse, "empresa">
> & { id: number };
