import type { GenericType } from "./GenericType";

export interface RepresentanteResponse {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  cargo: GenericType | number;
  empresa?: number;
  empresa_id?: number;
  empresa_nombre?: string;
  razon_social?: string;
  eliminado?: boolean;
  email_confirmado?: boolean;
}

export interface RepresentanteWrite {
  nombre: string;
  apellido: string;
  email: string;
  cargo: number;
}

export type RepresentanteUpdate = Partial<
  Omit<RepresentanteResponse, "empresa">
> & { id: number };
